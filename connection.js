const mysql = require('mysql')
require('dotenv').config()

var connection = mysql.createConnection({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    // host:'127.0.0.1',
    // user: 'root',
    // password : '1',
    // database:'cafenodejs'
})

connection.connect((err) =>{
    if(!err){
        console.log("Connected");
    }else{
        console.log(err);
    }
})

module.exports = connection