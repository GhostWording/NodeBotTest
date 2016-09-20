'use strict'

const http = require('http')
const Bot = require('messenger-bot')

const express = require('express')
const bodyParser = require('body-parser')

const topics = ['status', 'love', 'like', 'poem', 'sad', 'late', 'birthday', 'thanks', 'praise', 'jibe', 'miss you']
// const intentions = ['status', 'love', 'like', 'poem', 'sad', 'late', 'birthday', 'thanks', 'praise', 'jibe', 'miss you']

// todo: move tokens to env vars later
let bot = new Bot({
  token: 'EAAYHoXEAtwgBAPHZAWfJvzxua4NgEzrueZBdiJOVKdU4LzJZCYilbj8WTzuD0XY6lt8lhhnzBcsVaZCLMcgs3Sv1cyeEItDZCfM1qzEUoCkC4hw8NaZBN1oZCqbwaeJQMwZBOKPGsGISFeramAReh6ONri2mv0W1AFZBOZALQ0A1HkFAZDZD', // 'PAGE_TOKEN',
  verify: 'BAPHZAWfJvzxua4NgEzrueZBdiJOVKd', // 'VERIFY_TOKEN',
  app_secret: '72d4ba4ee8b9eb5df4e81597012fa823', // 'APP_SECRET'
})

bot.on('error', (err) => {
  console.log('error processed')
  console.log(err.message)
})

bot.on('authentication', (payload, reply) => {
  reply({ text: `Hey ${profile.first_name}!`}, (err, info) => {})
})

bot.on('delivery', (payload, reply) => {
  let strPayload = JSON.stringify(payload)
  console.log(`Delivered: ${strPayload}`)
})

bot.on('message', (payload, reply) => {
  let text = payload.message.text
  console.log(text)
  let index = -1
  if (text > '') {
    text = text.toLowerCase()
    index = topics.indexOf(text)
  }
  console.log(`${text}: ${index} in topics`)

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err

    let image = ''
    let message
    console.log(`User ${profile.first_name} ${profile.last_name}: ${payload.sender.id} ${profile.locale}, ${profile.timezone}`)
    if (index > -1) {
      text = `Some text on ${text}`
      image = 'http://gw-static.azurewebsites.net/canonical/shutterstock_153453332.jpg'
      let imageMessage = {
        "attachment":{
          "type":"image",
          "payload":{
            "url":image
          }
        }
      }
      reply(imageMessage, (err) => {
        if (err) throw err

        console.log(`Sent an image to ${profile.first_name} ${profile.last_name}`)

        // 320 character limit
        reply({ text }, (err) => {
          if (err) throw err

          console.log(`Sent message to ${profile.first_name} ${profile.last_name}: ${text}`)
        })
      })      
    } else if (text === 'test') {
      // just a demo
      text = `Some text on ${text}`
      image = 'http://gw-static.azurewebsites.net/canonical/shutterstock_153453332.jpg'
      // title (80 character limit), image_url
      message = {
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"generic",
            "elements":[
              {
                "title":text,
                "image_url":image
              }
            ]
          }
        }
      }
      reply(message, (err) => {
        if (err) throw err

        console.log(`Sent message to ${profile.first_name} ${profile.last_name}: ${text}`)
      })
    } else {
      let allTopics = topics.join(', ')
      text = `I have nothing on ${text}\nTry any of ${allTopics}.`
      message = { text }

      reply(message, (err) => {
        if (err) throw err

        console.log(`Sent message to ${profile.first_name} ${profile.last_name}: ${text}`)
      })
    }

    // if (image > '') {
    // }
  })
})

var port = process.env.port || 3000
// http.createServer(bot.middleware()).listen(port)
// console.log('Echo bot server running at port ' + port)

let app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.get('/', (req, res) => {
  return bot._verify(req, res)
})

app.get('/trigger', (req, res) => {
  // just a demo
  let text = `Some text on ${text}`
  let image = 'http://gw-static.azurewebsites.net/canonical/shutterstock_153453332.jpg'
  // title (80 character limit), image_url
  let message = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
          {
            "title":text,
            "image_url":image
          }
        ]
      }
    }
  }
  bot.sendMessage(1226459377395660, message, (err) => {
    if (err) throw err

    console.log(`Sent message to ${profile.first_name} ${profile.last_name}: ${text}`)
    res.end(JSON.stringify({status: 'ok'}))
  })
})

app.post('/', (req, res) => {
  bot._handleMessage(req.body)
  res.end(JSON.stringify({status: 'ok'}))
})

http.createServer(app).listen(port)
console.log('Echo bot server running at port ' + port)
