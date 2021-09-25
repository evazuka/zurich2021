import { User } from "pages/api/users/[id]"
import { Telegraf } from "telegraf"
import { getUsers, upsertUsers } from "./storage"

export const createBot = (token: string) => {
  const bot = new Telegraf(token)

  bot.start((ctx) => ctx.reply("Welcome"))
  bot.help((ctx) => ctx.reply("Send me a sticker"))
  bot.on("sticker", (ctx) => ctx.reply("👍"))
  bot.hears("hi", (ctx) => ctx.reply("Hey there"))

  bot.command("users", async (ctx) => {
    const users = await getUsers()

    ctx.reply(users.map((x) => x.name).join(", "))
  })

  bot.command("users", async (ctx) => {
    const users = await getUsers()

    ctx.reply(users.map((x) => x.name).join(", "))
  })

  bot.command("addme", async (ctx) => {
    const user: Partial<User> = {
      id: ctx.from.id.toString(),
      name: [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" "),
    }
    await upsertUsers([user])
    const users = await getUsers()
    ctx.reply(users.map((x) => x.name).join(", "))
  })

  return bot
}
