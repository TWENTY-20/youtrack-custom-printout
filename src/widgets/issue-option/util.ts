import {host} from "./youTrackApp.ts";
import {Collapse, PdfConfiguration, PdfSection, TextSection, IssueComment, Section} from "./types.ts";

async function fetchAll<T>(path: string): Promise<T[]> {
    const result: T[] = []
    let stop = false
    let skip = 0;
    while (!stop) {
        const pager = `&$skip=${skip}&$top=50`
        const items = await host.fetchYouTrack(path + pager).then((items: T[]) => {
            return items
        })
        if (items.length < 50) stop = true
        result.push(...items)
        skip += 50

    }
    return result
}

async function fetchPaginated<T>(path: string, setter: (i: T[]) => void) {
    const result: T[] = []
    let stop = false
    let skip = 0;
    while (!stop) {
        const pager = `&$skip=${skip}&$top=50`
        const items = await host.fetchYouTrack(path + pager).then((items: T[]) => {
            return items
        })
        if (items.length < 50) stop = true
        result.push(...items)
        setter(result)
        skip += 50

    }
}

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

function getIncludeConfiguration(section: PdfSection, pdfConfiguration: PdfConfiguration, value: boolean) {
    switch (section) {
        case PdfSection.HEADER:
            return {...pdfConfiguration, include_header: value};
        case PdfSection.TITLE:
            return {...pdfConfiguration, include_title: value};
        case PdfSection.BODY:
            return {...pdfConfiguration, include_body: value};
        case PdfSection.CUSTOM_FIELDS:
            return {...pdfConfiguration, include_customFields: value};
        case PdfSection.COMMENTS:
            return {...pdfConfiguration, include_comments: value};
        case PdfSection.FOOTER:
            return {...pdfConfiguration, include_comments: value};
    }
}

function getIncludeValue(section: PdfSection, pdfConfiguration: PdfConfiguration) {
    switch (section) {
        case PdfSection.HEADER:
            return pdfConfiguration.include_header
        case PdfSection.TITLE:
            return pdfConfiguration.include_title
        case PdfSection.BODY:
            return pdfConfiguration.include_body
        case PdfSection.CUSTOM_FIELDS:
            return pdfConfiguration.include_customFields
        case PdfSection.COMMENTS:
            return pdfConfiguration.include_comments
        case PdfSection.FOOTER:
            return pdfConfiguration.include_footer
    }
}

function applyHeaders(headers: TextSection[], pdfConfig: PdfConfiguration): TextSection[] {
    return headers.map((section): TextSection => {
        switch (section.style) {
            case "header_left":
                return {...section, text: pdfConfig.header_left}
            case "header_right":
                return {...section, text: pdfConfig.header_right}
            case "header_center":
                return {...section, text: pdfConfig.header_center}
            default:
                return {...section, text: ""}
        }
    })
}

function applyContents(contents: Section[], pdfConfiguration: PdfConfiguration, t: (s: string) => string) {
    return contents.map((section) => {
        switch (section.style) {
            case "title":
                return {...section, text: pdfConfiguration.title}
            case "fieldsTable": {
                console.log(pdfConfiguration.customFields)
                const fields = pdfConfiguration.customFields.map((field) => {
                    let value = '?'
                    if (field.value) {
                        value = Array.isArray(field.value) ? (field.value.length === 0 ? '?' : field.value.map(v => v.name).join(', ')) : field.value.name
                    }
                    return [field.name, value]
                })
                return {
                    ...section, table: {
                        body: [
                            [t('field'), t('value')],
                            ...fields
                        ]
                    }
                }
            }
            case "body":
                return {...section, text: pdfConfiguration.body}
            case "commentsTitle":
                return {...section, text: t('comments')}
            case "commentBlock": {
                const comments = pdfConfiguration.comments.map((c) => comment(c))
                return {...section, text: comments}
            }
            default:
                return {...section, text: ""}
        }
    })
}

function comment(comment: IssueComment) {
    return {
        text: [
            {
                text: comment.author.fullName,
                style: "commentAuthor",
                alignment: "left"
            },
            {
                text: "\n",
                alignment: "left",
                style: ""
            },
            {
                text: comment.text,
                style: "commentText",
                alignment: "left"
            }
        ]
    }
}


export {fetchAll, fetchPaginated, getCollapseValue, getToggledCollapseValue, getIncludeConfiguration, getIncludeValue, applyHeaders, applyContents}
