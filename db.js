'use strict'

const MYSQLCONNSTR = process.env.MYSQLCONNSTR_localdb
var mysql = require('mysql2');
var connection = mysql.createConnection(MYSQLCONNSTR);
// var connection = mysql.createConnection({user: 'test', database: 'test'});

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
    console.log(MYSQLCONNSTR)
    callback(MYSQLCONNSTR)
  }
}