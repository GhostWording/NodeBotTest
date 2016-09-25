'use strict'

const MYSQLCONNSTR = process.env.MYSQLCONNSTR_localdb
var conInfo = {}
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

const mysql = require('mysql2')
// var connection = mysql.createConnection(conInfo)

module.exports = {
  getInfo: function (callback) {
    console.log(MYSQLCONNSTR)
    callback(MYSQLCONNSTR)
  }
  ,
  getUsers: function (callback) {
    var connection = mysql.createConnection(conInfo)
    connection.query('SELECT id, timezone, language FROM user', function (err, rows) {
      console.log(rows)
      callback(rows)
      connection.end()
    });
  }
}