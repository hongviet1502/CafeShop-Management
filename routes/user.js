const express = require('express')
const connection = require('../connection')
const router = express.Router()

const jwt = require('jsonwebtoken')
// const nodemailer = require('nodemailer')
require('dotenv').config()
var auth = require('../services/authentication')
var checkRole = require('../services/checkRole')
router.post('/signup', (req, res) => {
    let user = req.body;
    query = "select email,password,role,status from user where email=?"
    connection.query(query, [user.email], (err, result) => {
        if (!err) { 
            if(result.length<=0){
                query = "insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')"
                connection.query(query,[user.name,user.contactNumber,user.email,user.password],(err,results)=>{
                    if(!err){
                        return res.status(200).json({message:"successfully registered"})
                    }
                    else{
                        return res.status(500).json(err)
                    }
                })
            }
            else{
                return res.status(400).json({message:"Email already exist"})
            }
        }
        else {
            return res.status(500).json(err)
        }
    })
})

router.post('/login', (req,res)=>{
    const user = req.body
    query = "select email,password,role,status from user where email=?"
    connection.query(query,[user.email],(err,results)=>{
        if(!err){
            if(results.length<=0 || results[0].password != user.password){
                return res.status(401).json({message:"Incorrect username or password"})
            }
            else if(results[0].status === 'false'){
                return res.status(401).json({message:"Account locked"})
            }
            else if(results[0].password == user.password){
                const response = {email: results[0].email,role: results[0].role}
                const accessToken = jwt.sign(response,process.env.ACCESS_TOKEN,{expiresIn:'8h'})
                res.status(200).json({token:accessToken})
            }
            else{
                return res.status(400).json({message:"Something went wrong. Please try later"})
            }
        }
        else{
            return res.status(500).json(err)
        }
    })
})

router.get('/get',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    var query = "select id,name,email,contactNumber,status from user where role='user'"
    connection.query(query,(err,results)=>{
        if(!err){
            return res.status(200).json(results)
        }
        else{
            return res.status(500).json(err)
        }
    })
})

router.patch('/update',auth.authenticateToken,(req,res)=>{
    let user = req.body
    var query = "update user set status=? where id=?"
    connection.query(query,[user.status,user.id],(err,results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message:"User id is not exist"})
            }
            return res.status(200).json({message:"User updated succesfully"})
        }
        else{
            return res.status(500).json(err)
        }
    })
})

router.get('/checkToken',(req,res)=>{
    return res.status(200).json({message:"true"})
})

router.post('/changePassword',auth.authenticateToken,(req,res)=>{
    const user = req.body
    const email = res.locals.email
    var query  = "select *from user where email=? and password=?"
    console.log(email, user.oldPassword);
    connection.query(query,[email, user.oldPassword],(err,results)=>{
        if(!err){
            if(results.length<=0){
                return res.status(400).json({message:"Incorrect old password"})
            }
            else if(results[0].password == user.oldPassword){
                query = "update user set password=? where email=?"
                connection.query(query,[user.newPassword, email],(err,results)=>{
                    if(!err){
                        return res.status(200).json({message:"Password updated successfully"})
                    }
                    else{
                        return res.status(500).json(err)
                    }
                })
            }
            else{
                return res.status(400).json({message:"Something went wrong"})
            }
        }
        else{
            return res.status(500).json(err)
        }
    })
})


module.exports = router