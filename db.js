'use strict'

const MYSQLCONNSTR = process.env.MYSQLCONNSTR_localdb
var mysql = require('mysql2');
// var connection = mysql.createConnection(MYSQLCONNSTR);
var connection = mysql.createConnection({user: 'azure', database: 'azuredb', password: 'password', host: '127.0.0.1', port: '50616'});

// connection.query('SELECT 1+1 as test1', function (err, rows) {
//   //
// });

module.exports = {
  getInfo: function (callback) {
    console.log(MYSQLCONNSTR)
    callback(MYSQLCONNSTR)
  }
  ,
  getUsers: function (callback) {
    connection.query('SELECT id FROM user', function (err, rows) {
      console.log(rows)
      callback(JSON.stringify(rows))
    });
  }
}