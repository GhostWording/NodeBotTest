'use strict'

const request = require('request')
const urlRandomCard = 'http://api.cvd.io/popular/stickers/randomCard/forKeyword/'
const urlKeywords = 'http://gw-static-apis.azurewebsites.net/bot/intentionkeywords/publickeywords.json'

function getRandomCardInernal (keyword, language, callback) {
  var options = {
    url: urlRandomCard + encodeURIComponent(keyword),
    headers: {
      'Accept': 'application/json',
      'Accept-Language': language
    }
  }
  request(options, function (error, response, body) {
    let strContent = ''
    let strImageLink = ''
    if (!error && response.statusCode == 200) {
      strContent = ''
      if (body > '') {
        let objBody = JSON.parse(body)
        strContent = objBody['Content']
        strImageLink = objBody['ImageLink']
      }
    } else {
      strContent = 'Error\n\n' + JSON.stringify(response) + '\n\n---\n\n' + JSON.stringify(error)
    }
    callback(strContent, strImageLink)
  })
}

module.exports = {
  getRandomCard: function (keyword, language, callback) {
    getRandomCardInernal(keyword, language, (strContent, strImageLink) => {
      callback(strContent, strImageLink)
    })
  }
  ,
  getRandomCardId: function (keyword, language, id, callback) {
    getRandomCardInernal(keyword, language, (strContent, strImageLink) => {
      callback(id, strContent, strImageLink)
    })
  }
  ,
  getKeywords: function (language, callback) {
  }
}