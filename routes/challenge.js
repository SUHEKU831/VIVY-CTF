const express = require("express")
const crypto = require("crypto")
const db = require("../database")

const router = express.Router()

router.get("/",(req,res)=>{

db.all("SELECT * FROM challenges",(err,challs)=>{

res.render("challenge",{challs})

})

})

router.post("/submit",(req,res)=>{

const {flag,id} = req.body

db.get("SELECT * FROM challenges WHERE id=?",[id],(err,chall)=>{

if(!chall) return res.send("Invalid")

if(flag === chall.flag){

db.run(
"INSERT INTO solves(user_id,challenge_id) VALUES(?,?)",
[req.session.user.id,id]
)

db.run(
"UPDATE users SET score = score + ? WHERE id=?",
[chall.points,req.session.user.id]
)

return res.send("Correct flag")
}

res.send("Wrong flag")

})

})

module.exports = router
