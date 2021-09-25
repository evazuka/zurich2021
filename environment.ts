import { config } from "dotenv"
import path from "path"

const ENV_FILE = path.join(__dirname, ".env")
config({ path: ENV_FILE })

export const environment = {
  dev: process.env.NODE_ENV !== "production",
  botToken: process.env.BOT_TOKEN,
  port: parseInt(process.env.PORT ?? "3000", 10),
  appPath: process.env.LT_PATH,
} as const

console.log(`Production: ${!environment.dev}`)
console.log(`Port: ${environment.port}`)
console.log(`App Path: ${environment.appPath}`)
