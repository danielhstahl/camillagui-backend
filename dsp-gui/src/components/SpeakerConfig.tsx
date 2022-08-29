import { Card, Checkbox, Col, Row } from 'antd';
import FineGrainSlider from './FineGrainSlider'
import PEQDisplay, { PEQ } from './PEQ';
import PEQModal from './PEQModal';
export enum SpeakerConfigOptions {
    distance = "distance",
    crossover = "crossover",
    peq = "peq",
    isSubwoofer = "isSubwoofer"
}

export interface SpeakerData {
    [SpeakerConfigOptions.distance]: number,
    [SpeakerConfigOptions.crossover]: number,
    [SpeakerConfigOptions.peq]: PEQ[],
    [SpeakerConfigOptions.isSubwoofer]: boolean
}

export type SpeakerChange = (data: SpeakerData, key: SpeakerConfigOptions) => (value: number | boolean | PEQ[]) => void

const SpeakerConfig = ({ speakerTitle, speakerData, onChangeSpeakerData }: { speakerTitle: string, speakerData: SpeakerData, onChangeSpeakerData: SpeakerChange }) => {
    const isSubwoofer = speakerData[SpeakerConfigOptions.isSubwoofer]
    return (
        <Col lg={24} xl={12} style={{ marginBottom: 10 }} >
            <Card title={speakerTitle} bordered={false} extra={

                <Checkbox checked={isSubwoofer} onChange={() => onChangeSpeakerData(speakerData, SpeakerConfigOptions.isSubwoofer)(!isSubwoofer)}>Is Subwoofer</Checkbox>} >
                <FineGrainSlider label="Distance" onChange={onChangeSpeakerData(speakerData, SpeakerConfigOptions.distance)} value={speakerData[SpeakerConfigOptions.distance]} max={30} />
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