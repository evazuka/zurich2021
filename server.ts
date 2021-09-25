import express from "express"
import next from "next"
import path from "path"
import { config } from "dotenv"
import { BotFrameworkAdapter } from "botbuilder"
import { EchoBot } from "bot"
import { INodeSocket } from "botframework-streaming"

const ENV_FILE = path.join(__dirname, ".env")
config({ path: ENV_FILE })

const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
})

const myBot = new EchoBot()

const port = parseInt(process.env.PORT ?? "3000", 10)
const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

console.log(process.env)

app.prepare().then(() => {
  const server = express()

  // Listen for incoming requests.
  server.post("/bot/api/messages", (req, res) => {
    adapter.processActivity(req, res, async (context) => {
      // Route to main dialog.
      await myBot.run(context)
    })
  })
  ;(server as any).on("upgrade", (req: any, socket: any, head: any) => {
    // Create an adapter scoped to this WebSocket connection to allow storing session data.
    const streamingAdapter = new BotFrameworkAdapter({
      appId: process.env.MicrosoftAppId,
      appPassword: process.env.MicrosoftAppPassword,
    })

    server.all("*", (req, res) => {
      return handle(req, res)
    })

    streamingAdapter.useWebSocket(
      req,
      socket as unknown as INodeSocket,
      head,
      async (context) => {
        // After connecting via WebSocket, run this logic for every request sent over
        // the WebSocket connection.
        await myBot.run(context)
      }
    )
  })

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
