'use strict'

const request = require('request')
const urlRandomCard = 'http://api.cvd.io/popular/stickers/randomCard/forKeyword/'

module.exports = {
  getRandomCard: function (keyword, callback) {
    var options = {
      url: urlRandomCard + keyword, // url-encode keyword
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en-EN'
      }
    }

    request(options, function (error, response, body) {
      let strContent = ''
      let strImageLink = ''
      if (!error && response.statusCode == 200) {
        strContent = ''
        var objBody = JSON.parse(body)
        strContent = objBody['Content']
        strImageLink = objBody['ImageLink']
      } else {
        strContent = 'Error\n\n' + JSON.stringify(response) + '\n\n---\n\n' + JSON.stringify(error)
      }
      callback(strContent, strImageLink)
    })
  }
}