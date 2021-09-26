import { CustomContext } from "bot/types"
import { createScheduleIfPossible } from "pages/api/schedules/[userId]"
import { Markup, Telegraf } from "telegraf"
import { isNullOrUndefined } from "utils/helpers"
import { attemptSchedule, reschedule, USER_ID } from "utils/forDima"

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
        isPrivate ? "personal " : ""
      }event: *"${name}"*?`,
      { parse_mode: "MarkdownV2" }
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

    /*const result = await createScheduleIfPossible(ctx.from.id.toString(), {
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
    */

    const result = attemptSchedule()
    ctx.reply(`Sorry, no time available, trying to reschedule 🔄`)

    bot.telegram.sendMessage(
      result,
      `Hey, can you please move your *"Laundry"* appointment today from _10:00 \\- 11:00_ to _11:00 \\- 12:00_?`,
      {
        parse_mode: "MarkdownV2",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("Yes", `ok`)],
          [Markup.button.callback("No", `ok`)],
        ]),
      }
    )
  })

  bot.action("ok", async (ctx) => {
    await reschedule()

    const result = await createScheduleIfPossible(ctx.from!.id.toString(), {
      isPersonal: false,
      isGranular: false,
      duration: 60,
      name: "Quick chat",
      socialCircle: "Work",
    })

    ctx.reply(`Thanks 👌`)

    bot.telegram.sendMessage(
      "-510425360",
      `I have successfully managed to schedule "Quick chat" appointment for _10:00 \\- 11:00_ ✅`,
      { parse_mode: "MarkdownV2" }
    )
  })
}
