import SectionCollapse from "../SectionCollapse.tsx";
import {PdfSection} from "../../entities/pdf.ts";

export default function CommentsSection() {

    return (
        <SectionCollapse section={PdfSection.COMMENTS}>

        </SectionCollapse>
    )
}
