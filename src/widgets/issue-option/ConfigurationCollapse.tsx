import Island, {Header} from "@jetbrains/ring-ui-built/components/island/island";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {BASE_ANIMATION_DURATION} from "@jetbrains/ring-ui-built/components/collapse/consts";
import {useTranslation} from "react-i18next";
import IconSVG from "@jetbrains/ring-ui-built/components/icon/icon__svg";
import ChevronDownIcon from "@jetbrains/icons/chevron-20px-down";
import ChevronUpIcon from "@jetbrains/icons/chevron-20px-up";
import Checkbox from "@jetbrains/ring-ui-built/components/checkbox/checkbox";
import Input from "@jetbrains/ring-ui-built/components/input/input";
import {Collapse, CustomField, PdfConfiguration, PdfSection} from "./types.ts";
import {getCollapseValue, getToggledCollapseValue} from "./util.ts";
import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";

export default function ConfigurationCollapse(
    {
        section,
        pdfConfiguration,
        setPdfConfiguration,
        collapse,
        setCollapse
    }: {
        section: PdfSection
        pdfConfiguration: PdfConfiguration
        setPdfConfiguration: (newPdfConfiguration: PdfConfiguration) => void
        collapse: Collapse
        setCollapse: (newCollapse: Collapse) => void
    }) {

    const DURATION_FACTOR = 0.5;
    const DEFAULT_HEIGHT = 0;
    const VISIBLE = 1;
    const HIDDEN = 0;

    const {t} = useTranslation()

    //const [collapsed, toggle] = useState(true);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const initialContentHeight = useRef<number>(DEFAULT_HEIGHT);
    const contentHeight = useRef<number>(DEFAULT_HEIGHT);
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    });
    const [height, setHeight] = useState<string>(`${initialContentHeight.current}px`);

    useEffect(() => {
        if (contentRef.current) {
            contentHeight.current = contentRef.current.getBoundingClientRect().height;
        }
    }, [dimensions.height]);

    useEffect(() => {
        const nextHeight = getCollapsed() ? initialContentHeight.current : contentHeight.current;
        setHeight(`${nextHeight}px`);
    }, [collapse, dimensions.height]);

    useEffect(() => {
        if (!contentRef.current) return;
        const observer = new ResizeObserver(([entry]) => {
            if (entry && entry.borderBoxSize) {
                const {inlineSize, blockSize} = entry.borderBoxSize[0];

                setDimensions({width: inlineSize, height: blockSize});
            }
        });
        observer.observe(contentRef.current);
    }, []);

    const getCollapsed = useCallback(() => {
        return getCollapseValue(section, collapse)
    }, [section, collapse])


    const toggleCollapse = useCallback(() => {
            setCollapse(getToggledCollapseValue(section, collapse))
        }, [section, collapse]
    )

    const style = useMemo(() => {
        const calculatedDuration = BASE_ANIMATION_DURATION + contentHeight.current * DURATION_FACTOR;
        return {
            "--duration": `${calculatedDuration}ms`,
            transition: "height var(--duration) ease-in-out 0s, opacity var(--duration) ease-in-out 0s",
            height,
            opacity: getCollapsed() ? HIDDEN : VISIBLE
        };
    }, [height, collapse]);

    const setAllFields = useCallback(() => {
        const allUnselected = allFieldsOff(pdfConfiguration.customFields)
        const fields = pdfConfiguration.customFields.map(f => {
            f.included = allUnselected
            return f
        })
        setPdfConfiguration({...pdfConfiguration, customFields: fields, include_customFields: allUnselected})
    }, [pdfConfiguration])

    function allFieldsOff(fields: CustomField[]) {
        const r = fields.filter(f => f.included)
        return r.length === 0;
    }


    return (
        <Island className="relative">
            <Header
                className={"collapse-header"}
                border
                aria-controls={`collapse-sprint-${section}`}
                aria-expanded={!getCollapsed}
                onClick={toggleCollapse}
            >
                <div className="flex flex-col">
                    <div className={"flex flex-row w-full"}>
                        <span className="-ml-4 mr-4">
                            {
                                getCollapsed() ? <IconSVG src={ChevronDownIcon}/> : <IconSVG src={ChevronUpIcon}/>
                            }
                            <span style={{paddingBottom: '5px', paddingLeft: '10px'}}>{t(section)}</span>
                        </span>
                    </div>
                </div>
            </Header>
            <div className="relative overflow-hidden will-change-[height,opacity]"
                 id={`collapse-sprint-${section}`} style={style}>
                <div ref={contentRef} className="min-h-10 bg-[var(--ring-sidebar-background-color)] p-2 ">
                    {!getCollapsed() &&
                        <div className={"p-4"}>
                            {section === PdfSection.HEADER &&
                                <div className={'space-y-2'}>
                                    <Input className={'input-full-width'} label={t('left')} value={pdfConfiguration.header_left} onChange={(i) => {
                                        setPdfConfiguration({...pdfConfiguration, header_left: i.target.value, include_header: true})
                                    }}/>
                                    <Input className={'input-full-width'} label={t('center')} value={pdfConfiguration.header_center} onChange={(i) => {
                                        setPdfConfiguration({...pdfConfiguration, header_center: i.target.value, include_header: true})
                                    }}/>
                                    <Input className={'input-full-width'} label={t('right')} value={pdfConfiguration.header_right} onChange={(i) => {
                                        setPdfConfiguration({...pdfConfiguration, header_right: i.target.value, include_header: true})
                                    }}/>
                                </div>
                            }

                            {section === PdfSection.TITLE &&
                                <div>
                                    <Input className={'input-full-width'} label={t('title')} value={pdfConfiguration.title} onChange={(i) => {
                                        setPdfConfiguration({...pdfConfiguration, title: i.target.value})
                                    }}/>
                                </div>
                            }


                            {section === PdfSection.BODY &&
                                <div>
                                    <Checkbox checked={pdfConfiguration.bodyBeforeCustomFields} labelClassName={'pb-4'} label={t('bodyBeforeCustomFields')}
                                              onChange={() => setPdfConfiguration({...pdfConfiguration, bodyBeforeCustomFields: !pdfConfiguration.bodyBeforeCustomFields})}/>
                                    <Input className={'input-full-width'} label={t('body')} multiline value={pdfConfiguration.body} onChange={(i) => {
                                        setPdfConfiguration({...pdfConfiguration, body: i.target.value})
                                    }}/>
                                </div>
                            }

                            {section === PdfSection.CUSTOM_FIELDS &&
                                <div>
                                    <ClickableLink className={'link'} onClick={setAllFields}>{t(allFieldsOff(pdfConfiguration.customFields) ? 'selectAll' : 'unselectAll')}</ClickableLink>
                                    <hr className={'solid'}/>
                                    {pdfConfiguration.customFields.map((customField: CustomField, index: number) =>
                                        <Checkbox key={index} checked={customField.included} labelClassName={'pb-4 pr-4'} label={customField.name} onChange={() => {
                                            const fields = pdfConfiguration.customFields
                                            fields[index].included = !customField.included
                                            setPdfConfiguration({...pdfConfiguration, customFields: fields, include_customFields: !allFieldsOff(fields)})
                                        }}/>
                                    )}
                                </div>
                            }
                        </div>
                    }
                </div>
            </div>
        </Island>
    );
}
