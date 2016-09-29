'use strict'

const http = require('http')
const Bot = require('messenger-bot')

const express = require('express')
const bodyParser = require('body-parser')

const db = require('./db')

const api = require('./api')
const topics = ['status', 'love', 'like', 'poem', 'sad', 'late', 'birthday', 'thanks', 'praise', 'jibe', 'miss you']

const languages = ['english', 'french', 'français', 'francais', 'spanish', 'español', 'espanol']
const languageNames = {'en-EN': 'English', 'es-ES': 'Español', 'fr-FR': 'Français'}
const languageCodes = {'en': 'en-EN', 'es': 'es-ES', 'sp': 'es-ES', 'fr': 'fr-FR'}

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
  // save user info to the DB
  reply({ text: `Hey ${profile.first_name}!`}, (err, info) => {
    let allTopics = topics.join(', ')
    let text = `Try any of ${allTopics}.`
    bot.sendMessage(info.recipient_id, {text}, (err, info) => {
      if (err) throw err
      console.log(`sendMessage info: ${JSON.stringify(info)}`)
    })
  })
})

bot.on('delivery', (payload, reply) => {
  let strPayload = JSON.stringify(payload)
  console.log(`Delivered: ${strPayload}`)
})

bot.on('message', (payload, reply) => {
  let text = payload.message.text
  console.log(text)
  console.log(JSON.stringify(payload.message))
  let indexLng = -1
  if (text > '') {
    text = text.toLowerCase()
    indexLng = languages.indexOf(text)
  }

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err

    let image = ''
    let message
    console.log(`User ${profile.first_name} ${profile.last_name}: ${payload.sender.id} ${profile.locale}, ${profile.timezone}`)
    if (text === 'help') {
      // 'help' in other languages?
      // description of the bot?
      // list of languages?
      // add a list of topics in the language (2do)

      db.getLanguage(payload.sender.id, profile, (language) => {
        api.getKeywords(language, () => {})
      })
      sendKeywords(payload.sender.id)
    } else if (indexLng > -1) {
      changeLanguage(payload.sender.id, text)
    } else if (text === 'language') {
      db.getLanguage(payload.sender.id, profile, (language) => {}) // Just to save new user info
      // text = `Do you want to change language?`
      text = `Other languages?\n¿Otros idiomas?\nAutres langues?`
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
      db.getUsers((info) => {
        reply({text: JSON.stringify(info)}, (err) => {
          if (err) throw err

          console.log(`Sent message to ${profile.first_name} ${profile.last_name}: ${info}`)
        })
      })
    } else {
      db.getLanguage(payload.sender.id, profile, (language) => {
        api.getRandomCard(text, language, (strContent, strImageLink) => {
          sendComboMessage(payload.sender.id, strContent, strImageLink)
        })
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
  let curHour = d.getUTCHours()
  console.log(`Time: ${curHour}`)

  let text = `status`
  // loop through users, getRandomCard with their language
  // ToDo: add time calculation before and in getUsers to return only users with needed timezone
  db.getUsers((users) => {
    console.log(`users.length: ${users.length}`)
    console.log(`users[0]: ${JSON.stringify(users[0])}`)
    for (var i = 0; i < users.length; i++) {
      console.log(`Time + timezone: ${(curHour + users[i].timezone) % 24}`)
      if ((24 + curHour + users[i].timezone) % 24 === messageTime) {
        api.getRandomCardId(text, users[i].language, users[i].id, (id, strContent, strImageLink) => {
          console.log(`Sending message to ${id}: ${strContent}`)
          sendComboMessage(id, strContent, strImageLink)
        })
      }
    }
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
  // check for empty values
  if (strContent === '') {
    strContent = 'Empty card from the API :('
  }
  if (strImageLink > '') {
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
        sendKeywords(info.recipient_id)
      })
    })
  } else {
    bot.sendMessage(userId, {text: strContent}, (err, info) => {
      if (err) throw err
      console.log(`Sent message to id ${info.recipient_id}: ${strContent}`)
      console.log(`sendMessage info: ${JSON.stringify(info)}`)
      sendKeywords(info.recipient_id)
    })
  }
}

function sendKeywords(userId) {
  let allTopics = topics.join(', ')
  let text = `Try any of ${allTopics}.`
  bot.sendMessage(userId, {text}, (err, info) => {
    if (err) throw err
    console.log(`Sent message to id ${info.recipient_id}: ${text}`)
    console.log(`sendMessage info: ${JSON.stringify(info)}`)
  })
}

function changeLanguage(userId, strLanguage) {
  // en-EN, English, ENGLISH ? text and postback
  console.log(`changeLanguage: ${strLanguage}`)
  let lng = strLanguage.substring(0, 2).toLowerCase()
  let lngCode = languageCodes[lng]
  let lngName = languageNames[lngCode]
  db.setLanguage(userId, lngCode, (info) => {
    bot.sendMessage(userId, {text: `Language changed to ${lngName}`}, (err, info) => {
      if (err) throw err
      console.log(`sendMessage info: ${JSON.stringify(info)}`)
      // add a list of topics in the language (2do)
      // let allTopics = topics.join(', ')
      // let text = `Try any of ${allTopics}.`
      // bot.sendMessage(userId, {text}, (err, info) => {
      //   if (err) throw err
      //   console.log(`sendMessage info: ${JSON.stringify(info)}`)
      // })
    })
  })
}