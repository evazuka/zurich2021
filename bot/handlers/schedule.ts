import { CustomContext } from "bot/types"
import { createScheduleIfPossible } from "pages/api/schedules/[userId]"
import { Telegraf } from "telegraf"
import { isNullOrUndefined } from "utils/helpers"

const timeMap = {
  hour: 60,
  minutes: 1,
  seconds: 1 / 60,
}

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

    const text = ctx.message.text
    const match = ctx.message.text.match(/\d+/)

    if (isNullOrUndefined(match)) {
      // TODO:
      return
    }

    const duration = parseInt(match[0])

    const durationConverted = text.includes("hour")
      ? timeMap.hour * duration
      : text.includes("second")
      ? timeMap.seconds * duration
      : duration

    const chatId = ctx.message.chat.id
    const chat = await bot.telegram.getChat(chatId)
    const isPrivate = chat.type === "private"

    const result = await createScheduleIfPossible(ctx.from.id.toString(), {
      isPersonal: isPrivate,
      isGranular: false,
      duration: durationConverted,
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
