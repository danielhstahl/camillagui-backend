import { InputNumber, Col, Table, Button, Modal } from 'antd'
import { PEQ, PEQOptions } from './PEQ'
import { useState } from 'react';
import FineGrainSlider from './FineGrainSlider'
import {
    DeleteOutlined
} from '@ant-design/icons';
const { Column } = Table


export const DEFAULT_PEQ = {
    q: 1,
    gain: 0,
    freq: 1000,
    type: "Peaking",
    key: 1
}
type OnChange = (data: PEQ[]) => void


const PEQModal = ({ data, onChange }: { data: PEQ[], onChange: OnChange }) => {
    const [showModal, setShowModal] = useState(false)
    const addRow = () => {
        onChange([...data, { ...DEFAULT_PEQ, key: data.length + 1 }])
    }
    const deleteRow = (index: number) => {
        onChange(data.filter((_v, i) => i !== index))
    }
    const updateRow = (index: number, row: PEQ, key: PEQOptions) => (value: number) => {
        const newRow = {
            ...row,
            [key]: value
        }
        onChange(data.map((v, i) => i === index ? newRow : v))
    }
    return <Col span={24}>
        <Button onClick={() => setShowModal(true)}>Edit PEQ</Button>
        <Modal cancelButtonProps={{ style: { display: 'none' } }} width="80%" title="PEQ" visible={showModal} onOk={() => setShowModal(false)} onCancel={() => setShowModal(false)}>
            <Button onClick={addRow}>Add Band</Button>
            <Table dataSource={data} pagination={false}>
                <Column title="Band" dataIndex="key" key="key" width='15%' />
                <Column title="Frequency" dataIndex={PEQOptions.freq} key={PEQOptions.freq} width='15%' render={(val: number, row: PEQ, index: number) => (
                    <InputNumber min={0} max={20000} value={val} onChange={updateRow(index, row, PEQOptions.freq)} />
                )} />
                <Column title="Gain" dataIndex={PEQOptions.gain} key={PEQOptions.gain} width='50%'
                    render={(val: number, row: PEQ, index: number) => (
                        <FineGrainSlider label="" onChange={updateRow(index, row, PEQOptions.gain)} value={val} min={-20} max={10} />
                    )}
                />
                <Column title="Q" dataIndex="q" key="q" width='15%'
                    render={(val: number, row: PEQ, index: number) => (
                        <InputNumber min={0} max={10} step={0.01} value={val} onChange={updateRow(index, row, PEQOptions.q)} />
                    )}
                />
                <Column title="" dataIndex="" key="" width='15%'
                    render={(val: number, row: PEQ, index: number) => (
                        <Button shape="circle" icon={<DeleteOutlined />} onClick={() => deleteRow(index)} />

                    )}
                />
            </Table>
        </Modal>
    </Col>
}

export default PEQModal
