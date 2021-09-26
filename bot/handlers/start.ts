import { upsertUser } from "bot/storage"
import { CustomContext } from "bot/types"
import { getEnvironment } from "environment"
import { SocialCircle } from "pages/api/schedules/[userId]"
import { User } from "pages/api/users/[id]"
import { Markup, Telegraf } from "telegraf"
import { isNullOrUndefined } from "utils/helpers"

export const handleStart = (bot: Telegraf<CustomContext>) => {
  // Handle /start command
  bot.start(async (ctx) => {
    ctx.reply(
      `Hello, I am *Phobos*\\.\n
I can help you to manage time across all of your team members\\.
Need to plan a meeting? Just ask me to do it by calling\n
\`/schedule Your meeting name\`\n
Ready to start? Join this social group by clicking link below:
    `,
      {
        parse_mode: "MarkdownV2",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("Join group", "join")],
        ]),
      }
    )
  })

  // Handle "Join group" button press
  bot.action("join", async (ctx) => {
    const { appPath } = await getEnvironment()

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
      `Successfully joined *"${chat.title}"* group\\! Here's your personal dashboard link:`,
      {
        parse_mode: "MarkdownV2",
        ...Markup.inlineKeyboard([
          [Markup.button.url(`Dashboard`, `${appPath}/?userId=${ctx.from.id}`)],
        ]),
      }
    )
  })
}
