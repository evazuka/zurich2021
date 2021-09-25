import {
  createScheduleIfPossible,
  SocialCircle,
} from "pages/api/schedules/[userId]"
import { User } from "pages/api/users/[id]"
import { Telegraf, Markup, session, Context } from "telegraf"
import { telegrafThrottler } from "telegraf-throttler"
import { User as TelegrafUser } from "typegram"
import { isNullOrUndefined } from "utils/helpers"
import { handleSchedule } from "./handlers/schedule"
import { handleStart } from "./handlers/start"
import { getUsers, upsertUser } from "./storage"
import { CustomContext } from "./types"

const throttler = telegrafThrottler()

export const createBot = (token: string) => {
  const bot = new Telegraf<CustomContext>(token)
  bot.use(throttler)
  bot.use(session())

  handleStart(bot)
  handleSchedule(bot)

  bot.command("users", async (ctx) => {
    const users = await getUsers()

    ctx.reply(users.map((x) => x.name).join(", "))
  })

  return bot
}
