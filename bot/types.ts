import { Context } from "telegraf"

export type SessionData = {
  scheduling: boolean
  scheduleName: string
}

export interface CustomContext extends Context {
  session?: SessionData
}
