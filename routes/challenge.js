const express = require("express")
const crypto = require("crypto")
const db = require("../database")
const auth = require("../middleware/auth")

const router = express.Router()

router.get("/",auth,(req,res)=>{

db.all("SELECT * FROM challenges",(err,challs)=>{

res.render("challenge",{challs})

})

})

router.post("/submit",auth,(req,res)=>{

const {flag,id} = req.body

const hash = crypto
.createHash("sha256")
.update(flag)
.digest("hex")

db.get("SELECT * FROM challenges WHERE id=?",[id],(err,chall)=>{

if(!chall) return res.send("Invalid challenge")

if(hash === chall.flag_hash){

db.get(
"SELECT * FROM solves WHERE user_id=? AND challenge_id=?",
[req.session.user.id,id],
(err,row)=>{

if(row) return res.send("Already solved")

db.run(
"INSERT INTO solves(user_id,challenge_id) VALUES(?,?)",
[req.session.user.id,id]
)

db.run(
"UPDATE users SET score = score + ? WHERE id=?",
[chall.points,req.session.user.id]
)

res.send("Correct flag")

})

}else{

res.send("Wrong flag")

}

})

})

module.exports = router
