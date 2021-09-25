import express from "express"
import next from "next"
import path from "path"
import { config } from "dotenv"

const ENV_FILE = path.join(__dirname, ".env")
config({ path: ENV_FILE })

const port = parseInt(process.env.PORT ?? "3000", 10)
const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

console.log(process.env)
app.prepare().then(() => {
  const server = express()

  server.all("*", (req, res) => {
    return handle(req, res)
  })

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
