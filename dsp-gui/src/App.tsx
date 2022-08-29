import { useState } from 'react';
import './App.css';
import AppSkeleton from './ui-skeleton/AppSkeleton';
import SpeakerConfig, { SpeakerConfigOptions, SpeakerData } from './components/SpeakerConfig'
import { PEQ } from './components/PEQ'
import { Row } from 'antd';

const DEFAULT_SPEAKER_OPTIONS = {
  [SpeakerConfigOptions.crossover]: 80,
  [SpeakerConfigOptions.distance]: 10,
  [SpeakerConfigOptions.isSubwoofer]: false,
  [SpeakerConfigOptions.peq]: [],
}

const DEFAULT_SPEAKERS = {
  "Left Speaker": DEFAULT_SPEAKER_OPTIONS,
  "Right Speaker": DEFAULT_SPEAKER_OPTIONS,
  "Center Speaker": DEFAULT_SPEAKER_OPTIONS,
  "Surround Left": DEFAULT_SPEAKER_OPTIONS,
  "Surround Right": DEFAULT_SPEAKER_OPTIONS,
  "Subwoofer 1": { ...DEFAULT_SPEAKER_OPTIONS, [SpeakerConfigOptions.isSubwoofer]: true },
  "Subwoofer 2": { ...DEFAULT_SPEAKER_OPTIONS, [SpeakerConfigOptions.isSubwoofer]: true },
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
