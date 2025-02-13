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
            case "title": {
                const title = pdfConfiguration.issueUrl && pdfConfiguration.idReadable ? [{
                    text: pdfConfiguration.idReadable + ':',
                    link: pdfConfiguration.issueUrl,
                    decoration: "underline",
                    color: '#d671b3',
                }, ' ' + pdfConfiguration.title] : [pdfConfiguration.title]
                return {...section, text: pdfConfiguration.include_title ? title : ''}
            }
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
                const extraFields = pdfConfiguration.include_body ? parseCustomTextFields(pdfConfiguration.customFields, !pdfConfiguration.include_attachments) : []
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

function parseCustomTextFields(customFields: CustomField[], removeImages: boolean = false) {
    let result: object[] = []
    const textFields = customFields.filter(f => f.$type === 'TextIssueCustomField' && f.included)
    for (const field of textFields) {
        if (field.value) {
            const rendered = processMarkdown((field.value as TextFieldValue).text, removeImages)
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
    const dateTimeOptions = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'} as Intl.DateTimeFormatOptions;
    const lang = YTApp.locale === 'de' ? 'de-DE' : 'en-US'
    const date = comment.created ? new Date(comment.created).toLocaleString(lang, dateTimeOptions) : ""
    return {
        nodeName: "COMMENT",
        style: 'commentBox',
        table: {
            widths: [500],
            body: [
                [{
                    stack: [
                        {
                            text: [{text: comment.author.fullName, style: "commentAuthor"}, {text: "   " + date + "\n", style: "commentDate"}],
                            alignment: "left",
                            marginBottom: 4,
                        },
                        {
                            stack: reworkDoc(processMarkdown(comment.text, removeImages)),
                            style: "commentText",
                            alignment: "left",
                        }
                    ],

                }],
            ]
        },
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
    return content.map((node: DocNode) => {
        return checkRecursive(node)
    })
}

function checkRecursive(node: DocNode) {
    if (Array.isArray(node)) {
        (node as DocNode[]).forEach(checkRecursive)
    } else {
        node = checkImage(node)
        node = checkMargin(node)
        node = checkCodeParent(node)
        node = checkCode(node)

        if (node.stack) node.stack = node.stack.map(checkRecursive)  // ggf. mit map zuweisen
        if (node.text) {
            if (Array.isArray(node.text)) node.text = node.text.map(checkRecursive)
        }
    }
    return node;
}

function checkImage(n: DocNode) {
    if (n.nodeName === "IMG") {
        n.image = n.image?.replace('.', '')
        n.width = 300
    }
    return n
}

function checkMargin(n: DocNode) {
    if (n.margin) {
        if (Array.isArray(n.margin)) {
            if (n.margin.length === 4) {
                n.margin[1] = 0
                n.margin[3] = 0
            }
        }
    }
    return n
}

function checkCodeParent(n: DocNode): DocNode {
    if (n.nodeName === "PRE") {
        if (Array.isArray(n.text)) {
            n.stack = n.text
            n.text = []
        }
    }
    return n
}

function checkCode(n: DocNode) {
    if (n.nodeName === "CODE") {
        if (typeof n.text === 'string') return codeBox(n.text)
    }
    return n
}

function codeBox(text: string): DocNode {
    return {
        nodeName: "CODE",
        style: 'codeBox',
        table: {
            body: [
                [text],
            ]
        }
    }
}


export {getCollapseValue, getToggledCollapseValue, applyHeaders, applyContents, applyFooter, applyImages, reworkDoc}
