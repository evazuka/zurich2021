import { Telegraf } from "telegraf"

export const createBot = (token: string) => {
  const bot = new Telegraf(token)

  bot.start((ctx) => ctx.reply("Welcome"))
  bot.help((ctx) => ctx.reply("Send me a sticker"))
  bot.on("sticker", (ctx) => ctx.reply("👍"))
  bot.hears("hi", (ctx) => ctx.reply("Hey there"))

  return bot
}
