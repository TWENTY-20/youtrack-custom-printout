import SectionCollapse from "../SectionCollapse.tsx";
import {PdfSection} from "../../entities/pdf.ts";

export default function AttachmentsSection() {

    return (
        <SectionCollapse section={PdfSection.ATTACHMENTS}>

        </SectionCollapse>
    )
}
