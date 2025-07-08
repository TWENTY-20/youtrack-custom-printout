import {PdfConfiguration} from "../../entities/util.ts";
import templates from "../../templates.json"
import {Section, TextSection} from "../../entities/pdf.ts";
import {processMarkdown} from "../MarkdownParser.ts";
import {Attachment} from "../../entities/youtrack.ts";
import {extractValueAsString, parseCustomTextFields} from "./parse.ts";
import {comment} from "./components.ts";
import {reworkDoc} from "./check.ts";


export function applyPdfConfig(pdfConfiguration: PdfConfiguration, t: (s: string) => string) {
    const schema = templates.default_content_top;
    schema.header.columns = applyHeaders(schema.header.columns, pdfConfiguration)
    schema.content = applyContents(schema.content, pdfConfiguration, t) as []
    if (pdfConfiguration.include_attachments) {
        schema.images = applyImages(pdfConfiguration.attachments)
    } else {
        schema.images = {}
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    schema.footer = applyFooter(pdfConfiguration.include_footer)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    schema.content = reworkDoc(schema.content)
    return schema
}

export function applyHeaders(headers: TextSection[], pdfConfig: PdfConfiguration): TextSection[] {
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

export function applyContents(contents: Section[], pdfConfiguration: PdfConfiguration, t: (s: string) => string) {
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

export function applyFooter(pageNumbering: boolean) {
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

export function applyImages(attachments: Attachment[]): object {
    const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg']
    const filteredAttachments = attachments.filter(a => IMAGE_MIME_TYPES.includes(a.mimeType))
    return filteredAttachments.reduce((o, current) => ({...o, [current.name.replace('.', '')]: current.base64Content}), {})
}

