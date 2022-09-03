import { Card, Checkbox, Col, Row } from 'antd';
import FineGrainSlider from './FineGrainSlider'
import PEQDisplay, { PEQ } from './PEQ';
import PEQModal from './PEQModal';
export enum SpeakerConfigOptions {
    delay = "delay",
    crossover = "crossover",
    peq = "peq",
    isSubwoofer = "isSubwoofer",
    index = "index",
    gain = "gain"
}

export interface SpeakerData {
    [SpeakerConfigOptions.delay]: number,
    [SpeakerConfigOptions.gain]: number,
    [SpeakerConfigOptions.crossover]: number,
    [SpeakerConfigOptions.peq]: PEQ[],
    [SpeakerConfigOptions.isSubwoofer]: boolean,
    [SpeakerConfigOptions.index]: number,
}

//index maps to the hardware speaker index
const getDefaultSpeakerOptions = (index: number) => ({
    [SpeakerConfigOptions.crossover]: 80,
    [SpeakerConfigOptions.delay]: 5,
    [SpeakerConfigOptions.isSubwoofer]: false,
    [SpeakerConfigOptions.peq]: [],
    [SpeakerConfigOptions.index]: index,
    [SpeakerConfigOptions.gain]: 0,
})

export const DEFAULT_SPEAKERS = {
    "Left Speaker": getDefaultSpeakerOptions(0),
    "Right Speaker": getDefaultSpeakerOptions(1),
    "Center Speaker": getDefaultSpeakerOptions(2),
    "Surround Left": getDefaultSpeakerOptions(3),
    "Surround Right": getDefaultSpeakerOptions(4),
    "Subwoofer 1": { ...getDefaultSpeakerOptions(5), [SpeakerConfigOptions.isSubwoofer]: true },
    "Subwoofer 2": { ...getDefaultSpeakerOptions(6), [SpeakerConfigOptions.isSubwoofer]: true },
}
export type SpeakerChange = (data: SpeakerData, key: SpeakerConfigOptions) => (value: number | boolean | PEQ[]) => void

const SpeakerConfig = ({ speakerTitle, speakerData, onChangeSpeakerData }: { speakerTitle: string, speakerData: SpeakerData, onChangeSpeakerData: SpeakerChange }) => {
    const isSubwoofer = speakerData[SpeakerConfigOptions.isSubwoofer]
    return (
        <Col lg={24} xl={12} style={{ marginBottom: 10 }} >
            <Card title={speakerTitle} bordered={false} extra={
                <Checkbox checked={isSubwoofer} onChange={() => onChangeSpeakerData(speakerData, SpeakerConfigOptions.isSubwoofer)(!isSubwoofer)}>Is Subwoofer</Checkbox>
            } >
                <FineGrainSlider label="Delay (ms)" onChange={onChangeSpeakerData(speakerData, SpeakerConfigOptions.delay)} value={speakerData[SpeakerConfigOptions.delay]} max={30} />
                <FineGrainSlider label="Gain" onChange={onChangeSpeakerData(speakerData, SpeakerConfigOptions.gain)} value={speakerData[SpeakerConfigOptions.gain]} min={-10} max={10} />
                {!isSubwoofer && <FineGrainSlider label="Crossover" onChange={onChangeSpeakerData(speakerData, SpeakerConfigOptions.crossover)} value={speakerData[SpeakerConfigOptions.crossover]} min={30} max={150} stepSize={1} />}

                <h4 style={{ fontWeight: 400 }}>Peq</h4>
                <Row>

                    <PEQDisplay data={speakerData[SpeakerConfigOptions.peq]} />
                    <PEQModal data={speakerData[SpeakerConfigOptions.peq]} onChange={onChangeSpeakerData(speakerData, SpeakerConfigOptions.peq)} />
                </Row>
            </Card>
        </Col>
    )
}

export default SpeakerConfig