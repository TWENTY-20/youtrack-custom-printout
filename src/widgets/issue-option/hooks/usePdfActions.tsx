import {PdfConfiguration} from "../entities/util.ts";
import {applyPdfConfig} from "../util/pdf/apply.ts";
import {normalizeImageAttachments} from "../util/pdf/images.ts";
import {useTranslation} from "react-i18next";
import {downloadBlob, filename, isFirefox} from "../util/util.ts";
import * as pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type {TCreatedPdf, TDocumentDefinitions} from "pdfmake/interfaces";
import {host} from "../youTrackApp.ts";
import {AlertType} from "@jetbrains/ring-ui-built/components/alert/alert";
import {useState} from "react";

pdfMake.addVirtualFileSystem(pdfFonts);

export default function usePdfActions() {

    const {t} = useTranslation()
    const [loading, setLoading] = useState(false)


    const handlePdfError = (error: unknown): void => {
        host.alert(t('pdfError'), AlertType.ERROR)
        console.error(error)
    }

    const runPdfAction = (action: () => Promise<void>): void => {
        setLoading(true)
        action().then(
            () => setLoading(false),
            (error: unknown) => {
                handlePdfError(error)
                setLoading(false)
            }
        )
    }

    const generate = async (config: PdfConfiguration): Promise<TCreatedPdf> => {
        const attachments = config.include_attachments ? await normalizeImageAttachments(config.attachments) : config.attachments
        const docDefinition = applyPdfConfig({...config, attachments}, t) as TDocumentDefinitions
        return pdfMake.createPdf(docDefinition);
    }

    function downloadPdf(config: PdfConfiguration): void {
        runPdfAction(async () => {
            const doc = await generate(config)
            const fileName = filename(config.title)
            if (isFirefox()) {
                const blob = await doc.getBlob()
                downloadBlob(fileName, blob)
                return
            }
            await doc.download(fileName)
        })
    }

    function printPdf(config: PdfConfiguration): void {
        // open the window synchronously while the click's user activation is still valid,
        // otherwise popup blockers reject it once PDF generation takes longer than a few seconds
        const win = window.open('', '_blank')
        if (!win) {
            handlePdfError(new Error('Open PDF in new window blocked by browser'))
            return
        }
        runPdfAction(async () => {
            try {
                await (await generate(config)).print(win)
            } catch (error) {
                win.close()
                throw error
            }
        })
    }

    return {downloadPdf, printPdf, loading}
}
