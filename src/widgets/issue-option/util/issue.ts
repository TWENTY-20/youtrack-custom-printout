import {Issue} from "../entities/youtrack.ts";
import YTApp, {host} from "../youTrackApp.ts";
import {PdfConfiguration} from "../entities/util.ts";
import {formatDistanceToNow} from "date-fns";
import {de} from "date-fns/locale/de";
import {enUS} from "date-fns/locale/en-US";

export const USER_FIELDS = "id,fullName"
export const ATTACHMENTS_FIELDS = "id,name,base64Content,mimeType"
export const CUSTOM_FIELDS_FIELDS = "id,name,value(name,presentation,text)"
export const PROJECT_FIELDS = "id,name"
export const COMMENTS_FIELDS = `id,text,created,author(${USER_FIELDS})`
export const ISSUE_FIELDS = `id,idReadable,description,summary,created,updated,reporter(${USER_FIELDS}),updater(${USER_FIELDS}),attachments(${ATTACHMENTS_FIELDS}),customFields(${CUSTOM_FIELDS_FIELDS}),project(${PROJECT_FIELDS}),comments(${COMMENTS_FIELDS})`

export function fetchIssue(id: string): Promise<Issue> {
    return host.fetchYouTrack(`issues/${id}?fields=${ISSUE_FIELDS}`)
}

export function parseIssue(issue: Issue, config: PdfConfiguration, t: (s: string) => string): PdfConfiguration {
    const lang = YTApp.locale === 'de' ? 'de-DE' : 'en-US'
    const locale = YTApp.locale === 'de' ? de : enUS
    const baseUrl = new URL(YTApp.me.avatarUrl).origin
    const issueUrl = baseUrl + '/issue/' + issue.idReadable
    issue.customFields.map((cf) => cf.included = true)
    return {
        ...config,
        title: issue.summary,
        body: issue.description,
        comments: issue.comments,
        attachments: issue.attachments,
        customFields: issue.customFields,
        idReadable: issue.idReadable,
        issueUrl: issueUrl,
        header_left: `${t('createdBy')} ${issue.reporter.fullName} ${t('vor')}${formatDistanceToNow(new Date(issue.created), {locale: locale})} ${t('ago')}`,
        header_center: `${t('updatedBy')} ${issue.updater.fullName} ${t('vor')}${formatDistanceToNow(new Date(issue.updated), {locale: locale})} ${t('ago')}`,
        header_right: new Date().toLocaleString(lang, {year: 'numeric', month: 'long', day: 'numeric'} as Intl.DateTimeFormatOptions),
    };
}
