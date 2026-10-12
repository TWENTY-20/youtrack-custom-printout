import {Attachment} from "../../entities/youtrack.ts";

// pdfmake only supports png and jpeg, these formats are converted to png in the browser
const CONVERTIBLE_MIME_TYPES = ['image/webp', 'image/gif', 'image/bmp', 'image/avif']

export function imageKey(name: string): string {
    return name.replace('.', '')
}

export async function normalizeImageAttachments(attachments: Attachment[]): Promise<Attachment[]> {
    return Promise.all(attachments.map(async (attachment) => {
        if (!CONVERTIBLE_MIME_TYPES.includes(attachment.mimeType)) return attachment
        try {
            const png = await convertToPng(toDataUrl(attachment))
            // name stays unchanged, so the image key still matches the markdown reference
            return {...attachment, mimeType: 'image/png', base64Content: png}
        } catch (error) {
            console.warn(`Could not convert attachment "${attachment.name}" to png`, error)
            return attachment
        }
    }))
}

function toDataUrl(attachment: Attachment): string {
    const content = attachment.base64Content
    return content.startsWith('data:') ? content : `data:${attachment.mimeType};base64,${content}`
}

async function convertToPng(dataUrl: string): Promise<string> {
    const img = new Image()
    img.src = dataUrl
    await img.decode()
    if (!img.naturalWidth || !img.naturalHeight) throw new Error('Image has no dimensions')
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas 2d context not available')
    context.drawImage(img, 0, 0)
    return canvas.toDataURL('image/png')
}
