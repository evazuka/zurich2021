import { Context } from "telegraf"

export type SessionData = {
  scheduling: boolean
  scheduleName: string
  private: boolean
}

export interface CustomContext extends Context {
  session?: SessionData
}
