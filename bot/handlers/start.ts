import { upsertUser } from "bot/storage"
import { CustomContext } from "bot/types"
import { SocialCircle } from "pages/api/schedules/[userId]"
import { User } from "pages/api/users/[id]"
import { Markup, Telegraf } from "telegraf"
import { isNullOrUndefined } from "utils/helpers"

export const handleStart = (bot: Telegraf<CustomContext>) => {
  // Handle /start command
  bot.start(async (ctx) => {
    ctx.reply(
      "%onboarding text%",
      Markup.inlineKeyboard([[Markup.button.callback("Join group", "join")]])
    )
  })

  // Handle "Join group" button press
  bot.action("join", async (ctx) => {
    // If pressed not by user
    if (isNullOrUndefined(ctx.from)) return

    // If pressed ouside of the chat
    const chatId = ctx.callbackQuery.message?.chat.id
    if (isNullOrUndefined(chatId)) return

    const chat = await bot.telegram.getChat(chatId)

    // If pressed in private chat
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

    // Send private message
    bot.telegram.sendMessage(
      ctx.from.id,
      "Here's your personalized dashboard link",
      Markup.inlineKeyboard([
        [
          Markup.button.url(
            "Dashboard",
            `${process.env.LT_PATH}/?userId=${ctx.from.id}`
          ),
        ],
      ])
    )
  })
}
