import SectionCollapse from "../SectionCollapse.tsx";
import {PdfSection} from "../../entities/pdf.ts";
import Input from "@jetbrains/ring-ui-built/components/input/input";
import { useTranslation } from "react-i18next";
import {usePdfContext} from "../../context/PdfContextProvider.tsx";

export default function HeaderSection() {

    const {t} = useTranslation()
    const {config, setConfig} = usePdfContext()

    return (
        <SectionCollapse section={PdfSection.HEADER}>
            <div className={'space-y-2'}>
                <Input className={'input-full-width'} label={t('left')} value={config.header_left} onChange={(i) => {
                    setConfig({...config, header_left: i.target.value, include_header: true})
                }}/>
                <Input className={'input-full-width'} label={t('center')} value={config.header_center} onChange={(i) => {
                    setConfig({...config, header_center: i.target.value, include_header: true})
                }}/>
                <Input className={'input-full-width'} label={t('right')} value={config.header_right} onChange={(i) => {
                    setConfig({...config, header_right: i.target.value, include_header: true})
                }}/>
            </div>
        </SectionCollapse>
    )
}
