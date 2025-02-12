import {Attachment, Collapse, CustomField, CustomFieldValue, DocNode, IssueComment, PdfConfiguration, PdfSection, PeriodFieldValue, Section, TextFieldValue, TextSection} from "./types.ts";
import {processMarkdown} from "./MarkdownParser.ts";
import YTApp from "./youTrackApp.ts";

function getCollapseValue(section: PdfSection, collapse: Collapse) {
    switch (section) {
        case PdfSection.HEADER:
            return collapse.header
        case PdfSection.TITLE:
            return collapse.title
        case PdfSection.BODY:
            return collapse.body
        case PdfSection.CUSTOM_FIELDS:
            return collapse.customFields
        case PdfSection.COMMENTS:
            return collapse.comments
        case PdfSection.FOOTER:
            return collapse.footer
    }
}


function getToggledCollapseValue(section: PdfSection, collapse: Collapse): Collapse {
    const cleared = {
        header: true,
        title: true,
        body: true,
        customFields: true,
        comments: true,
        footer: true
    }
    switch (section) {
        case PdfSection.HEADER:
            return {...cleared, header: !collapse.header};
        case PdfSection.TITLE:
            return {...cleared, title: !collapse.title};
        case PdfSection.BODY:
            return {...cleared, body: !collapse.body};
        case PdfSection.CUSTOM_FIELDS:
            return {...cleared, customFields: !collapse.customFields};
        case PdfSection.COMMENTS:
            return {...cleared, comments: !collapse.comments}
        case PdfSection.FOOTER:
            return {...cleared, footer: !collapse.footer};
    }
}

function applyHeaders(headers: TextSection[], pdfConfig: PdfConfiguration): TextSection[] {
    return headers.map((section): TextSection => {
        switch (section.style) {
            case "header_left":
                return {...section, text: pdfConfig.include_header ? pdfConfig.header_left : ""}
            case "header_right":
                return {...section, text: pdfConfig.include_header ? pdfConfig.header_right : ""}
            case "header_center":
                return {...section, text: pdfConfig.include_header ? pdfConfig.header_center : ""}
            default:
                return {...section, text: ""}
        }
    })
}

function applyContents(contents: Section[], pdfConfiguration: PdfConfiguration, t: (s: string) => string) {
    const textFieldName = 'TextIssueCustomField'
    return contents.map((section) => {
        switch (section.style) {
            case "title":
                return {...section, text: pdfConfiguration.include_title ? pdfConfiguration.title : ''}
            case "fieldsTable": {
                if (!pdfConfiguration.include_customFields) return {...section, table: {body: [[]]}}
                const fields = pdfConfiguration.customFields.filter(f => f.included && f.$type !== textFieldName).map((field) => {
                    let value = '?'
                    if (field.value) {
                        value = extractValueAsString(field)
                    }
                    return [field.name, value]
                })
                return pdfConfiguration.include_customFields ? {
                    ...section, table: {
                        widths: [150, 350],
                        body: [
                            [t('field'), t('value')],
                            ...fields
                        ]
                    }
                } : {}
            }
            case "body": {
                const content = pdfConfiguration.include_body ? processMarkdown(pdfConfiguration.body, !pdfConfiguration.include_attachments) : []
                const extraFields = parseCustomTextFields(pdfConfiguration.customFields)
                return {...section, stack: [...content, ...extraFields]}
            }
            case "commentsTitle": {
                return {...section, text: pdfConfiguration.include_comments && pdfConfiguration.comments.length > 0 ? t('comments') : ''}
            }
            case "commentBlock": {
                const comments = pdfConfiguration.comments.map((c) => comment(c, !pdfConfiguration.include_attachments))
                return {...section, stack: pdfConfiguration.include_comments ? comments : []}
            }
            default:
                return {...section, text: ""}
        }
    })
}

function parseCustomTextFields(customFields: CustomField[]) {
    let result: object[] = []
    const textFields = customFields.filter(f => f.$type === 'TextIssueCustomField' && f.included)
    for (const field of textFields) {
        if (field.value) {
            const rendered = processMarkdown((field.value as TextFieldValue).text, false)
            const heading = h2(field.name)
            result = [...result, heading, ...rendered]
        }
    }
    return result
}

function h2(name: string) {
    return {
        text: name,
        style: "textFieldHeading",
        alignment: "left"
    }
}


function extractValueAsString(cf: CustomField) {
    const single = /^Single/;
    const multi = /^Multi/;
    const simple = 'SimpleIssueCustomField'
    const period = 'PeriodIssueCustomField'
    const date = 'DateIssueCustomField'
    const state = 'StateIssueCustomField'
    const lang = YTApp.locale === 'de' ? 'de-DE' : 'en-US'
    const dateOptions = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'} as Intl.DateTimeFormatOptions;
    const dateTimeOptions = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'} as Intl.DateTimeFormatOptions;


    if (single.test(cf.$type) || cf.$type === state) {
        return (cf.value as CustomFieldValue).name
    } else if (multi.test(cf.$type)) {
        if ((cf.value as CustomFieldValue[]).length === 0) return "?"
        return (cf.value as CustomFieldValue[]).map(v => v.name).join(', ')
    } else if (cf.$type === simple) {
        switch (typeof cf.value) {
            case 'string':
                return cf.value
            case 'number':
                if (cf.value > 1000000000000) {
                    return new Date(cf.value).toLocaleString(lang, dateTimeOptions)
                }
                return cf.value.toString()
            default:
                return "?"
        }
    } else if (cf.$type === period) {
        return (cf.value as PeriodFieldValue).presentation
    } else if (cf.$type === date) {
        if (typeof cf.value === 'number') {
            return new Date(cf.value).toLocaleString(lang, dateOptions)
        } else return '?'
    } else {
        return "?"
    }
}

function comment(comment: IssueComment, removeImages: boolean) {
    return {
        stack: [
            {
                text: comment.author.fullName + "\n",
                style: "commentAuthor",
                alignment: "left",
            },
            {
                stack: processMarkdown(comment.text, removeImages),
                style: "commentText",
                alignment: "left",
            }
        ],
        marginBottom: 10
    }
}

function applyFooter(pageNumbering: boolean) {
    return pageNumbering ?
        function (currentPage: any, pageCount: any) {
            return {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                text: currentPage.toString() + ' / ' + pageCount,
                alignment: 'center',
            }
        }
        : ""
}

function applyImages(attachments: Attachment[]): object {
    const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg'] // todo 'image/svg+xml'
    const filteredAttachments = attachments.filter(a => IMAGE_MIME_TYPES.includes(a.mimeType))
    return filteredAttachments.reduce((o, current) => ({...o, [current.name.replace('.', '')]: current.base64Content}), {})
}

function reworkDoc(content: DocNode[]) {
    content.forEach((node: DocNode) => {
        if (node.nodeName === "IMG") {
            node.image = node.image?.replace('.', '')
        }
        if (node.margin) {
            if (Array.isArray(node.margin)) {
                if (node.margin.length === 4) {
                    node.margin[1] = 0
                    node.margin[3] = 0
                }
            }
        }
        checkRecursive(node) // For some reason, node will resolved as array instead of an object containing an array (like expected)
    })
}

function checkRecursive(node: DocNode) {
    if (Array.isArray(node)) {
        checkImage(node)
        checkRecursive(node)
    } else {
        if (node.stack) {
            checkImage(node.stack)
            checkMargin(node.stack)
        }
        if (node.text) {
            if (Array.isArray(node.text)) {
                checkMargin(node.text)
            }
        }
    }
}

function checkImage(list: DocNode[]) {
    list.forEach((n: DocNode) => {
        if (n.nodeName === "IMG") {
            n.image = n.image?.replace('.', '')
            n.width = 300
        }
        checkRecursive(n)
    })
}

function checkMargin(list: DocNode[]) {
    list.forEach((n: DocNode) => {
        if (n.margin) {
            if (Array.isArray(n.margin)) {
                if (n.margin.length === 4) {
                    n.margin[1] = 0
                    n.margin[3] = 0
                }
            }
        }
        checkRecursive(n)
    })
}

/*function checkCode(list: DocNode[]) {
    list.forEach((n: DocNode) => {

    })
}*/

export {getCollapseValue, getToggledCollapseValue, applyHeaders, applyContents, applyFooter, applyImages, reworkDoc}
