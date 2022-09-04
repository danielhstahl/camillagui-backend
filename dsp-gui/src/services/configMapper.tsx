import { PEQ, PEQOptions } from "../components/PEQ"
import { SpeakerConfigOptions, SpeakerData } from "../components/SpeakerConfig"
export enum DeviceType {
    Alsa = "Alsa"
}
export enum DeviceFormat {
    S32LE = "S32LE"
}
export enum Resampler {
    FastAsync = "FastAsync"
}
interface Capture {
    avoid_blocking_read: boolean,
    channels: number,
    device: string,
    format: DeviceFormat,
    retry_on_error: boolean,
    type: DeviceType
}

interface Playback {
    channels: number,
    device: string,
    format: DeviceFormat,
    type: DeviceType
}

interface Devices {
    adjust_period: number,
    capture: Capture,
    capture_samplerate: number,
    chunksize: number,
    enable_rate_adjust: boolean,
    enable_resampling: boolean,
    playback: Playback,
    queuelimit: number,
    rate_measure_interval: number,
    resampler_type: Resampler,
    samplerate: number,
    silence_threshold: number,
    silence_timeout: number,
    stop_on_rate_change: boolean,
    target_level: number
}
export enum FilterType {
    Biquad = "Biquad",
    BiquadCombo = "BiquadCombo",
    Delay = "Delay"
}
interface PeakingFilter {
    parameters: PEQ,
    type: FilterType
}

interface SubwooferParameter {
    freq: number,
    order: number,
    type: string
}

interface DistanceParameter {
    unit: string,
    delay: number
}

interface DistanceFilter {
    parameters: DistanceParameter,
    type: FilterType
}

interface SubwooferFilter {
    parameters: SubwooferParameter,
    type: FilterType
}

interface Channels {
    in: number,
    out: number
}
interface Source {
    channel: number,
    gain: number,
    inverted: boolean,
    mute: boolean
}
interface Mapping {
    dest: number,
    mute: boolean,
    sources: Source[]
}
interface Mixer {
    channels: Channels
    mapping: Mapping[]
}

export enum PipelineType {
    Filter = "Filter",
    Mixer = "Mixer"
}
interface PipelineFilter {
    channel: number,
    names: string[], // maps to filter or mixer names
    type: PipelineType
}
interface PipelineMixer {
    name: string,
    type: PipelineType
}

export interface Config {
    devices: Devices,
    filters: { [name: string]: PeakingFilter | SubwooferFilter | DistanceFilter },
    mixers: { [name: string]: Mixer },
    pipeline: (PipelineFilter | PipelineMixer)[]
}

const convertPeqToFilters: (speakerName: string, peq: PEQ[]) => { [name: string]: PeakingFilter } = (speakerName: string, peq: PEQ[]) => {
    return peq.reduce((aggr, curr) => {
        const { key, ...rest } = curr
        return {
            ...aggr,
            [`${speakerName}_${key}_peq`]: {
                type: FilterType.Biquad,
                parameters: {
                    ...rest,
                    [PEQOptions.type]: "Peaking"
                }
            }
        }
    }, {})
}

const convertCrossoverToFilters: (speakerName: string, crossover: number) => { [name: string]: SubwooferFilter } = (speakerName: string, crossover: number) => {
    return {
        [`${speakerName}_subwoofer`]: {
            type: FilterType.BiquadCombo,
            parameters: {
                freq: crossover,
                order: 2, //TODO, check this
                type: "ButterworthHighpass"
            }
        }
    }
}

//const SPEED_OF_SOUND_IN_FEET_PER_MS = 1.087

const convertDistanceToFilters: (speakerName: string, delay: number) => { [name: string]: DistanceFilter } = (speakerName: string, delay: number) => {
    return {
        [`${speakerName}_delay`]: {
            type: FilterType.Delay,
            parameters: {
                delay, //(distance - minDistance) / SPEED_OF_SOUND_IN_FEET_PER_MS,
                unit: "ms" //millimeters
            }
        }
    }
}

/*
const getMinDistance = (result: { [name: string]: SpeakerData }) => {
    return Math.min(...Object.values(result).map((speakerData) => speakerData[SpeakerConfigOptions.distance]))
}*/

const getIndecesOfSpeakerType = (speakers: [string, SpeakerData][], getSubwoofer: boolean) => {
    return speakers.map(([speakerName, speakerData]) => ({ speakerName, isSub: speakerData[SpeakerConfigOptions.isSubwoofer], origIndex: speakerData[SpeakerConfigOptions.index] })).filter(({ isSub }) => isSub === getSubwoofer).map(({ speakerName, origIndex }) => ({ speakerName, speakerIndex: origIndex }))
}

const getSpeakerTypes = (result: { [name: string]: SpeakerData }) => {
    const speakers = Object.entries(result)
    const speakerIndeces = getIndecesOfSpeakerType(speakers, false)
    const subwooferIndeces = getIndecesOfSpeakerType(speakers, true)
    return { satellites: speakerIndeces, subwoofers: subwooferIndeces }
}

const convertSubwooferMixer: (result: { [name: string]: SpeakerData }) => { [name: string]: Mixer } = (result: { [name: string]: SpeakerData }) => {
    const { satellites, subwoofers } = getSpeakerTypes(result)
    const minSubIndex = Math.min(...subwoofers.map(v => v.speakerIndex))
    return {
        subwoofer_mix: {
            channels: {
                in: satellites.length + (subwoofers.length > 0 ? 1 : 0),
                out: satellites.length + subwoofers.length
            },
            mapping: [...satellites.map(v => ({
                dest: v.speakerIndex,
                mute: false,
                sources: [{
                    channel: v.speakerIndex,
                    gain: 0,
                    inverted: false,
                    mute: false
                }]
            })), ...subwoofers.map(v => ({
                dest: v.speakerIndex,
                mute: false,
                sources: satellites.map(v => ({
                    channel: minSubIndex,
                    gain: 0,
                    inverted: false,
                    mute: false
                }))
            }))]
        }
    }
}


const convertAllChannelMixer: (result: { [name: string]: SpeakerData }) => { [name: string]: Mixer } = (result: { [name: string]: SpeakerData }) => {
    const { satellites, subwoofers } = getSpeakerTypes(result)
    const minSubIndex = Math.min(...subwoofers.map(v => v.speakerIndex))
    return {
        all_channel_mix: {
            channels: {
                in: satellites.length + subwoofers.length,
                out: satellites.length + subwoofers.length
            },
            mapping: [...satellites.map(v => ({
                dest: result[v.speakerName][SpeakerConfigOptions.index],
                mute: false,
                sources: [{
                    channel: result[v.speakerName][SpeakerConfigOptions.index],
                    gain: result[v.speakerName][SpeakerConfigOptions.gain],
                    inverted: false,
                    mute: false
                }]
            })), ...subwoofers.map(v => ({
                dest: result[v.speakerName][SpeakerConfigOptions.index],
                mute: false,
                sources: [{
                    channel: minSubIndex,
                    gain: result[v.speakerName][SpeakerConfigOptions.gain],
                    inverted: false,
                    mute: false
                }]
            }))]
        }
    }

}

const convertPipeline: (result: { [name: string]: SpeakerData }) => (PipelineFilter | PipelineMixer)[] = (result: { [name: string]: SpeakerData }) => {
    const { satellites, subwoofers } = getSpeakerTypes(result)

    const peqPipeline: PipelineFilter[] = [...satellites, ...subwoofers].map(({ speakerName, speakerIndex }) => {
        return {
            channel: speakerIndex,
            names: Object.keys(convertPeqToFilters(speakerName, result[speakerName][SpeakerConfigOptions.peq])),
            type: PipelineType.Filter
        }
    }).filter(v => v.names.length > 0)

    const distancePipeline: PipelineFilter[] = [...satellites, ...subwoofers].map(({ speakerName, speakerIndex }) => {
        return {
            channel: speakerIndex,
            names: Object.keys(convertDistanceToFilters(speakerName, result[speakerName][SpeakerConfigOptions.delay])),
            type: PipelineType.Filter
        }
    })

    const satelliteCrossoverPipeline: PipelineFilter[] = satellites.map(({ speakerName, speakerIndex }) => {
        return {
            channel: speakerIndex,
            names: Object.keys(convertCrossoverToFilters(speakerName, result[speakerName][SpeakerConfigOptions.crossover])),
            type: PipelineType.Filter
        }
    })


    const subMixerPipeline: PipelineMixer[] = Object.keys(convertSubwooferMixer(result)).map(v => ({ name: v, type: PipelineType.Mixer }))
    const allMixerPipeline: PipelineMixer[] = Object.keys(convertAllChannelMixer(result)).map(v => ({ name: v, type: PipelineType.Mixer }))

    return [...satelliteCrossoverPipeline, ...subMixerPipeline, ...allMixerPipeline, ...peqPipeline, ...distancePipeline]
}

const convertAllFilters: (result: { [name: string]: SpeakerData }) => { [name: string]: SubwooferFilter | DistanceFilter | PeakingFilter } = (result: { [name: string]: SpeakerData }) => {
    //const minDistance = getMinDistance(result)
    const { satellites, subwoofers } = getSpeakerTypes(result)
    const peqFilter = [...satellites, ...subwoofers].reduce((aggr, curr) => {
        return { ...aggr, ...convertPeqToFilters(curr.speakerName, result[curr.speakerName][SpeakerConfigOptions.peq]) }
    }, {})
    const distanceFilter = [...satellites, ...subwoofers].reduce((aggr, curr) => {
        return { ...aggr, ...convertDistanceToFilters(curr.speakerName, result[curr.speakerName][SpeakerConfigOptions.delay]) }
    }, {})
    const crossoverFilter = satellites.reduce((aggr, curr) => {
        return { ...aggr, ...convertCrossoverToFilters(curr.speakerName, result[curr.speakerName][SpeakerConfigOptions.crossover]) }
    }, {})

    return { ...peqFilter, ...distanceFilter, ...crossoverFilter }

}
const convertAllMixers: (result: { [name: string]: SpeakerData }) => { [name: string]: Mixer } = (result: { [name: string]: SpeakerData }) => {
    return { ...convertSubwooferMixer(result), ...convertAllChannelMixer(result) }
}

const getDevice = (result: { [name: string]: SpeakerData }) => {
    const { satellites, subwoofers } = getSpeakerTypes(result)
    return {
        adjust_period: 3,
        capture: {
            avoid_blocking_read: false,
            channels: satellites.length + (subwoofers.length > 0 ? 1 : 0), //need only 1 subwoofer input
            device: "hw:Loopback,0,0", //I think this is consisten across devices? https://henquist.github.io/0.6.2/backend_alsa.html#find-name-of-device
            format: DeviceFormat.S32LE,
            retry_on_error: false,
            type: DeviceType.Alsa,
        },
        capture_samplerate: 48000,
        chunksize: 1024,
        enable_rate_adjust: true,
        enable_resampling: true,
        playback: {
            channels: Object.keys(result).length,
            device: "hw:b1",/// hw:{id} from dropdwn
            format: DeviceFormat.S32LE,
            type: DeviceType.Alsa,
        },
        queuelimit: 4,
        rate_measure_interval: 1,
        resampler_type: Resampler.FastAsync,
        samplerate: 96000,
        silence_threshold: 0,
        silence_timeout: 0,
        stop_on_rate_change: false,
        target_level: 1024
    }
}
//need to autogenerate devices by sample rate, I think?
export const convertStateToConfig: (result: { [name: string]: SpeakerData }) => Config = (result: { [name: string]: SpeakerData }) => {
    return {
        devices: getDevice(result),
        filters: convertAllFilters(result),
        mixers: convertAllMixers(result),
        pipeline: convertPipeline(result)
    }
}

const getSpeakerFromConfig = (config: Config) => {
    const speakerNameAndIndex = config.pipeline.filter((v): v is PipelineFilter => v.type === PipelineType.Filter).filter((v: PipelineFilter) => v.names[0].endsWith("_delay")).map(v => ({ speakerIndex: v.channel, speakerName: v.names[0].replace("_delay", "") }))
    return speakerNameAndIndex
}
interface SpeakerAndIndex {
    speakerName: string,
    speakerIndex: number
}
const getSubwoofersFromConfig: (config: Config, speakerNameAndIndex: SpeakerAndIndex[]) => { [name: string]: boolean } = (config: Config, speakerNameAndIndex: SpeakerAndIndex[]) => {
    const subwooferIndeces = config.mixers.subwoofer_mix.mapping.filter(v => v.sources.length > 1).map(v => v.dest)
    console.log(subwooferIndeces)
    console.log(speakerNameAndIndex)
    return speakerNameAndIndex.reduce((agg, v) => ({ ...agg, [v.speakerName]: subwooferIndeces.includes(v.speakerIndex) }), {})
}

const getPeqFromConfig: (config: Config, speakerNameAndIndex: SpeakerAndIndex[]) => { [name: string]: PEQ[] } = (config: Config, speakerNameAndIndex: SpeakerAndIndex[]) => {
    const peqFilterNames = Object.keys(config.filters).filter(v => v.endsWith("_peq"))
    return speakerNameAndIndex.reduce((agg, v) => {
        const speakerFilters = peqFilterNames.filter(x => x.startsWith(v.speakerName))
        const peq: PEQ[] = speakerFilters.map(x => {
            const key = parseInt(x.replace("_peq", "").replace(`${v.speakerName}_`, ""))
            const peqConfig = config.filters[x] as PeakingFilter
            return { ...peqConfig.parameters, key }
        })
        return { ...agg, [v.speakerName]: peq }
    }, {})
}

const getDistanceFromConfig: (config: Config, speakerNameAndIndex: SpeakerAndIndex[]) => { [name: string]: number } = (config: Config, speakerNameAndIndex: SpeakerAndIndex[]) => {
    const distanceFilterNames = Object.entries(config.filters).filter(([k, v]) => v.type === FilterType.Delay).map(([k, v]) => ({ speakerName: k, delayFilter: (v.parameters as DistanceParameter) }), {})
    return speakerNameAndIndex.reduce((agg, v) => {
        const filterName = distanceFilterNames.find(x => x.speakerName.startsWith(v.speakerName))
        if (filterName) {
            return { ...agg, [v.speakerName]: filterName.delayFilter.delay }
        }
        else {
            return agg
        }
    }, {})

}

const getGainFromConfig: (config: Config, speakerNameAndIndex: SpeakerAndIndex[]) => { [name: string]: number } = (config: Config, speakerNameAndIndex: SpeakerAndIndex[]) => {
    return speakerNameAndIndex.reduce((agg, v) => ({
        ...agg,
        [v.speakerName]: config.mixers.all_channel_mix.mapping.find(x => v.speakerIndex === x.dest)?.sources[0].gain
    }), {})
}

const getCrossoverFromConfig: (config: Config, speakerNameAndIndex: SpeakerAndIndex[]) => { [name: string]: number } = (config: Config, speakerNameAndIndex: SpeakerAndIndex[]) => {
    const subwooferFilterNames = Object.keys(config.filters).filter(v => v.endsWith("_subwoofer"))
    return speakerNameAndIndex.reduce((agg, v) => {
        const speakerFilter = subwooferFilterNames.find(x => x.startsWith(v.speakerName))
        if (speakerFilter) {
            const crossover = (config.filters[speakerFilter] as SubwooferFilter).parameters.freq
            return {
                ...agg,
                [v.speakerName]: crossover
            }
        }
        else {
            return {
                ...agg,
                [v.speakerName]: 80 //doesn't matter for subwoofers
            }
        }
    }, {})
}

export const convertConfigToState: (config: Config) => { [name: string]: SpeakerData } = (config: Config) => {
    const speakers = getSpeakerFromConfig(config)
    const subwoofers = getSubwoofersFromConfig(config, speakers)
    const peqs = getPeqFromConfig(config, speakers)
    const distances = getDistanceFromConfig(config, speakers)
    const gains = getGainFromConfig(config, speakers)
    const crossovers = getCrossoverFromConfig(config, speakers)
    const speakerNameObject = speakers.reduce((agg, cur) => {
        return {
            ...agg, [cur.speakerName]: {
                [SpeakerConfigOptions.index]: cur.speakerIndex,
                [SpeakerConfigOptions.delay]: distances[cur.speakerName],
                [SpeakerConfigOptions.gain]: gains[cur.speakerName],
                [SpeakerConfigOptions.peq]: peqs[cur.speakerName],
                [SpeakerConfigOptions.isSubwoofer]: subwoofers[cur.speakerName],
                [SpeakerConfigOptions.crossover]: crossovers[cur.speakerName],
            }
        }
    }, {})
    return speakerNameObject
}