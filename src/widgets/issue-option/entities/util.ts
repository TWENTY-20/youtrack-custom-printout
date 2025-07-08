import {Attachment, CustomField, IssueComment} from "./youtrack.ts";

export interface PdfConfiguration {
    include_header: boolean,
    include_title: boolean,
    include_body: boolean,
    include_customFields: boolean,
    include_comments: boolean,
    include_footer: boolean,
    include_attachments: boolean,
    header_left: string
    header_center: string
    header_right: string
    title: string
    body: string
    comments: IssueComment[]
    attachments: Attachment[]
    customFields: CustomField[]
    bodyBeforeCustomFields: boolean
    idReadable: string | undefined
    issueUrl: string | undefined
}

export interface Collapse {
    header: boolean
    title: boolean
    body: boolean
    customFields: boolean
    comments: boolean
    footer: boolean
    attachments: boolean
}
