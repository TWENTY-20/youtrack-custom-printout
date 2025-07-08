export enum PdfSection {
    HEADER = 'header',
    TITLE = 'title',
    BODY = 'body',
    CUSTOM_FIELDS = 'customFields',
    COMMENTS = 'comments',
    FOOTER = 'footer',
    ATTACHMENTS = 'attachments',
}

export interface Section {
    style: string
}

export interface TextSection extends Section {
    text: string,
    alignment: string
}

export interface DocNode {
    nodeName: string,
    text?: string | DocNode[],
    stack?: DocNode[]
    image?: string
    width?: number
    link?: string
    margin?: number | number[],
    table?: TableNode,
    style?: string

}

export interface TableNode {
    body: string[][]
    widths?: number[]
}
