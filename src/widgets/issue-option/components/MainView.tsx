import HeaderSection from "./sections/HeaderSection.tsx";
import TitleSection from "./sections/TitleSection.tsx";
import BodySection from "./sections/BodySection.tsx";
import CustomFieldsSection from "./sections/CustomFieldsSection.tsx";
import CommentsSection from "./sections/CommentsSection.tsx";
import FooterSection from "./sections/FooterSection.tsx";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import {useEffect} from "react";
import YTApp from "../youTrackApp.ts";
import {fetchIssue, parseIssue} from "../util/issue.ts";
import {Issue} from "../entities/youtrack.ts";
import {useTranslation} from "react-i18next";
import {usePdfContext} from "../context/PdfContextProvider.tsx";
import usePdfActions from "../hooks/usePdfActions.tsx";
import Island, {Content} from "@jetbrains/ring-ui-built/components/island/island";
import AttachmentsSection from "./sections/AttachmentsSection.tsx";
import LoaderScreen from "@jetbrains/ring-ui-built/components/loader-screen/loader-screen";

export default function MainView() {


    const {t} = useTranslation()
    const {config, setConfig} = usePdfContext()
    const {printPdf, downloadPdf, loading} = usePdfActions()

    useEffect(() => {
        void fetchIssue(YTApp.entity.id).then((issue: Issue) => {
            setConfig(parseIssue(issue, config, t));
        })
    }, []);

    if (loading) return <LoaderScreen containerClassName={'w-95'}/>

    return (
        <div className={'flex flex-col justify-between h-screen pe-1'}>
            <div className={'space-y-4'}>
                <HeaderSection/>
                <TitleSection/>
                <BodySection/>
                <CustomFieldsSection/>
                <CommentsSection/>
                <FooterSection/>
                <AttachmentsSection/>
            </div>

            <div className={'flex-col pt-4'}>
                <Island style={{border: '1px solid #d671b3'}}>
                    <Content>{t('noSVG')}</Content>
                </Island>
                <div className={'flex flex-row justify-end space-x-2 pt-10 pb-8'}>
                    <Button primary height={ControlsHeight.S} onClick={() => downloadPdf(config)}>{t('download')}</Button>
                    <Button primary height={ControlsHeight.S} onClick={() => printPdf(config)}>{t('print')}</Button>
                </div>
            </div>
        </div>
    )

}
