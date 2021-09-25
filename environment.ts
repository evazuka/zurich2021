import { config } from "dotenv"
import path from "path"
import ngrok from "ngrok"

const ENV_FILE = path.join(__dirname, ".env")
config({ path: ENV_FILE })

type Env = {
  dev: boolean
  botToken: string
  port: number
  appPath: string
}

const dev = process.env.NODE_ENV !== "production"
const port = parseInt(process.env.PORT ?? "3000", 10)
const appPath = process.env.LT_PATH

let cache: Env | null = null

export const getEnvironment = async () => {
  if (cache) return cache
  let url: string | null = null
  if (dev) {
    console.log("Running on dev...")
    url = await ngrok.connect(port)
    console.log(`Ngrok launched: ${url}`)
  }

  cache = {
    dev,
    botToken: process.env.BOT_TOKEN!,
    port,
    appPath: url ?? appPath!,
  }
  return cache
}
