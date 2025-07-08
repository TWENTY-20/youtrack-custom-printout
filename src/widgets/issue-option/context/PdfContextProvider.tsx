import {createContext, ReactNode, useContext, useState} from "react";
import {PdfConfiguration} from "../entities/util.ts";
import {PdfSection} from "../entities/pdf.ts";

export const PdfContext = createContext<PdfContextProviderProps | undefined>(undefined)

interface PdfContextProviderProps {
    config: PdfConfiguration
    setConfig: (config: PdfConfiguration | ((config: PdfConfiguration) => PdfConfiguration)) => void
}

const DEFAULT_PDF_CONFIG = {
    include_header: true,
    include_title: true,
    include_body: true,
    include_customFields: true,
    include_comments: true,
    include_footer: true,
    include_attachments: true,
    header_left: '',
    header_center: '',
    header_right: '',
    title: '',
    body: '',
    comments: [],
    attachments: [],
    customFields: [],
    bodyBeforeCustomFields: true,
    idReadable: undefined,
    issueUrl: undefined
}


export default function PdfContextProvider({children}: { children: ReactNode }) {
    const [config, setConfig] = useState<PdfConfiguration>(DEFAULT_PDF_CONFIG)

    return (
        <PdfContext.Provider value={{config, setConfig}}>
            {children}
        </PdfContext.Provider>
    )
}

export function usePdfContext() {
    const context = useContext(PdfContext)
    if (!context) {
        throw new Error('usePdfContext must be used within a PdfContextProvider')
    }
    return context
}

export function useToggle(section: PdfSection) {
    const {setConfig, config} = usePdfContext()
    switch (section) {
        case PdfSection.HEADER:
            return {value: config.include_header, toggle: () => setConfig({...config, include_header: !config.include_header})}
        case PdfSection.TITLE:
            return {value: config.include_title, toggle: () => setConfig({...config, include_title: !config.include_title})}
        case PdfSection.BODY:
            return {value: config.include_body, toggle: () => setConfig({...config, include_body: !config.include_body})}
        case PdfSection.CUSTOM_FIELDS:
            return {value: config.include_customFields, toggle: () => setConfig({...config, include_customFields: !config.include_customFields})}
        case PdfSection.COMMENTS:
            return {value: config.include_comments, toggle: () => setConfig({...config, include_comments: !config.include_comments})}
        case PdfSection.FOOTER:
            return {value: config.include_footer, toggle: () => setConfig({...config, include_footer: !config.include_footer})}
        case PdfSection.ATTACHMENTS:
            return {value: config.include_attachments, toggle: () => setConfig({...config, include_attachments: !config.include_attachments})}
    }
}
