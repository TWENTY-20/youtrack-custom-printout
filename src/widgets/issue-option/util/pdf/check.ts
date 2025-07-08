import {DocNode} from "../../entities/pdf.ts";
import {codeBox} from "./components.ts";

function reworkDoc(content: DocNode[]) {
    return content.map((node: DocNode) => {
        return checkRecursive(node)
    })
}

function checkRecursive(node: DocNode) {
    if (Array.isArray(node)) {
        (node as DocNode[]).forEach(checkRecursive)
    } else {
        node = checkImage(node)
        node = checkMargin(node)
        node = checkCodeParent(node)
        node = checkCode(node)

        if (node.stack) node.stack = node.stack.map(checkRecursive)  // ggf. mit map zuweisen
        if (node.text) {
            if (Array.isArray(node.text)) node.text = node.text.map(checkRecursive)
        }
    }
    return node;
}

function checkImage(n: DocNode) {
    if (n.nodeName === "IMG") {
        n.image = n.image?.replace('.', '')
        n.width = 300
    }
    return n
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
