import {AlertType} from "@jetbrains/ring-ui-built/components/alert/alert";
import {AlertItem} from "@jetbrains/ring-ui-built/components/alert-service/alert-service";
import {RequestParams} from "@jetbrains/ring-ui-built/components/http/http";
import {ReactNode} from "react";

export interface HttpHandler {
    endpoints: Array<Endpoint>;
}

export type Scope = "issue" | "project" | "article" | "user" | "global";
export type Method = "GET" | "POST" | "PUT" | "DELETE";

export type EndpointForScope<scope extends Scope> =
    scope extends "issue" ? { scope: "issue"; handle: (ctx: Context<"issue">) => void; } :
        scope extends "project" ? { scope: "project"; handle: (ctx: Context<"project">) => void; } :
            scope extends "article" ? { scope: "article"; handle: (ctx: Context<"article">) => void; } :
                scope extends "user" ? { scope: "user"; handle: (ctx: Context<"user">) => void; } :
                    { scope?: undefined, handle: (ctx: Context<"global">) => void }

export type Endpoint<scope extends Scope = Scope> = {
    method: Method;
    path: string;
} & EndpointForScope<scope>

export type ContextForScope<scope extends Scope> =
    scope extends "issue" ? { issue: any } :
        scope extends "project" ? { project: any } :
            scope extends "article" ? { article: any } :
                scope extends "user" ? { user: any } : {};

export type Context<scope extends Scope> = {
    request: Request
    response: Response
} & ContextForScope<scope>

export type Request = {
    body: string;
    bodyAsStream: ReadableStream<Uint8Array>;
    headers: Array<{ name: string, value: string }>;
    path: string;
    fullPath: string;
    method: Method;
    parameterNames: Array<string>;
    json(): any;
    getParameter(name: string): string | undefined;
    getParameter(name: string): Array<string>;
}

export type Response = {
    body: string;
    bodyAsStream: ReadableStream<Uint8Array>;
    code: number;
    json(object: any): void;
    text(string: string): string;
    addHeader(header: string, value: string): Response;
}

export interface Host {
    alert(message: ReactNode, type?: AlertType, timeout?: number, options?: Partial<AlertItem>): void;

    fetchYouTrack(relativeURL: string, requestParams?: RequestParams): Promise<any>;

    fetchApp(relativeURL: string, requestParams: RequestParams & { scope?: boolean }): Promise<any>;
}

export interface APIError {
    data: {
        error: string,
        error_description: string
    },
    message: string,
    status: number
}

export interface EventData {
    event: string;
    data?: string
}

export interface CacheResponse {
    id: string,
    attachmentId: string,
    edited: number,
    forArticle: boolean
}

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

}

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

export interface User{
    fullName : string
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

export enum PdfSection {
    HEADER = 'header',
    TITLE = 'title',
    BODY = 'body',
    CUSTOM_FIELDS = 'customFields',
    COMMENTS = 'comments',
    FOOTER = 'footer',
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

export interface SystemSettings{
    baseUrl: string,
}

