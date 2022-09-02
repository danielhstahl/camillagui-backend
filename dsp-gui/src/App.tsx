import { useState } from 'react';
import './App.css';
import AppSkeleton from './ui-skeleton/AppSkeleton';
import SelectSpeakerConfig from './components/SelectSpeakerConfig'
import SpeakerConfig, { SpeakerConfigOptions, SpeakerData } from './components/SpeakerConfig'
import { PEQ } from './components/PEQ'
import { Button, Row, Col } from 'antd';
import { convertStateToConfig, convertConfigToState } from './services/configMapper';
import { submitConfig, loadConfig } from './services/api';

//index maps to the hardware speaker index
const getDefaultSpeakerOptions = (index: number) => ({
  [SpeakerConfigOptions.crossover]: 80,
  [SpeakerConfigOptions.delay]: 5,
  [SpeakerConfigOptions.isSubwoofer]: false,
  [SpeakerConfigOptions.peq]: [],
  [SpeakerConfigOptions.index]: index,
  [SpeakerConfigOptions.gain]: 0,
})

const DEFAULT_SPEAKERS = {
  "Left Speaker": getDefaultSpeakerOptions(0),
  "Right Speaker": getDefaultSpeakerOptions(1),
  "Center Speaker": getDefaultSpeakerOptions(2),
  "Surround Left": getDefaultSpeakerOptions(3),
  "Surround Right": getDefaultSpeakerOptions(4),
  "Subwoofer 1": { ...getDefaultSpeakerOptions(5), [SpeakerConfigOptions.isSubwoofer]: true },
  "Subwoofer 2": { ...getDefaultSpeakerOptions(6), [SpeakerConfigOptions.isSubwoofer]: true },
}
//todo, allow speaker title edits
function App() {
  const [speakerOptions, setSpeakerOptions] = useState<{ [name: string]: SpeakerData }>(DEFAULT_SPEAKERS)
  const [configFile, setConfigFile] = useState("")
  //const [configFiles, setConfigFiles] = useState([])
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

  return (
    <div className="App">
      <AppSkeleton >
        <Row gutter={16}>
          <Col>
            <SelectSpeakerConfig onSelect={file => {
              setConfigFile(file)
              loadConfig(file).then(convertConfigToState).then(setSpeakerOptions)
            }} />
          </Col>
        </Row>
        <Row gutter={16}>
          {Object.entries(speakerOptions).map(([speakerTitle, options]) => {
            return <SpeakerConfig key={speakerTitle} speakerTitle={speakerTitle} speakerData={options} onChangeSpeakerData={onChange(speakerTitle)} />
          })}
        </Row>
        <Button onClick={() => {
          const config = convertStateToConfig(speakerOptions)
          submitConfig(config, configFile)
        }}>Submit</Button>
      </AppSkeleton>
    </div>
  );
}

export default App;
