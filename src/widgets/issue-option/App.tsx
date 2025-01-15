import {useCallback, useEffect, useState} from "react";
import ConfigurationCollapse from "./ConfigurationCollapse.tsx";
import {Issue, PdfConfiguration, PdfSection} from "./types.ts";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import YTApp, {host} from "./youTrackApp.ts";
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
(pdfMake as any).addVirtualFileSystem(pdfFonts);
import {useTranslation} from "react-i18next";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import templates from "./templates.json"
import {applyContents, applyHeaders} from "./util.ts";


export default function App() {

    //const [issue, setIssue] = useState<Issue | null>(null)
    const [pdfUrl, setPdfUrl] = useState<string | null>(null)
    const {t} = useTranslation();
    const [pdfConfiguration, setPdfConfiguration] = useState<PdfConfiguration>({
        include_header: true,
        include_title: true,
        include_body: true,
        include_customFields: true,
        include_comments: true,
        include_footer: true,
        header_left: '',
        header_center: '',
        header_right: '',
        title: '',
        body: '',
        comments: [],
        attachments: [],
        customFields: [],
        bodyBeforeCustomFields: true,
    })
    // include images in body

    const [collapse, setCollapse] = useState({
        header: false,
        title: true,
        body: true,
        customFields: true,
        comments: true,
        footer: true
    })

    const [pdfGenerationTimeout, setPdfGenerationTimeout] = useState<number | null>(null)


    useEffect(() => {
        void host.fetchYouTrack(`issues/${YTApp.entity.id}?fields=id,description,summary,attachments(id,name,base64Content),customFields(id,name,value(name)),project(id,name),comments(id,text,author(fullName))`).then((issue: Issue) => {
            //setIssue(issue);
            issue.customFields.map((cf) => cf.included = false)
            console.log(issue.customFields)
            setPdfConfiguration({...pdfConfiguration, title: issue.summary, body: issue.description, comments: issue.comments, attachments: issue.attachments, customFields: issue.customFields});
        })
    }, []);


    const generate = (pdfConfiguration: PdfConfiguration) => {
        const docDefinition = applyPdfConfig(pdfConfiguration)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        pdfDocGenerator.getDataUrl((dataUrl) => {
            setPdfUrl(dataUrl)
        });
    }


    useEffect(() => {
        generateTimeouted(pdfConfiguration)
    }, [pdfConfiguration]);


    const generateTimeouted = useCallback((pdfConfiguration: PdfConfiguration) => {
        if (pdfGenerationTimeout) {
            window.clearTimeout(pdfGenerationTimeout)
        }
        const timeout: number = window.setTimeout(() => generate(pdfConfiguration), 2000)
        setPdfGenerationTimeout(timeout)
    }, [pdfGenerationTimeout])


    function applyPdfConfig(pdfConfiguration: PdfConfiguration) {
        const schema = templates.default_content_top;
        schema.header.columns = applyHeaders(schema.header.columns, pdfConfiguration)
        schema.content = applyContents(schema.content, pdfConfiguration, t) as []
        console.log(schema.content)
        return schema
    }

    return (
        <div>
            <div className={'grid grid-cols-2'} style={{}}>
                <div className={'p-2'}>
                    {pdfUrl !== null &&
                        <iframe id="test" src={pdfUrl} className={'preview'}></iframe>
                    }
                </div>
                <div className={'space-y-2 p-2 collapse-container'}>
                    <Button onClick={() => {
                        console.log(pdfConfiguration)
                    }}>test</Button>
                    <ConfigurationCollapse section={PdfSection.HEADER} pdfConfiguration={pdfConfiguration} setPdfConfiguration={setPdfConfiguration} collapse={collapse} setCollapse={setCollapse}/>
                    <ConfigurationCollapse section={PdfSection.TITLE} pdfConfiguration={pdfConfiguration} setPdfConfiguration={setPdfConfiguration} collapse={collapse} setCollapse={setCollapse}/>
                    <ConfigurationCollapse section={PdfSection.BODY} pdfConfiguration={pdfConfiguration} setPdfConfiguration={setPdfConfiguration} collapse={collapse} setCollapse={setCollapse}/>
                    <ConfigurationCollapse section={PdfSection.CUSTOM_FIELDS} pdfConfiguration={pdfConfiguration} setPdfConfiguration={setPdfConfiguration} collapse={collapse}
                                           setCollapse={setCollapse}/>
                    <ConfigurationCollapse section={PdfSection.COMMENTS} pdfConfiguration={pdfConfiguration} setPdfConfiguration={setPdfConfiguration} collapse={collapse} setCollapse={setCollapse}/>
                </div>
            </div>
            <div className={'flex flex-row justify-end space-x-2 pt-6'}>
                <Button height={ControlsHeight.S}>{t('cancel')}</Button>
                <Button primary height={ControlsHeight.S}>{t('download')}</Button>
                <Button primary height={ControlsHeight.S}>{t('print')}</Button>
            </div>
        </div>


    );
}
