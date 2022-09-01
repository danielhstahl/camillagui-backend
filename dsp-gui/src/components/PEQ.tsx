import { Col, Table, Slider } from 'antd'
const { Column } = Table;

export enum PEQOptions {
    type = "type",
    freq = "freq",
    gain = "gain",
    q = "q",
    key = "key"
}
export interface PEQ {
    [PEQOptions.key]: number,
    [PEQOptions.freq]: number,
    [PEQOptions.gain]: number,
    [PEQOptions.q]: number,
    [PEQOptions.type]?: string,

}

const PEQDisplay = ({ data }: { data: PEQ[] }) => {

    return <Col span={24}>
        <Table dataSource={data} pagination={false}>

            <Column title="Band" dataIndex={PEQOptions.key} key={PEQOptions.key} width='10%' />
            <Column title="Frequency" dataIndex={PEQOptions.freq} key={PEQOptions.freq} width='20%' render={(val: number) => (
                val
            )} />
            <Column title="Gain" dataIndex={PEQOptions.gain} key={PEQOptions.gain} width='50%'
                render={(val: number) => (
                    <Slider min={-20} max={10} value={val} />
                )}
            />
            <Column title="Q" dataIndex={PEQOptions.q} key={PEQOptions.q} width='20%'
                render={(val: number) => (
                    val
                )}
            />
        </Table>
    </Col>

}

export default PEQDisplay
