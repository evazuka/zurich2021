import express from "express"
import next from "next"
import { createBot } from "bot"
import { environment } from "environment"

const { port, dev, botToken, appPath } = environment

if (botToken === undefined) {
  throw new Error("BOT_TOKEN must be provided!")
}
const app = next({ dev })
const handle = app.getRequestHandler()

const bot = createBot(botToken)
const secretPath = `/bot/${bot.secretPathComponent()}`

bot.telegram.setWebhook(`${environment.appPath}${secretPath}`)

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
