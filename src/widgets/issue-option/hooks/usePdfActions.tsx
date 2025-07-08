import {PdfConfiguration} from "../entities/util.ts";
import {applyPdfConfig} from "../util/pdf/apply.ts";
import {useTranslation} from "react-i18next";
import {downloadBlob, filename, isFirefox} from "../util/util.ts";
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {host} from "../youTrackApp.ts";
import {AlertType} from "@jetbrains/ring-ui-built/components/alert/alert";
import {useState} from "react";
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
(pdfMake as any).addVirtualFileSystem(pdfFonts);

export default function usePdfActions() {

    const {t} = useTranslation()
    const [loading, setLoading] = useState(false)

    const generate = (config: PdfConfiguration) => {
        const docDefinition = applyPdfConfig(config, t)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return pdfMake.createPdf(docDefinition);
    }


    function downloadPdf(config: PdfConfiguration) {

        setLoading(true)
        try {
            const doc = generate(config)
            if (isFirefox()) {
                doc.getBlob((blob) => {
                    downloadBlob(filename(config.title), blob)
                    setLoading(false)
                })
            } else {
                doc.download(filename(config.title),()=>{
                    setLoading(false)
                })
            }


        } catch (e) {
            host.alert(t('pdfError'), AlertType.ERROR)
            console.error(e)
            setLoading(false)
        }
    }

    function printPdf(config: PdfConfiguration) {
        setLoading(true)
        try {
            const timeout = window.setTimeout(() => {
                host.alert(t('pdfError'), AlertType.ERROR)
                setLoading(false)
            }, 5000)

            generate(config).print({
                progressCallback: (p) => {
                    if (p === 1) {
                        window.clearTimeout(timeout)
                        setLoading(false)
                    }
                }
            })
        } catch (e) {
            host.alert(t('pdfError'), AlertType.ERROR)
            console.error(e)
            setLoading(false)
        }
    }

    return {downloadPdf, printPdf, loading}
}
