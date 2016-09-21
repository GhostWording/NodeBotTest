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
  console.log(JSON.stringify(payload.message))
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
      // message = {
      //   "text":"New text",
      //   "attachments":[{"type":"image","payload":{"url":"https://scontent.xx.fbcdn.net/v/t34.0-12/14445553_1207487709308218_381676705_n.jpg?_nc_ad=z-m&oh=207e477f61a2306011e1827a576273d6&oe=57E437AC"}}]
      // }
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

// temporarily
const users = [{id: 1226459377395660, timezone: 3}, {id: 862508327184244, timezone: 1}]
// const users = [{id: 1226459377395660, timezone: 3}]

app.get('/trigger', (req, res) => {
  // can be customized later
  let text = `Good morning`
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
  let text2 = `Good evening`
  let message2 = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
          {
            "title":text2,
            "image_url":image
          }
        ]
      }
    }
  }

  const messageTime = 9
  const messageTime2 = 18
  let d = new Date()
  // let curHour = d.getHours()
  let curHour = d.getUTCHours()
  console.log(`Time: ${curHour}`)
  for (var i = 0; i < users.length; i++) {
    console.log(`Time + timezone: ${(curHour + users[i].timezone) % 24}`)
    if ((curHour + users[i].timezone) % 24 === messageTime) {
      console.log(`Sending message to ${users[i].id}: ${text}`)
      bot.sendMessage(users[i].id, message, (err) => {
        if (err) throw err
      })
    }
    if ((curHour + users[i].timezone) % 24 === messageTime2) {
      console.log(`Sending message to ${users[i].id}: ${text2}`)
      bot.sendMessage(users[i].id, message2, (err) => {
        if (err) throw err
      })
    }
  }
  // after all users processed?
  res.end(JSON.stringify({status: 'ok'}))
})

app.post('/', (req, res) => {
  bot._handleMessage(req.body)
  res.end(JSON.stringify({status: 'ok'}))
})

http.createServer(app).listen(port)
console.log('Echo bot server running at port ' + port)
