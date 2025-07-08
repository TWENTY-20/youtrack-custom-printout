import markdownit from 'markdown-it'
import htmlToPdfMake from 'html-to-pdfmake'

export function processMarkdown(body: string | undefined | null, removeImages: boolean): [] {
    if (!body) body = ""
    // removes markdown image tags if attachments should not be included
    if (removeImages) body = body.replace(/!\[.*?]\((.*?)\)/g, '')
    // removes markdown svg image tags, because svgs are not supported by pdfmake
    body = body.replace(/!\[[^\]]*]\(([^)]+\.svg)\)/g, '')
    body = body.replace(/\{width=(.*?)}/g, '')
    const markdownParser = markdownit()
    const html = markdownParser.render(body)
    return htmlToPdfMake(html) as [];
}
