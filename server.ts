import express from "express"
import next from "next"
import path from "path"
import { config } from "dotenv"
import { createBot } from "bot"

const ENV_FILE = path.join(__dirname, ".env")
config({ path: ENV_FILE })

const token = process.env.BOT_TOKEN
if (token === undefined) {
  throw new Error("BOT_TOKEN must be provided!")
}

const port = parseInt(process.env.PORT ?? "3000", 10)
const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

const bot = createBot(token)
const secretPath = `/bot/${bot.secretPathComponent()}`

if (process.env.DEV == "true") {
  bot.telegram.setWebhook(`${process.env.LT_PATH}${secretPath}`)
}

app.prepare().then(() => {
  const server = express()

  server.use(bot.webhookCallback(secretPath))

  server.all("*", (req, res) => {
    return handle(req, res)
  })

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
