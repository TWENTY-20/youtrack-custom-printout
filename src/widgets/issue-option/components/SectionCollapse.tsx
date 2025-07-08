import {ReactNode} from "react";
import Collapse from "@jetbrains/ring-ui-built/components/collapse/collapse";
import CollapseContent from "@jetbrains/ring-ui-built/components/collapse/collapse-content";
import CollapseControl from "@jetbrains/ring-ui-built/components/collapse/collapse-control";
import {PdfSection} from "../entities/pdf.ts";
import Text from "@jetbrains/ring-ui-built/components/text/text";
import Toggle from "@jetbrains/ring-ui-built/components/toggle/toggle";
import Island, {Content, Header} from "@jetbrains/ring-ui-built/components/island/island";
import {useCollapse} from "../context/CollapseContextProvider.tsx";
import {useToggle} from "../context/PdfContextProvider.tsx";
import IconSVG from "@jetbrains/ring-ui-built/components/icon/icon__svg";
import ChevronDownIcon from "@jetbrains/icons/chevron-down";
import ChevronRightIcon from "@jetbrains/icons/chevron-right";
import {useTranslation} from "react-i18next";


export default function SectionCollapse({children, section}: { children?: ReactNode, section: PdfSection }) {
    const {collapsed, toggleCollapse} = useCollapse(section)
    const {value, toggle} = useToggle(section)
    const {t} = useTranslation()

    return (
        <Collapse collapsed={collapsed} onChange={toggleCollapse}>
            <Island>
                <CollapseControl>
                    <Header className={'forceDisableFloat island-header-padding'}>
                        <div className="flex flex-row justify-between w-full">
                            <div>
                                {
                                    children &&
                                    (collapsed ? <IconSVG src={ChevronRightIcon}/> : <IconSVG src={ChevronDownIcon}/>)
                                }
                                <Text className={'ps-2'}>{t(section.valueOf())}</Text>

                            </div>
                            <Toggle checked={value} onChange={toggle}></Toggle>
                        </div>
                    </Header>
                </CollapseControl>
                {children &&
                    <CollapseContent>
                        <Content>
                            {children}
                        </Content>
                    </CollapseContent>
                }
            </Island>
        </Collapse>
    )
}
