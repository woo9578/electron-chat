var mysql = require('mysql');
require('dotenv').config();

// var pool = mysql.createPool({
//   host            : process.env.DB_HOST,
//   port            : process.env.DB_PORT,
//   database        : process.env.DB_DATABASE,
//   password        : process.env.DB_PASSWORD,
//   user            : process.env.DB_USERNAME,
//   multipleStatements : true
// });
var con = require('../config.json');
var pool = mysql.createPool(con);

var getConnection = function(calback){
    pool.getConnection(function(err,connection){
      if(err) return calback(err);
      calback(err,connection);
    });
 }

pool.on('acquire', function(connection){
  console.log('Connection %d acquired', connection.threadId);
});

module.exports = getConnection;