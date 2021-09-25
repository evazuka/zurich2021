import { CustomContext } from "bot/types"
import { createScheduleIfPossible } from "pages/api/schedules/[userId]"
import { Telegraf } from "telegraf"
import { isNullOrUndefined } from "utils/helpers"

export const handleSchedule = (bot: Telegraf<CustomContext>) => {
  bot.command("schedule", async (ctx) => {
    const text = ctx.message.text.replace("/schedule ", "")
    const name = text.length !== 0 ? text : "Unnamed event"
    ctx.session ??= { scheduling: true, scheduleName: name }
    ctx.session.scheduleName = name
    ctx.reply(`How much time do you need for ${name}?`)
  })

  bot.on("text", async (ctx) => {
    if (!ctx.session?.scheduling) return
    const scheduleName = ctx.session.scheduleName

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
      name: scheduleName,
      socialCircle: chat.title,
    })

    if (isNullOrUndefined(result.startTime)) {
      ctx.reply(`Sorry, not time available`)
    } else {
      ctx.reply(
        `Cool, ${scheduleName} booked for ${result.startTime}-${result.endTime}`
      )
    }
  })
}
