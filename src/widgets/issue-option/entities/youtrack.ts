export interface Issue {
    id: string,
    description: string,
    summary: string,
    attachments: Attachment[],
    customFields: CustomField[],
    project: Project,
    comments: IssueComment[],
    created: number,
    updated: number,
    reporter: User,
    updater: User,
    idReadable: string,
}

export interface User {
    fullName: string
}

export interface Project {
    id: string,
    name: string,
}

export interface Attachment {
    id: string,
    name: string,
    base64Content: string,
    mimeType: string,
    url: string
}

export interface CustomField {
    $type: string
    id: string,
    name: string,
    value: CustomFieldValue | CustomFieldValue[] | number | string | PeriodFieldValue | TextFieldValue,
    included: boolean,
}

export interface CustomFieldValue {
    name: string
}

export interface PeriodFieldValue {
    presentation: string
}

export interface TextFieldValue {
    text: string
}

export interface IssueComment {
    id: string,
    text: string,
    author: Author,
    created: number
}

export interface Author {
    fullName: string,
}
