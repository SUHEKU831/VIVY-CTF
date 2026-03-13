const express = require("express")
const bcrypt = require("bcrypt")
const db = require("../database")

const router = express.Router()

router.get("/",(req,res)=>{
res.redirect("/login")
})

router.get("/login",(req,res)=>{
res.render("login")
})

router.post("/login",(req,res)=>{

const {username,password} = req.body

db.get("SELECT * FROM users WHERE username=?",[username],async(err,user)=>{

if(!user) return res.send("User not found")

const valid = await bcrypt.compare(password,user.password)

if(!valid) return res.send("Wrong password")

req.session.user = user

res.redirect("/challenge")

})

})

router.get("/register",(req,res)=>{
res.render("register")
})

router.post("/register",async(req,res)=>{

const {username,password} = req.body

const hash = await bcrypt.hash(password,10)

db.run(
"INSERT INTO users(username,password) VALUES(?,?)",
[username,hash],
()=> res.redirect("/login")
)

})

module.exports = router
