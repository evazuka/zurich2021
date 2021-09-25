import { SocialCircle } from "pages/api/schedules/[userId]"
import { User } from "pages/api/users/[id]"
import { Telegraf, Markup, session, Context } from "telegraf"
import { telegrafThrottler } from "telegraf-throttler"
import { getUsers, upsertUser } from "./storage"

const throttler = telegrafThrottler()

type SessionData = {
  scheduling: boolean
}

interface CustomContext extends Context {
  session?: SessionData
}

export const createBot = (token: string) => {
  const bot = new Telegraf<CustomContext>(token)
  bot.use(throttler)
  bot.use(session())

  const handleScheduleTime = (text: string) => {}

  bot.start(async (ctx) => {
    ctx.reply(
      "%onboarding text%",
      Markup.inlineKeyboard([[Markup.button.callback("Join group", "join")]])
    )
  })

  bot.command("schedule", async (ctx) => {
    ctx.session ??= { scheduling: false }
    ctx.session.scheduling = !ctx.session.scheduling
    ctx.reply(`${ctx.session.scheduling}`)
  })

  bot.on("message", (ctx) => {})

  bot.action("join", async (ctx) => {
    if (ctx.from === null || ctx.from === undefined) return

    const chatId = ctx.callbackQuery.message?.chat.id
    if (chatId === null || chatId === undefined) return

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
      name: [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" "),
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
