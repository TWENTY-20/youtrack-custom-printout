import SectionCollapse from "../SectionCollapse.tsx";
import {PdfSection} from "../../entities/pdf.ts";
import Checkbox from "@jetbrains/ring-ui-built/components/checkbox/checkbox";
import Input from "@jetbrains/ring-ui-built/components/input/input";
import {useTranslation} from "react-i18next";
import {usePdfContext} from "../../context/PdfContextProvider.tsx";

export default function BodySection() {

    const {t} = useTranslation()
    const {config, setConfig} = usePdfContext()

    return (
        <SectionCollapse section={PdfSection.BODY}>
            <div>
                <Checkbox checked={config.bodyBeforeCustomFields} labelClassName={'pb-4'} label={t('bodyBeforeCustomFields')}
                          onChange={() => setConfig({...config, bodyBeforeCustomFields: !config.bodyBeforeCustomFields})}/>
                <Input className={'input-full-width'} label={t('body')} multiline value={config.body} onChange={(i) => {
                    setConfig({...config, body: i.target.value})
                }}/>
            </div>
        </SectionCollapse>
    )
}
