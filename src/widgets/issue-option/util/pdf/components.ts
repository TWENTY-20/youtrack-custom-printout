import {IssueComment} from "../../entities/youtrack.ts";
import YTApp from "../../youTrackApp.ts";
import {DocNode} from "../../entities/pdf.ts";
import {processMarkdown} from "../MarkdownParser.ts";
import {reworkDoc} from "./check.ts";

export function h2(name: string) {
    return {
        text: name,
        style: "textFieldHeading",
        alignment: "left"
    }
}

export function comment(comment: IssueComment, removeImages: boolean) {
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

export function codeBox(text: string): DocNode {
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
