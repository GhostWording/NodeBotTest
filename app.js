'use strict'

const http = require('http')
const Bot = require('messenger-bot')

const topics = ['status', 'love', 'like', 'poem', 'sad', 'late', 'birthday', 'thanks', 'praise', 'jibe', 'miss you']

let bot = new Bot({
  token: 'EAAYHoXEAtwgBAPHZAWfJvzxua4NgEzrueZBdiJOVKdU4LzJZCYilbj8WTzuD0XY6lt8lhhnzBcsVaZCLMcgs3Sv1cyeEItDZCfM1qzEUoCkC4hw8NaZBN1oZCqbwaeJQMwZBOKPGsGISFeramAReh6ONri2mv0W1AFZBOZALQ0A1HkFAZDZD', // 'PAGE_TOKEN',
  verify: 'BAPHZAWfJvzxua4NgEzrueZBdiJOVKd', // 'VERIFY_TOKEN',
  app_secret: '72d4ba4ee8b9eb5df4e81597012fa823', // 'APP_SECRET'
})

bot.on('error', (err) => {
  console.log('error processed')
  console.log(err.message)
})

bot.on('message', (payload, reply) => {
  let text = payload.message.text
  console.log(text)

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err

    console.log(`User ${profile.first_name} ${profile.last_name}: ${profile.locale}, ${profile.timezone}`)

    reply({ text }, (err) => {
      if (err) throw err

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
    })
  })
})

var port = process.env.port || 3000
http.createServer(bot.middleware()).listen(port)
console.log('Echo bot server running at port ' + port)
