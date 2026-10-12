import {DocNode} from "../../entities/pdf.ts";
import {codeBox} from "./components.ts";
import {imageKey} from "./images.ts";

function reworkDoc(content: DocNode[], imageKeys: Set<string>) {
    return content.map((node: DocNode) => {
        return checkRecursive(node, imageKeys)
    })
}

function checkRecursive(node: DocNode, imageKeys: Set<string>) {
    let docNode = node
    if (Array.isArray(docNode)) {
        const children = docNode as DocNode[]
        children.forEach((child, i) => {
            children[i] = checkRecursive(child, imageKeys)
        })
    } else {
        docNode = checkImage(docNode, imageKeys)
        docNode = checkMargin(docNode)
        docNode = checkCodeParent(docNode)
        docNode = checkCode(docNode)

        if (docNode.stack) docNode.stack = docNode.stack.map(n => checkRecursive(n, imageKeys))  // ggf. mit map zuweisen
        if (docNode.text) {
            if (Array.isArray(docNode.text)) docNode.text = docNode.text.map(n => checkRecursive(n, imageKeys))
        }
        if (docNode.ol) docNode.ol = docNode.ol.map(n => checkRecursive(n, imageKeys))
        if (docNode.ul) docNode.ul = docNode.ul.map(n => checkRecursive(n, imageKeys))
        if (docNode.table) docNode.table.body = docNode.table.body.map(row => row.map(cell => typeof cell === 'string' ? cell : checkRecursive(cell, imageKeys)))
    }
    return docNode;
}

function checkImage(n: DocNode, imageKeys: Set<string>): DocNode {
    if (n.nodeName === "IMG") {
        const key = n.image ? imageKey(n.image) : undefined
        // unknown images would make pdfmake try to load them as url and fail, so a placeholder is shown instead
        if (!key || !imageKeys.has(key)) return imagePlaceholder(n.image)
        n.image = key
        n.width = 300
    }
    return n
}

function imagePlaceholder(fileName: string | undefined): DocNode {
    return {nodeName: "IMG_PLACEHOLDER", text: `[${fileName ?? 'image'}]`, italics: true, color: '#9EA0A8'}
}

function checkMargin(n: DocNode) {
    if (n.margin) {
        if (Array.isArray(n.margin)) {
            if (n.margin.length === 4) {
                n.margin[1] = 0
                n.margin[3] = 0
            }
        }
    }
    return n
}

function checkCodeParent(n: DocNode): DocNode {
    if (n.nodeName === "PRE") {
        if (Array.isArray(n.text)) {
            n.stack = n.text
            n.text = []
        }
    }
    return n
}

function checkCode(n: DocNode) {
    if (n.nodeName === "CODE") {
        if (typeof n.text === 'string') return codeBox(n.text)
    }
    return n
}

export {reworkDoc};
