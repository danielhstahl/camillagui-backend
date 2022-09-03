
import { Button, Row, Col, Select, Modal, Input } from 'antd';
import { useEffect, useState } from 'react';
import { getExistingConfigs } from '../services/api';
import { SpeakerData, DEFAULT_SPEAKERS } from './SpeakerConfig';
const { Option } = Select;

//TODO!  Add submit and possibly selection on create
const SelectSpeakerConfig = ({ onSelect, onSubmit }: {
    onSelect: (file: string) => void,
    onSubmit: (speakerData: { [name: string]: SpeakerData }, configFile: string) => void
}) => {
    const [configFiles, setConfigFiles] = useState<string[]>([])

    useEffect(() => {
        getExistingConfigs().then(setConfigFiles)
    }, [])
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [newConfigName, setNewConfigName] = useState("")
    return <Row gutter={16}>
        <Col xs={16}>
            <Select onChange={onSelect}>
                {configFiles.map(file => <Option value={file} key={file}>{file}</Option>)}
            </Select>
        </Col>
        <Col xs={8}>
            <Button onClick={() => setIsModalVisible(true)}>
                New Configuration
            </Button>

        </Col>
        <Modal title="New Configuration" visible={isModalVisible} onOk={() => {
            const configFile = `${newConfigName}.yaml`
            setConfigFiles(curr => [...curr, configFile])
            setNewConfigName("")
            onSubmit(DEFAULT_SPEAKERS, configFile)
            setIsModalVisible(false)
        }} onCancel={() => {
            setNewConfigName("")
            setIsModalVisible(false)
        }}>
            <Input onChange={e => setNewConfigName(e.target.value)} />
        </Modal>
    </Row>
}

export default SelectSpeakerConfig