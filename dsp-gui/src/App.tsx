import { useEffect, useState } from 'react';
import './App.css';
import AppSkeleton from './ui-skeleton/AppSkeleton';
import SelectSpeakerConfig from './components/SelectSpeakerConfig'
import SpeakerConfig, { SpeakerConfigOptions, SpeakerData, DEFAULT_SPEAKERS } from './components/SpeakerConfig'
import { PEQ } from './components/PEQ'
import { Button, Row, Col } from 'antd';
import { convertStateToConfig, convertConfigToState } from './services/configMapper';
import { submitConfig, loadConfig, getAudioDevices } from './services/api';


//todo, allow speaker title edits
function App() {
  const [speakerOptions, setSpeakerOptions] = useState<{ [name: string]: SpeakerData }>(DEFAULT_SPEAKERS)
  const [configFile, setConfigFile] = useState("")
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

  const onSubmit = (speakerData: { [name: string]: SpeakerData }, configFile: string) => {
    const config = convertStateToConfig(speakerData)
    submitConfig(config, configFile)
  }
  useEffect(() => {
    getAudioDevices().then(console.log)
  }, [])

  return (
    <div className="App">
      <AppSkeleton >
        <Row gutter={16}>
          <Col>
            <SelectSpeakerConfig onSelect={file => {
              setConfigFile(file)
              loadConfig(file).then(convertConfigToState).then(setSpeakerOptions)
            }}
              onSubmit={onSubmit}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          {Object.entries(speakerOptions).map(([speakerTitle, options]) => {
            return <SpeakerConfig key={speakerTitle} speakerTitle={speakerTitle} speakerData={options} onChangeSpeakerData={onChange(speakerTitle)} />
          })}
        </Row>
        <Button onClick={() => onSubmit(speakerOptions, configFile)}>Submit</Button>
      </AppSkeleton>
    </div>
  );
}

export default App;
