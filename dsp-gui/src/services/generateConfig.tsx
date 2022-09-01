import { PEQ, PEQOptions } from "../components/PEQ"
import { SpeakerConfigOptions, SpeakerData } from "../components/SpeakerConfig"
enum DeviceType {
    Alsa = "Alsa"
}
enum DeviceFormat {
    S32LE = "S32LE"
}
enum Resampler {
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
enum FilterType {
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

enum PipelineType {
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
    return peq.reduce((aggr, curr, index) => {
        const { key, ...rest } = curr
        return {
            ...aggr,
            [`${speakerName}_${index}`]: {
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

const SPEED_OF_SOUND_IN_FEET_PER_MS = 1.087

const convertDistanceToFilters: (speakerName: string, minDistance: number, distance: number) => { [name: string]: DistanceFilter } = (speakerName: string, minDistance: number, distance: number) => {
    return {
        [`${speakerName}_delay`]: {
            type: FilterType.Delay,
            parameters: {
                delay: (distance - minDistance) / SPEED_OF_SOUND_IN_FEET_PER_MS,
                unit: "ms" //TODO, check this
            }
        }
    }
}

const getMinDistance = (result: { [name: string]: SpeakerData }) => {
    return Math.min(...Object.values(result).map((speakerData) => speakerData[SpeakerConfigOptions.distance]))
}

const getIndecesOfSpeakerType = (speakers: [string, SpeakerData][], getSubwoofer: boolean) => {
    return speakers.map(([speakerName, speakerData]) => ({ speakerName, isSub: speakerData[SpeakerConfigOptions.isSubwoofer], origIndex: speakerData[SpeakerConfigOptions.index] })).filter(({ isSub }) => isSub === getSubwoofer).map(({ speakerName, origIndex }) => ({ speakerName, speakerIndex: origIndex }))
}

const getSpeakerTypes = (result: { [name: string]: SpeakerData }) => {
    const speakers = Object.entries(result)
    const speakerIndeces = getIndecesOfSpeakerType(speakers, false)
    const subwooferIndeces = getIndecesOfSpeakerType(speakers, true)
    //const totalSpeakers = speakers.length
    //const totalSubwoofers = speakers.filter((speakerData) => speakerData[SpeakerConfigOptions.isSubwoofer]).length
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
            //distance does not matter here; just getting the filter name
            names: Object.keys(convertDistanceToFilters(speakerName, 0, result[speakerName][SpeakerConfigOptions.distance])),
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
    const minDistance = getMinDistance(result)
    const { satellites, subwoofers } = getSpeakerTypes(result)
    const peqFilter = [...satellites, ...subwoofers].reduce((aggr, curr) => {
        return { ...aggr, ...convertPeqToFilters(curr.speakerName, result[curr.speakerName][SpeakerConfigOptions.peq]) }
    }, {})
    const distanceFilter = [...satellites, ...subwoofers].reduce((aggr, curr) => {
        return { ...aggr, ...convertDistanceToFilters(curr.speakerName, minDistance, result[curr.speakerName][SpeakerConfigOptions.distance]) }
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
            device: "hw:0", ///TODO!! make this generated from hardware itself
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
            device: "hw:0",///TODO!! make this generated from hardware itself
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

