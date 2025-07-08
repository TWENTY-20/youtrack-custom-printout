import SectionCollapse from "../SectionCollapse.tsx";
import {PdfSection} from "../../entities/pdf.ts";

export default function FooterSection() {


    return (
        <SectionCollapse section={PdfSection.FOOTER}>

        </SectionCollapse>
    )
}
