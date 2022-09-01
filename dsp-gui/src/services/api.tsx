import { Config } from "./generateConfig"

export const submitConfig = (config: Config) => fetch(
    "/api/setconfig",
    {
        method: "POST",
        body: JSON.stringify({
            config,
            filename: "uitest.yaml"
        })
    })