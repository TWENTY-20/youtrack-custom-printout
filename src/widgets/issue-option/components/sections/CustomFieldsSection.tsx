import SectionCollapse from "../SectionCollapse.tsx";
import {PdfSection} from "../../entities/pdf.ts";
import {useTranslation} from "react-i18next";
import {usePdfContext} from "../../context/PdfContextProvider.tsx";
import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import {CustomField} from "../../entities/youtrack.ts";
import Checkbox from "@jetbrains/ring-ui-built/components/checkbox/checkbox";
import {useCallback} from "react";

export default function CustomFieldsSection() {

    const {t} = useTranslation()
    const {config, setConfig} = usePdfContext()

    const setAllFields = useCallback(() => {
        const allUnselected = allFieldsOff(config.customFields)
        const fields = config.customFields.map(f => {
            f.included = allUnselected
            return f
        })
        setConfig({...config, customFields: fields, include_customFields: allUnselected})
    }, [config])

    function allFieldsOff(fields: CustomField[]) {
        const r = fields.filter(f => f.included)
        return r.length === 0;
    }

    return (
        <SectionCollapse section={PdfSection.CUSTOM_FIELDS}>
            <ClickableLink className={'link'} onClick={setAllFields}>{t(allFieldsOff(config.customFields) ? 'selectAll' : 'unselectAll')}</ClickableLink>
            <hr className={'solid'}/>
            {config.customFields.map((customField: CustomField, index: number) =>
                <Checkbox key={index} checked={customField.included} labelClassName={'pb-4 pr-4'} label={customField.name} onChange={() => {
                    const fields = config.customFields
                    fields[index].included = !customField.included
                    setConfig({...config, customFields: fields, include_customFields: !allFieldsOff(fields)})
                }}/>
            )}
        </SectionCollapse>
    )
}
