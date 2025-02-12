import markdownit from 'markdown-it'
import htmlToPdfMake from 'html-to-pdfmake'

export function processMarkdown(body: string | undefined | null, removeImages: boolean): [] {
    if (!body) body = ""
    if (removeImages) body = body.replace(/!\[.*?]\((.*?)\)/g, '')
    body = body.replace(/\{width=(.*?)}/g, '')
    const markdownParser = markdownit()
    const html = markdownParser.render(body)
    return htmlToPdfMake(html) as [];
}
