import { ok } from "assert"
import {
  createScheduleIfPossible,
  SocialCircle,
} from "pages/api/schedules/[userId]"
import { User } from "pages/api/users/[id]"
import { Telegraf, Markup, session, Context } from "telegraf"
import { telegrafThrottler } from "telegraf-throttler"
import { User as TelegrafUser } from "typegram"
import { isNullOrUndefined } from "utils/helpers"
import { getUsers, upsertUser } from "./storage"

const throttler = telegrafThrottler()

type SessionData = {
  scheduling: boolean
  scheduleName: string
}

interface CustomContext extends Context {
  session?: SessionData
}

const getUserName = (user: TelegrafUser) =>
  [user.first_name, user.last_name].filter(Boolean).join(" ")

export const createBot = (token: string) => {
  const bot = new Telegraf<CustomContext>(token)
  bot.use(throttler)
  bot.use(session())

  bot.start(async (ctx) => {
    ctx.reply(
      "%onboarding text%",
      Markup.inlineKeyboard([[Markup.button.callback("Join group", "join")]])
    )
  })

  bot.command("schedule", async (ctx) => {
    const text = ctx.message.text.replace("/schedule ", "")
    const name = text.length !== 0 ? text : "Unnamed event"
    ctx.session ??= { scheduling: true, scheduleName: name }
    ctx.reply(`How much time do you need for ${name}?`)
  })

  bot.on("text", async (ctx) => {
    if (!ctx.session?.scheduling) return

    const match = ctx.message.text.match(/\d+/)

    if (isNullOrUndefined(match)) {
      // TODO:
      return
    }

    const chatId = ctx.message.chat.id
    const chat = await bot.telegram.getChat(chatId)
    if (chat.type === "private") {
      // TODO:
      return
    }

    const duration = parseInt(match[0])

    const result = await createScheduleIfPossible(ctx.from.id.toString(), {
      isPersonal: false,
      isGranular: false,
      duration: duration,
      name: getUserName(ctx.from),
      socialCircle: chat.title,
    })

    if (isNullOrUndefined(result.startTime)) {
      ctx.reply(`Sorry, not time available`)
    } else {
      ctx.reply(
        `Cool, ${ctx.session.scheduleName} booked for ${result.startTime}-${result.endTime}`
      )
    }
  })

  bot.action("join", async (ctx) => {
    if (isNullOrUndefined(ctx.from)) return

    const chatId = ctx.callbackQuery.message?.chat.id
    if (isNullOrUndefined(chatId)) return

    const chat = await bot.telegram.getChat(chatId)

    if (chat.type === "private") {
      ctx.reply(`You can only join from your social circle chat!`)
      return
    }

    const user: Partial<User> = {
      id: ctx.from.id.toString(),
      name: [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" "),
    }

    const socialCircle: SocialCircle = {
      id: chat.id.toString(),
      name: chat.title,
    }
    await upsertUser(user, socialCircle)

    bot.telegram.sendMessage(
      ctx.from.id,
      "Here's your personalized dashboard link",
      Markup.inlineKeyboard([
        [
          Markup.button.url(
            "Dashboard",
            `${process.env.LT_PATH}/schedule/${ctx.from.id}`
          ),
        ],
      ])
    )
  })

  bot.command("users", async (ctx) => {
    const users = await getUsers()

    ctx.reply(users.map((x) => x.name).join(", "))
  })

  bot.command("join", async (ctx) => {
    const chatId = ctx.message.chat.id
    const chat = await bot.telegram.getChat(chatId)

    if (chat.type === "private") {
      ctx.reply(`Use '/join' command from your social circle chat!`)
      return
    }

    const user: Partial<User> = {
      id: ctx.from.id.toString(),
      name: getUserName(ctx.from),
    }

    const socialCircle: SocialCircle = {
      id: chat.id.toString(),
      name: chat.title,
    }
    await upsertUser(user, socialCircle)
    const users = await getUsers()
    ctx.reply(users.map((x) => x.name).join(", "))
  })

  return bot
}
