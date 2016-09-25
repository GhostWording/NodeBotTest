'use strict'

const http = require('http')
const Bot = require('messenger-bot')

const express = require('express')
const bodyParser = require('body-parser')

const db = require('./db')

const api = require('./api')
const topics = ['status', 'love', 'like', 'poem', 'sad', 'late', 'birthday', 'thanks', 'praise', 'jibe', 'miss you']
const topicsAPI = ['status', 'love']

// const languages = ['english', 'french', 'français', 'spanish', 'español', 'language']
const languages = ['english', 'french', 'français', 'spanish', 'español']
const languageNames = {'en-EN': 'English', 'es-ES': 'Español', 'fr-FR': 'Français'}

let bot = new Bot({
  token: process.env.PAGE_TOKEN,
  verify: process.env.VERIFY_TOKEN,
  app_secret: process.env.APP_SECRET
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
  let indexAPI = -1
  let indexLng = -1
  if (text > '') {
    text = text.toLowerCase()
    index = topics.indexOf(text)
    indexAPI = topicsAPI.indexOf(text)
    indexLng = languages.indexOf(text)
  }
  console.log(`${text}: ${index} in topics`)

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err

    let image = ''
    let message
    console.log(`User ${profile.first_name} ${profile.last_name}: ${payload.sender.id} ${profile.locale}, ${profile.timezone}`)
    if (indexLng > -1) {
      changeLanguage(payload.sender.id, text)
    } else if (indexAPI > -1) {
      api.getRandomCard(text, (strContent, strImageLink) => {
        sendComboMessage(payload.sender.id, strContent, strImageLink)
      })
    } else if (index > -1) {
      let strContent = `Some text on ${text}`
      let strImageLink = 'http://gw-static.azurewebsites.net/canonical/shutterstock_153453332.jpg'
      sendComboMessage(payload.sender.id, strContent, strImageLink)
    } else if (text === 'language') {
      // text = `Do you want to change language?`
      text = `Other languages? ¿Otros idiomas? Autres langues?`
      // text (320 character limit)
      message = {
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text": text,
            "buttons":[
              {
                "type":"postback",
                "title":"English",
                "payload":"ENGLISH"
              },
              {
                "type":"postback",
                "title":"Español",
                "payload":"SPANISH"
              },
              {
                "type":"postback",
                "title":"Français",
                "payload":"FRENCH"
              },
            ]
          }
        }
      }
      reply(message, (err) => {
        if (err) throw err

        console.log(`Sent message to ${profile.first_name} ${profile.last_name}: ${text}`)
      })
    } else if (text === 'test') {
      // just a demo
      // text = 'User: ' + JSON.stringify(payload.sender) + '\n---\n' + JSON.stringify(profile)
      // reply({text}, (err) => {
      //   if (err) throw err

      //   console.log(`Sent message to ${profile.first_name} ${profile.last_name}: ${text}`)
      // })
      // -----
      // db.getInfo((info) => {
      //   reply({text: info}, (err) => {
      //     if (err) throw err

      //     console.log(`Sent message to ${profile.first_name} ${profile.last_name}: ${info}`)
      //   })
      // })
      db.getUsers((info) => {
        reply({text: JSON.stringify(info)}, (err) => {
          if (err) throw err

          console.log(`Sent message to ${profile.first_name} ${profile.last_name}: ${info}`)
        })
      })
    } else {
      let allTopics = topics.join(', ')
      if (text === undefined) {
        text = 'this'
      }
      text = `I have nothing on ${text}\nTry any of ${allTopics}.`
      message = { text }

      reply(message, (err) => {
        if (err) throw err

        console.log(`Sent message to ${profile.first_name} ${profile.last_name}: ${text}`)
      })
    }
  })
})

bot.on('postback', (payload, reply) => {
  console.log(`postback: ${JSON.stringify(payload)}`)
  changeLanguage(payload.sender.id, payload.postback.payload)
  // reply({ text: JSON.stringify(payload)}, (err, info) => {})
})

let app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.get('/', (req, res) => {
  return bot._verify(req, res)
})

// for testing
// const users = [{id: 1226459377395660, timezone: 3}]

app.get('/trigger', (req, res) => {
  const messageTime = 9
  // const messageTime = 18
  let d = new Date()
  // let curHour = d.getHours()
  let curHour = d.getUTCHours()
  console.log(`Time: ${curHour}`)

  let text = `status`
  api.getRandomCard(text, (strContent, strImageLink) => {
    db.getUsers((users) => {
      console.log(`users.length: ${users.length}`)
      console.log(`users[0]: ${JSON.stringify(users[0])}`)
      for (var i = 0; i < users.length; i++) {
        console.log(`Time + timezone: ${(curHour + users[i].timezone) % 24}`)
        if ((24 + curHour + users[i].timezone) % 24 === messageTime) {
          console.log(`Sending message to ${users[i].id}: ${strContent}`)
          sendComboMessage(users[i].id, strContent, strImageLink)
        }
      }
    })
  })

  // after all users processed?
  res.end(JSON.stringify({status: 'ok'}))
})

app.post('/', (req, res) => {
  bot._handleMessage(req.body)
  res.end(JSON.stringify({status: 'ok'}))
})

var port = process.env.port || 3000
http.createServer(app).listen(port)
console.log('Good morning bot server running at port ' + port)

function sendComboMessage(userId, strContent, strImageLink) {
  // ToDo: check for empty strImageLink
  // if (strImageLink > '') {
  // }
  let imageMessage = {
    "attachment":{
      "type":"image",
      "payload":{
        "url":strImageLink
      }
    }
  }
  bot.sendMessage(userId, imageMessage, (err, info) => {
    if (err) throw err

    console.log(`Sent an image to id ${info.recipient_id}`)

    bot.sendMessage(info.recipient_id, {text: strContent}, (err, info) => {
      if (err) throw err

      console.log(`Sent message to id ${info.recipient_id}: ${strContent}`)
      console.log(`sendMessage info: ${JSON.stringify(info)}`)
    })
  })
}

function changeLanguage(userId, strLanguage) {
  // en-EN, English, ENGLISH ? text and postback
  console.log(`changeLanguage: ${strLanguage}`)
  let lng = strLanguage.toLowerCase().substring(0, 2)
  bot.sendMessage(userId, {text: `Language changed to ${lng}: ${strLanguage}`}, (err, info) => {
    if (err) throw err
    console.log(`sendMessage info: ${JSON.stringify(info)}`)
  })
}