import {CustomField, CustomFieldValue, PeriodFieldValue, TextFieldValue} from "../../entities/youtrack.ts";
import {processMarkdown} from "../MarkdownParser.ts";
import YTApp from "../../youTrackApp.ts";
import {h2} from "./components.ts";

export function parseCustomTextFields(customFields: CustomField[], removeImages: boolean = false) {
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

export function extractValueAsString(cf: CustomField) {
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
