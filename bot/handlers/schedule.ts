import { CustomContext } from "bot/types"
import { createScheduleIfPossible } from "pages/api/schedules/[userId]"
import { Telegraf } from "telegraf"
import { isNullOrUndefined } from "utils/helpers"

export const handleSchedule = (bot: Telegraf<CustomContext>) => {
  bot.command("schedule", async (ctx) => {
    const text = ctx.message.text.replace("/schedule", "").trim()
    const name = text.length !== 0 ? text : "Unnamed event"

    const chatId = ctx.message.chat.id
    const chat = await bot.telegram.getChat(chatId)
    const isPrivate = chat.type === "private"

    ctx.session ??= { scheduling: true, scheduleName: name, private: isPrivate }
    ctx.session.scheduleName = name
    ctx.session.private = isPrivate
    ctx.reply(
      `How much time do you need for ${
        isPrivate ? "personal " : " "
      }event: "${name}"?`
    )
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
    const isPrivate = chat.type === "private"

    const duration = parseInt(match[0])

    const result = await createScheduleIfPossible(ctx.from.id.toString(), {
      isPersonal: isPrivate,
      isGranular: false,
      duration: duration,
      name: scheduleName,
      socialCircle: isPrivate ? null : (chat as any).title,
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
