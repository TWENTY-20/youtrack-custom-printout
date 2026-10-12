import markdownit from 'markdown-it'
import htmlToPdfMake from 'html-to-pdfmake'

export function processMarkdown(body: string | undefined | null, removeImages: boolean): [] {
    let raw = body ?? "" ;
    // removes markdown image tags if attachments should not be included
    if (removeImages) raw = raw.replace(/!\[.*?]\((.*?)\)/g, '')
    // removes markdown svg image tags, because svgs are not supported by pdfmake
    raw = raw.replace(/!\[[^\]]*]\(([^)]+\.svg)\)/g, '')
    raw = raw.replace(/\{width=(.*?)}/g, '')
    const markdownParser = markdownit()
    const html = markdownParser.render(raw)
    return htmlToPdfMake(html) as [];
}
