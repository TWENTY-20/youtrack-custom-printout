import {createContext, ReactNode, useCallback, useContext, useState} from "react";
import {Collapse} from "../entities/util.ts";
import {PdfSection} from "../entities/pdf.ts";

export const CollapseContext = createContext<CollapseContextProviderProps | undefined>(undefined)

interface CollapseContextProviderProps {
    collapsed: Collapse
    toggleCollapse: (section: PdfSection) => void
}

const DEFAULT_COLLAPSE = {
    header: true,
    title: true,
    body: true,
    customFields: true,
    comments: true,
    footer: true,
    attachments: true
}

export default function CollapseContextProvider({children}: { children: ReactNode }) {
    const [collapsed, setCollapsed] = useState<Collapse>(DEFAULT_COLLAPSE)

    const toggleCollapse = useCallback((section: PdfSection) => {
        if (!collapsed[section]) {
            setCollapsed(DEFAULT_COLLAPSE)
            return
        }
        setCollapsed({...DEFAULT_COLLAPSE, [section]: false})
    }, [setCollapsed, collapsed])

    return (
        <CollapseContext.Provider value={{collapsed, toggleCollapse}}>
            {children}
        </CollapseContext.Provider>
    )
}

export function useCollapseContext() {
    const context = useContext(CollapseContext)
    if (!context) {
        throw new Error('useCollapseContext must be used within a CollapseContextProvider')
    }
    return context
}

export function useCollapse(section: PdfSection) {
    const {collapsed, toggleCollapse} = useCollapseContext()
    switch (section) {
        case PdfSection.HEADER:
            return {collapsed: collapsed.header, toggleCollapse: () => toggleCollapse(PdfSection.HEADER)}
        case PdfSection.TITLE:
            return {collapsed: collapsed.title, toggleCollapse: () => toggleCollapse(PdfSection.TITLE)}
        case PdfSection.BODY:
            return {collapsed: collapsed.body, toggleCollapse: () => toggleCollapse(PdfSection.BODY)}
        case PdfSection.CUSTOM_FIELDS:
            return {collapsed: collapsed.customFields, toggleCollapse: () => toggleCollapse(PdfSection.CUSTOM_FIELDS)}
        case PdfSection.COMMENTS:
            return {collapsed: collapsed.comments, toggleCollapse: () => toggleCollapse(PdfSection.COMMENTS)}
        case PdfSection.FOOTER:
            return {collapsed: collapsed.footer, toggleCollapse: () => toggleCollapse(PdfSection.FOOTER)}
        case PdfSection.ATTACHMENTS:
            return {collapsed: collapsed.attachments, toggleCollapse: () => toggleCollapse(PdfSection.ATTACHMENTS)}


    }
}
