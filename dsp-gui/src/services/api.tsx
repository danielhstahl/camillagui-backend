import { Config } from "./configMapper"

//maybe have this just write to a file and not update camilla directly
export const submitConfig = (config: Config) => fetch(
    "/api/setconfig",
    {
        method: "POST",
        body: JSON.stringify({
            config,
            filename: "uitest.yaml"
        })
    })


export const loadConfig: () => Promise<Config> = () => fetch(
    "/api/getconfigfile?name=uitest.yaml",
    {
        method: "GET",
    }).then(r => r.json())


export const getCamillaConfig: () => Promise<Config> = () => fetch(
    "/api/getconfig",
    {
        method: "GET"
    }).then(r => r.json())