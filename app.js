'use strict'

const http = require('http')
const Bot = require('messenger-bot')

let bot = new Bot({
  token: 'EAAYHoXEAtwgBAPHZAWfJvzxua4NgEzrueZBdiJOVKdU4LzJZCYilbj8WTzuD0XY6lt8lhhnzBcsVaZCLMcgs3Sv1cyeEItDZCfM1qzEUoCkC4hw8NaZBN1oZCqbwaeJQMwZBOKPGsGISFeramAReh6ONri2mv0W1AFZBOZALQ0A1HkFAZDZD', // 'PAGE_TOKEN',
  verify: 'BAPHZAWfJvzxua4NgEzrueZBdiJOVKd', // 'VERIFY_TOKEN',
  app_secret: '72d4ba4ee8b9eb5df4e81597012fa823', // 'APP_SECRET'
})

bot.on('error', (err) => {
  console.log(err.message)
})

bot.on('message', (payload, reply) => {
  let text = payload.message.text

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err

    reply({ text }, (err) => {
      if (err) throw err

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
    })
  })
})

http.createServer(bot.middleware()).listen(3000)
console.log('Echo bot server running at port 3000.')
