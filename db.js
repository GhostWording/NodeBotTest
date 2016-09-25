'use strict'

const MYSQLCONNSTR = process.env.MYSQLCONNSTR_localdb

const mysql = require('mysql2')
// var connection = mysql.createConnection(conInfo)
var connection

function connect () {
  // check if already connected 
  if (connection != null) {
    return
  }
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
      connection.end()
    });
  }
  ,
  setLanguage: function (id, language, callback) {
    connect()
    connection.execute('UPDATE user SET language = ? WHERE id = ?', [language, id], function (err, rows) {
      if (err) throw err
      console.log(rows)
      callback(rows)
      connection.end()
    })
  }
}