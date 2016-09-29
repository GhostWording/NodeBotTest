'use strict'

const MYSQLCONNSTR = process.env.MYSQLCONNSTR_localdb

const mysql = require('mysql2')
// var connection = mysql.createConnection(conInfo)
var connection = null
  let conInfo = {}
  MYSQLCONNSTR.split(';').map((pair) => {
    let parts = pair.split('=')
    switch (parts[0]) {
      case 'Database':
        conInfo.database = parts[1]
        break
      case 'Data Source':
        let subparts = parts[1].split(':')
        conInfo.host = subparts[0]
        conInfo.port = subparts[1]
        break
      case 'User Id':
        conInfo.user = parts[1]
        break
      case 'Password':
        conInfo.password = parts[1]
    }
  })
  connection = mysql.createConnection(conInfo)

function connect () {
  // check if already connected 
  // console.log(`connection: ${JSON.stringify(connection)}`)
  // if (connection != null) {
  //   return
  // }
}

module.exports = {
  getInfo: function (callback) {
    console.log(MYSQLCONNSTR)
    callback(MYSQLCONNSTR)
  }
  ,
  getUsers: function (callback) {
    connect()
    connection.query('SELECT id, timezone, language FROM user', function (err, rows) {
      if (err) throw err
      console.log(rows)
      callback(rows)
      // connection.end()
    });
  }
  ,
  setLanguage: function (id, language, callback) {
    connect()
    connection.execute('UPDATE user SET language = ? WHERE id = ?', [language, id], function (err, rows) {
      if (err) throw err
      console.log(rows)
      callback(rows)
      // connection.end()
    })
  }
  ,
  // getLanguage: function (id, callback) {
  //   connect()
  //   connection.execute('SELECT language FROM user WHERE id = ?', [id], function (err, rows) {
  //     if (err) throw err
  //     console.log(rows)
  //     let language = ''
  //     if (rows.length > 0) {
  //       language = rows[0].language
  //     }
  //     callback(language)
  //     connection.end()
  //   })
  // }
  // ,
  getLanguage: function (id, profile, callback) {
    connect()
    connection.execute('SELECT language FROM user WHERE id = ?', [id], function (err, rows) {
      if (err) throw err
      console.log(rows)
      let language = ''
      if (rows.length > 0) {
        language = rows[0].language
        callback(language)
        // connection.end()
      } else {
        switch(profile.locale.substring(0, 2)) {
          case 'fr':
            language = 'fr-FR'
            break
          case 'es':
            language = 'es-ES'
            break
          default:
            language = 'en-EN'
        }
        connection.execute('INSERT INTO user (id, first_name, last_name, profile_pic, locale, timezone, gender, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id, profile.first_name, profile.last_name, profile.profile_pic, profile.locale, profile.timezone, profile.gender, language], function (err, rows) {
          if (err) throw err
          callback(language)
          // connection.end()
        })
      }
    })
  }
}