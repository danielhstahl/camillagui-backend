import { useEffect, useState } from 'react';
import './App.css';
import AppSkeleton from './ui-skeleton/AppSkeleton';
import SpeakerConfig, { SpeakerConfigOptions, SpeakerData } from './components/SpeakerConfig'
import { PEQ } from './components/PEQ'
import { Row } from 'antd';
import { convertStateToConfig } from './services/generateConfig';
//index maps to the hardware speaker index
const getDefaultSpeakerOptions = (index: number) => ({
  [SpeakerConfigOptions.crossover]: 80,
  [SpeakerConfigOptions.distance]: 10,
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
  const [speakerOptions, setSpeakerOptions] = useState(DEFAULT_SPEAKERS)
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
  useEffect(() => {
    console.log(convertStateToConfig(speakerOptions))
  }, [speakerOptions])
  return (
    <div className="App">
      <AppSkeleton >
        <Row gutter={16}>
          {Object.entries(speakerOptions).map(([speakerTitle, options]) => {
            return <SpeakerConfig key={speakerTitle} speakerTitle={speakerTitle} speakerData={options} onChangeSpeakerData={onChange(speakerTitle)} />
          })}

        </Row>
      </AppSkeleton>
    </div>
  );
}

export default App;
