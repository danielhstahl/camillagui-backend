
import { Button, Select, Modal, Input } from 'antd';
import { useEffect, useState } from 'react';
import { getExistingConfigs } from '../services/api';
import { SpeakerData, DEFAULT_SPEAKERS } from './SpeakerConfig';
const { Option } = Select;

const SelectSpeakerConfig = ({ configFile, onSelect, onSubmit, onDelete }: {
    onSelect: (file: string) => void,
    onSubmit: (speakerData: { [name: string]: SpeakerData }, configFile: string) => void,
    onDelete: () => Promise<void>,
    configFile: string
}) => {
    const [configFiles, setConfigFiles] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        getExistingConfigs().then(setConfigFiles)
    }, [])
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [newConfigName, setNewConfigName] = useState("")
    return <div style={{ paddingBottom: 15 }}>
        <Input.Group style={{ width: "100%" }}>
            <Select value={configFile} onChange={onSelect} style={{ width: "60%" }}>
                {configFiles.map(file => <Option value={file} key={file}>{file}</Option>)}
            </Select>
            <Button onClick={() => setIsModalVisible(true)}>
                New Config
            </Button>
            <Button loading={isLoading} danger disabled={configFile === ""} onClick={() => {
                setIsLoading(true)
                onDelete().then(() => setConfigFiles(curr => curr.filter(v => v !== configFile))).finally(() => setIsLoading(false))
            }}>
                Delete Selected Config
            </Button>
        </Input.Group>

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
    </div>
}

export default SelectSpeakerConfig