import { Config } from "./configMapper"

//maybe have this just write to a file and not update camilla directly
export const submitConfig = (config: Config, filename: string) => fetch(
    "/api/setconfig",
    {
        method: "POST",
        body: JSON.stringify({
            config,
            filename
        })
    }).then(r => r.text()).then(result => {
        if (result !== "OK") {
            throw new Error(result)
        }
    })

export const getExistingConfigs = () => fetch("/api/storedconfigs").then(r => r.json())

export const loadConfig: (file: string) => Promise<Config> = (file: string) => fetch(
    `/api/getconfigfile?name=${file}`,
    {
        method: "GET",
    }).then(r => r.json())


export const getCamillaConfig: () => Promise<Config> = () => fetch(
    "/api/getconfig",
    {
        method: "GET"
    }).then(r => r.json())

export const getAudioDevices = () => fetch("/api/getaudiodevices").then(r => r.json())