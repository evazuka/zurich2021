import express from "express"
import next from "next"
import path from "path"
import { config } from "dotenv"
import { Telegraf } from "telegraf"

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

const bot = new Telegraf(token)
bot.on("text", (ctx) => ctx.replyWithHTML("<b>Hello</b>"))

const secretPath = `/bot/${bot.secretPathComponent()}`

if (process.env.DEV) {
  bot.telegram.setWebhook(`${process.env.LT_PATH}${secretPath}`)
}

console.log(process.env)
app.prepare().then(() => {
  const server = express()

  server.all("*", (req, res) => {
    return handle(req, res)
  })

  server.use(bot.webhookCallback(secretPath))

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
