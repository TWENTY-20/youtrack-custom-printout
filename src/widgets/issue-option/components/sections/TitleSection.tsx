import SectionCollapse from "../SectionCollapse.tsx";
import {PdfSection} from "../../entities/pdf.ts";
import Input from "@jetbrains/ring-ui-built/components/input/input";
import {useTranslation} from "react-i18next";
import {usePdfContext} from "../../context/PdfContextProvider.tsx";

export default function TitleSection() {

    const {t} = useTranslation()
    const {config, setConfig} = usePdfContext()

    return (
        <SectionCollapse section={PdfSection.TITLE}>
            <Input className={'input-full-width'} label={t('title')} value={config.title} onChange={(i) => {
                setConfig({...config, title: i.target.value})
            }}/>
        </SectionCollapse>
    )
}
