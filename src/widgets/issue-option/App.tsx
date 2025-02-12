import {useCallback, useEffect, useState} from "react";
import ConfigurationCollapse from "./ConfigurationCollapse.tsx";
import {Issue, PdfConfiguration, PdfSection} from "./types.ts";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import YTApp, {host} from "./youTrackApp.ts";
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {useTranslation} from "react-i18next";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import templates from "./templates.json"
import {applyContents, applyFooter, applyHeaders, applyImages, reworkDoc} from "./util.ts";
import Checkbox from "@jetbrains/ring-ui-built/components/checkbox/checkbox";
import Tooltip from "@jetbrains/ring-ui-built/components/tooltip/tooltip";
import Icon from "@jetbrains/ring-ui-built/components/icon";
import Info from "@jetbrains/icons/info";
import {AlertType} from "@jetbrains/ring-ui-built/components/alert/alert";
import Island, {Content} from "@jetbrains/ring-ui-built/components/island/island";
import LoaderScreen from "@jetbrains/ring-ui-built/components/loader-screen/loader-screen";
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
(pdfMake as any).addVirtualFileSystem(pdfFonts);

export default function App() {

    const {t} = useTranslation();
    const [pdfConfiguration, setPdfConfiguration] = useState<PdfConfiguration>({
        include_header: false,
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
    })

    const [collapse, setCollapse] = useState({
        header: false,
        title: true,
        body: true,
        customFields: true,
        comments: true,
        footer: true
    })

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        void host.fetchYouTrack(`issues/${YTApp.entity.id}?fields=id,description,summary,attachments(id,name,base64Content,mimeType),customFields(id,name,value(name,presentation,text)),project(id,name),comments(id,text,author(fullName))`).then((issue: Issue) => {
            issue.customFields.map((cf) => cf.included = true)
            setPdfConfiguration({...pdfConfiguration, title: issue.summary, body: issue.description, comments: issue.comments, attachments: issue.attachments, customFields: issue.customFields});
        })
    }, []);


    const generate = useCallback(() => {
        const docDefinition = applyPdfConfig(pdfConfiguration)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return pdfMake.createPdf(docDefinition);
    }, [pdfConfiguration])

    function downloadPdf(name: string) {
        try {
            setLoading(true);
            const timeout = window.setTimeout(() => {
                host.alert(t('pdfError'), AlertType.ERROR)
                setLoading(false);
            }, 5000)
            generate().download(filename(name), () => {
                window.clearTimeout(timeout)
                setLoading(false);
            })
        } catch (e) {
            console.error(e)
            host.alert(t('pdfError'), AlertType.ERROR)
            setLoading(false);
        }
    }

    function printPdf() {
        try {
            setLoading(true);
            const timeout = window.setTimeout(() => {
                host.alert(t('pdfError'), AlertType.ERROR)
                setLoading(false);
            }, 5000)
            generate().print({
                progressCallback: (p) => {
                    if (p === 1){
                        window.clearTimeout(timeout)
                        setLoading(false);
                    }
                }
            })
        } catch (e) {
            host.alert(t('pdfError'), AlertType.ERROR)
            setLoading(false);
        }
    }


    function applyPdfConfig(pdfConfiguration: PdfConfiguration) {
        const schema = templates.default_content_top;
        schema.header.columns = applyHeaders(schema.header.columns, pdfConfiguration)
        schema.content = applyContents(schema.content, pdfConfiguration, t) as []
        if (pdfConfiguration.include_attachments) {
            schema.images = applyImages(pdfConfiguration.attachments)
        } else {
            schema.images = {}
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        schema.footer = applyFooter(pdfConfiguration.include_footer)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        reworkDoc(schema.content)
        console.log(schema.content)
        return schema
    }

    function filename(name: string) {
        return name.replace(/[ /]/, '_')
    }

    return (
        <div>
            <div>
                {loading ?
                    <div className={'loader-force-size'}>
                        <LoaderScreen containerClassName={'loader-force-size'}/>
                    </div>
                    :
                    <div className={'flex flex-col justify-between p-2 collapse-container'}>
                        <div className={'space-y-2'}>
                            <p className={'text-2xl'}>{t('dialog_title')}</p>
                            <hr className={'solid'}/>
                            <div className={'grid grid-cols-2'}>
                                <Checkbox checked={pdfConfiguration.include_header} labelClassName={'pb-4'} label={t('header')}
                                          onChange={() => setPdfConfiguration({...pdfConfiguration, include_header: !pdfConfiguration.include_header})}/>
                                <Checkbox checked={pdfConfiguration.include_title} labelClassName={'pb-4'} label={t('title')}
                                          onChange={() => setPdfConfiguration({...pdfConfiguration, include_title: !pdfConfiguration.include_title})}/>
                                <div>
                                    <Checkbox checked={pdfConfiguration.include_customFields} labelClassName={'pb-4'} label={t('customFields')}
                                              onChange={() => setPdfConfiguration({...pdfConfiguration, include_customFields: !pdfConfiguration.include_customFields})}/>
                                    <Tooltip className={' ml-3'} title={t('customFieldsCheckTooltip')}>
                                        <Icon glyph={Info}
                                              className={'infoIcon'}
                                              height={15}
                                              width={15}
                                        />
                                    </Tooltip>
                                </div>
                                <Checkbox checked={pdfConfiguration.include_body} labelClassName={'pb-4'} label={t('body')}
                                          onChange={() => setPdfConfiguration({...pdfConfiguration, include_body: !pdfConfiguration.include_body})}/>
                                <Checkbox checked={pdfConfiguration.include_comments} labelClassName={'pb-4'} label={t('comments')}
                                          onChange={() => setPdfConfiguration({...pdfConfiguration, include_comments: !pdfConfiguration.include_comments})}/>
                                <Checkbox checked={pdfConfiguration.include_footer} labelClassName={'pb-4'} label={t('footer')}
                                          onChange={() => setPdfConfiguration({...pdfConfiguration, include_footer: !pdfConfiguration.include_footer})}/>
                                <Checkbox checked={pdfConfiguration.include_attachments} labelClassName={'pb-4'} label={t('images')}
                                          onChange={() => setPdfConfiguration({...pdfConfiguration, include_attachments: !pdfConfiguration.include_attachments})}/>
                            </div>
                            <ConfigurationCollapse section={PdfSection.HEADER} pdfConfiguration={pdfConfiguration} setPdfConfiguration={setPdfConfiguration} collapse={collapse}
                                                   setCollapse={setCollapse}/>
                            <ConfigurationCollapse section={PdfSection.TITLE} pdfConfiguration={pdfConfiguration} setPdfConfiguration={setPdfConfiguration} collapse={collapse}
                                                   setCollapse={setCollapse}/>
                            <ConfigurationCollapse section={PdfSection.CUSTOM_FIELDS} pdfConfiguration={pdfConfiguration} setPdfConfiguration={setPdfConfiguration} collapse={collapse}
                                                   setCollapse={setCollapse}/>
                        </div>
                        <Island style={{border: '1px solid #d671b3'}}>
                            <Content>{t('noSVG')}</Content>
                        </Island>
                    </div>
                }
            </div>
            <div className={'flex flex-row justify-end space-x-2 pt-6'}>
                <Button primary height={ControlsHeight.S} onClick={() => downloadPdf(pdfConfiguration.title)}>{t('download')}</Button>
                <Button primary height={ControlsHeight.S} onClick={() => printPdf()}>{t('print')}</Button>
            </div>
        </div>


    );
}
