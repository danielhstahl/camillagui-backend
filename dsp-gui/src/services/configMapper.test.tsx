import {
    convertStateToConfig,
    convertConfigToState,
    DeviceFormat,
    DeviceType,
    Resampler,
    PipelineType,
    FilterType
} from './configMapper'
import { SpeakerConfigOptions } from '../components/SpeakerConfig'
import { PEQOptions } from '../components/PEQ'

describe("stateToConfig", () => {
    it("generates config with no peq", () => {
        const speakers = {
            "speak1": {
                [SpeakerConfigOptions.crossover]: 80,
                [SpeakerConfigOptions.delay]: 2000, //2 meters
                [SpeakerConfigOptions.isSubwoofer]: false,
                [SpeakerConfigOptions.peq]: [],
                [SpeakerConfigOptions.index]: 0,
                [SpeakerConfigOptions.gain]: 0,
            },
            "speak2": {
                [SpeakerConfigOptions.crossover]: 80,
                [SpeakerConfigOptions.delay]: 2000, //2 meters
                [SpeakerConfigOptions.isSubwoofer]: false,
                [SpeakerConfigOptions.peq]: [],
                [SpeakerConfigOptions.index]: 1,
                [SpeakerConfigOptions.gain]: 0,
            },
        }
        expect(convertStateToConfig(speakers)).toBeDefined()
    })

    it("generates config with peq", () => {
        const speakers = {
            "speak1": {
                [SpeakerConfigOptions.crossover]: 80,
                [SpeakerConfigOptions.delay]: 2000, //2 meters
                [SpeakerConfigOptions.isSubwoofer]: false,
                [SpeakerConfigOptions.peq]: [
                    {
                        [PEQOptions.key]: 0,
                        [PEQOptions.freq]: 300,
                        [PEQOptions.gain]: 1,
                        [PEQOptions.q]: 1,
                    }
                ],
                [SpeakerConfigOptions.index]: 0,
                [SpeakerConfigOptions.gain]: 0,
            },
            "speak2": {
                [SpeakerConfigOptions.crossover]: 80,
                [SpeakerConfigOptions.delay]: 2000, //2 meters
                [SpeakerConfigOptions.isSubwoofer]: false,
                [SpeakerConfigOptions.peq]: [
                    {
                        [PEQOptions.key]: 0,
                        [PEQOptions.freq]: 300,
                        [PEQOptions.gain]: 1,
                        [PEQOptions.q]: 1
                    }
                ],
                [SpeakerConfigOptions.index]: 1,
                [SpeakerConfigOptions.gain]: 0,
            },
        }
        expect(convertStateToConfig(speakers)).toBeDefined()
    })
})


describe("configToState", () => {
    it("generates state with no peq", () => {
        const config = {
            "devices": {
                "adjust_period": 3,
                "capture": {
                    "avoid_blocking_read": false,
                    "channels": 6,
                    "device": "hw:0",
                    "format": DeviceFormat.S32LE,
                    "retry_on_error": false,
                    "type": DeviceType.Alsa
                },
                "capture_samplerate": 48000,
                "chunksize": 1024,
                "enable_rate_adjust": true,
                "enable_resampling": true,
                "playback": {
                    "channels": 7,
                    "device": "hw:0",
                    "format": DeviceFormat.S32LE,
                    "type": DeviceType.Alsa
                },
                "queuelimit": 4,
                "rate_measure_interval": 1,
                "resampler_type": Resampler.FastAsync,
                "samplerate": 96000,
                "silence_threshold": 0,
                "silence_timeout": 0,
                "stop_on_rate_change": false,
                "target_level": 1024
            },
            "filters": {
                "Center Speaker_delay": {
                    "parameters": {
                        "delay": 0,
                        "unit": "ms",
                        "subsample": false
                    },
                    "type": FilterType.Delay
                },
                "Center Speaker_subwoofer": {
                    "parameters": {
                        "freq": 80,
                        "order": 2,
                        "type": "ButterworthHighpass"
                    },
                    "type": FilterType.BiquadCombo
                },
                "Left Speaker_delay": {
                    "parameters": {
                        "delay": 0,
                        "unit": "ms",
                        "subsample": false
                    },
                    "type": FilterType.Delay
                },
                "Left Speaker_subwoofer": {
                    "parameters": {
                        "freq": 80,
                        "order": 2,
                        "type": "ButterworthHighpass"
                    },
                    "type": FilterType.BiquadCombo
                },
                "Right Speaker_delay": {
                    "parameters": {
                        "delay": 0,
                        "unit": "ms",
                        "subsample": false
                    },
                    "type": FilterType.Delay
                },
                "Right Speaker_subwoofer": {
                    "parameters": {
                        "freq": 80,
                        "order": 2,
                        "type": "ButterworthHighpass"
                    },
                    "type": FilterType.BiquadCombo
                },
                "Subwoofer 1_delay": {
                    "parameters": {
                        "delay": 0,
                        "unit": "ms",
                        "subsample": false
                    },
                    "type": FilterType.Delay
                },
                "Subwoofer 2_delay": {
                    "parameters": {
                        "delay": 0,
                        "unit": "ms",
                        "subsample": false
                    },
                    "type": FilterType.Delay
                },
                "Surround Left_delay": {
                    "parameters": {
                        "delay": 0,
                        "unit": "ms",
                        "subsample": false
                    },
                    "type": FilterType.Delay
                },
                "Surround Left_subwoofer": {
                    "parameters": {
                        "freq": 80,
                        "order": 2,
                        "type": "ButterworthHighpass"
                    },
                    "type": FilterType.BiquadCombo
                },
                "Surround Right_delay": {
                    "parameters": {
                        "delay": 0,
                        "unit": "ms",
                        "subsample": false
                    },
                    "type": FilterType.Delay
                },
                "Surround Right_subwoofer": {
                    "parameters": {
                        "freq": 80,
                        "order": 2,
                        "type": "ButterworthHighpass"
                    },
                    "type": FilterType.BiquadCombo
                }
            },
            "mixers": {
                "all_channel_mix": {
                    "channels": {
                        "in": 7,
                        "out": 7
                    },
                    "mapping": [
                        {
                            "dest": 0,
                            "mute": false,
                            "sources": [
                                {
                                    "channel": 0,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                }
                            ]
                        },
                        {
                            "dest": 1,
                            "mute": false,
                            "sources": [
                                {
                                    "channel": 1,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                }
                            ]
                        },
                        {
                            "dest": 2,
                            "mute": false,
                            "sources": [
                                {
                                    "channel": 2,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                }
                            ]
                        },
                        {
                            "dest": 3,
                            "mute": false,
                            "sources": [
                                {
                                    "channel": 3,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                }
                            ]
                        },
                        {
                            "dest": 4,
                            "mute": false,
                            "sources": [
                                {
                                    "channel": 4,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                }
                            ]
                        },
                        {
                            "dest": 5,
                            "mute": false,
                            "sources": [
                                {
                                    "channel": 5,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                }
                            ]
                        },
                        {
                            "dest": 6,
                            "mute": false,
                            "sources": [
                                {
                                    "channel": 5,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                }
                            ]
                        }
                    ]
                },
                "subwoofer_mix": {
                    "channels": {
                        "in": 6,
                        "out": 7
                    },
                    "mapping": [
                        {
                            "dest": 0,
                            "mute": false,
                            "sources": [
                                {
                                    "channel": 0,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                }
                            ]
                        },
                        {
                            "dest": 1,
                            "mute": false,
                            "sources": [
                                {
                                    "channel": 1,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                }
                            ]
                        },
                        {
                            "dest": 2,
                            "mute": false,
                            "sources": [
                                {
                                    "channel": 2,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                }
                            ]
                        },
                        {
                            "dest": 3,
                            "mute": false,
                            "sources": [
                                {
                                    "channel": 3,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                }
                            ]
                        },
                        {
                            "dest": 4,
                            "mute": false,
                            "sources": [
                                {
                                    "channel": 4,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                }
                            ]
                        },
                        {
                            "dest": 5,
                            "mute": false,
                            "sources": [
                                {
                                    "channel": 5,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                },
                                {
                                    "channel": 5,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                },
                                {
                                    "channel": 5,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                },
                                {
                                    "channel": 5,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                },
                                {
                                    "channel": 5,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                }
                            ]
                        },
                        {
                            "dest": 6,
                            "mute": false,
                            "sources": [
                                {
                                    "channel": 5,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                },
                                {
                                    "channel": 5,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                },
                                {
                                    "channel": 5,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                },
                                {
                                    "channel": 5,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                },
                                {
                                    "channel": 5,
                                    "gain": 0,
                                    "inverted": false,
                                    "mute": false
                                }
                            ]
                        }
                    ]
                }
            },
            "pipeline": [
                {
                    "channel": 0,
                    "names": [
                        "Left Speaker_subwoofer"
                    ],
                    "type": PipelineType.Filter
                },
                {
                    "channel": 1,
                    "names": [
                        "Right Speaker_subwoofer"
                    ],
                    "type": PipelineType.Filter
                },
                {
                    "channel": 2,
                    "names": [
                        "Center Speaker_subwoofer"
                    ],
                    "type": PipelineType.Filter
                },
                {
                    "channel": 3,
                    "names": [
                        "Surround Left_subwoofer"
                    ],
                    "type": PipelineType.Filter
                },
                {
                    "channel": 4,
                    "names": [
                        "Surround Right_subwoofer"
                    ],
                    "type": PipelineType.Filter
                },
                {
                    "name": "subwoofer_mix",
                    "type": PipelineType.Mixer
                },
                {
                    "name": "all_channel_mix",
                    "type": PipelineType.Mixer
                },
                {
                    "channel": 0,
                    "names": [
                        "Left Speaker_delay"
                    ],
                    "type": PipelineType.Filter
                },
                {
                    "channel": 1,
                    "names": [
                        "Right Speaker_delay"
                    ],
                    "type": PipelineType.Filter
                },
                {
                    "channel": 2,
                    "names": [
                        "Center Speaker_delay"
                    ],
                    "type": PipelineType.Filter
                },
                {
                    "channel": 3,
                    "names": [
                        "Surround Left_delay"
                    ],
                    "type": PipelineType.Filter
                },
                {
                    "channel": 4,
                    "names": [
                        "Surround Right_delay"
                    ],
                    "type": PipelineType.Filter
                },
                {
                    "channel": 5,
                    "names": [
                        "Subwoofer 1_delay"
                    ],
                    "type": PipelineType.Filter
                },
                {
                    "channel": 6,
                    "names": [
                        "Subwoofer 2_delay"
                    ],
                    "type": PipelineType.Filter
                }
            ]
        }
        expect(convertConfigToState(config)).toBeDefined()
    })
    it("goes back and forth with no issues", () => {
        const speakers = {
            "speak1": {
                [SpeakerConfigOptions.crossover]: 80,
                [SpeakerConfigOptions.delay]: 2000, //2 meters
                [SpeakerConfigOptions.isSubwoofer]: false,
                [SpeakerConfigOptions.peq]: [
                    {
                        [PEQOptions.key]: 0,
                        [PEQOptions.freq]: 300,
                        [PEQOptions.gain]: 1,
                        [PEQOptions.q]: 1,
                        [PEQOptions.type]: "Peaking",
                    }
                ],
                [SpeakerConfigOptions.index]: 0,
                [SpeakerConfigOptions.gain]: 0,
            },
            "speak2": {
                [SpeakerConfigOptions.crossover]: 80,
                [SpeakerConfigOptions.delay]: 2000, //2 meters
                [SpeakerConfigOptions.isSubwoofer]: false,
                [SpeakerConfigOptions.peq]: [
                    {
                        [PEQOptions.key]: 0,
                        [PEQOptions.freq]: 300,
                        [PEQOptions.gain]: 1,
                        [PEQOptions.q]: 1,
                        [PEQOptions.type]: "Peaking",
                    }
                ],
                [SpeakerConfigOptions.index]: 1,
                [SpeakerConfigOptions.gain]: 0,
            },
        }
        expect(convertConfigToState(convertStateToConfig(speakers))).toEqual(speakers)
    })
})