import { useEffect, useState } from 'react';
import './App.css';
import AppSkeleton from './ui-skeleton/AppSkeleton';
import SelectSpeakerConfig from './components/SelectSpeakerConfig'
import SpeakerConfig, { SpeakerConfigOptions, SpeakerData, DEFAULT_SPEAKERS } from './components/SpeakerConfig'
import { PEQ } from './components/PEQ'
import { Button, Row } from 'antd';
import { convertStateToConfig, convertConfigToState } from './services/configMapper';
import { submitConfig, loadConfig, getAudioDevices, deleteConfig } from './services/api';

const onSubmit = (speakerData: { [name: string]: SpeakerData }, configFile: string) => {
  const config = convertStateToConfig(speakerData)
  return submitConfig(config, configFile)
}

/*
const SelectAudioDevice = () => <Input.Group style={{ width: "100%" }}>
  <Select onChange={onChange}>
    {devices.map(device => <Option value={file} key={file}>{file}</Option>)}
  </Select>
</Input.Group>*/


//todo, allow speaker title edits
function App() {
  const [speakerOptions, setSpeakerOptions] = useState<{ [name: string]: SpeakerData }>(DEFAULT_SPEAKERS)
  const [configFile, setConfigFile] = useState("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const onChange = (speakerKey: string) => {
    return (data: SpeakerData, speakerConfigKey: SpeakerConfigOptions) => (value: PEQ[] | number | boolean) => {
      setSpeakerOptions(currState => ({
        ...currState,
        [speakerKey]: {
          ...data,
          [speakerConfigKey]: value
        }
      }))
    }
  }

  const onDelete = () => {
    return Promise.all([
      deleteConfig(configFile),
      setConfigFile("")
    ]).then(() => { })
  }

  useEffect(() => {
    //for testing
    getAudioDevices().then(console.log)
  }, [])

  return (
    <div className="App">
      <AppSkeleton >
        <SelectSpeakerConfig onSelect={file => {
          setConfigFile(file)
          loadConfig(file).then(convertConfigToState).then(setSpeakerOptions)
        }}
          onSubmit={onSubmit}
          configFile={configFile}
          onDelete={onDelete}
        />
        <Row gutter={16}>
          {Object.entries(speakerOptions).map(([speakerTitle, options]) => {
            return <SpeakerConfig key={speakerTitle} speakerTitle={speakerTitle} speakerData={options} onChangeSpeakerData={onChange(speakerTitle)} />
          })}
        </Row>
        <Button loading={isLoading} onClick={() => {
          setIsLoading(true)
          onSubmit(speakerOptions, configFile).finally(() => setIsLoading(false))
        }}>Submit</Button>
      </AppSkeleton>
    </div>
  );
}

export default App;
