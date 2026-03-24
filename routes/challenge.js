const express = require("express")
const crypto = require("crypto")
const db = require("../database")
const auth = require("../middleware/auth")

const router = express.Router()

router.get("/",auth,(req,res)=>{
db.all("SELECT * FROM challenges",(err,challs)=>{
res.render("challenge",{challs,message:null,type:null})
})
})

router.post("/submit",auth,(req,res)=>{

const {flag,id} = req.body

const hash = crypto.createHash("sha256").update(flag).digest("hex")

db.get("SELECT * FROM challenges WHERE id=?",[id],(err,chall)=>{

if(!chall) return res.redirect("/challenge")

if(hash === chall.flag_hash){

const teamId = req.session.user.team_id || req.session.user.id

db.get(
"SELECT * FROM solves WHERE challenge_id=? AND team_id=?",
[id,teamId],
(err,row)=>{

db.all("SELECT * FROM challenges",(err,challs)=>{

if(row){
return res.render("challenge",{
challs,
message:"⚠ Team sudah solve",
type:"error"
})
}

db.run(
"INSERT INTO solves(user_id,challenge_id,team_id) VALUES(?,?,?)",
[req.session.user.id,id,teamId]
)

db.run(
"UPDATE users SET score = score + ? WHERE id=?",
[chall.points,req.session.user.id]
)

return res.render("challenge",{
challs,
message:"✔ Correct +" + chall.points,
type:"success"
})

})

})

}else{

db.all("SELECT * FROM challenges",(err,challs)=>{
res.render("challenge",{challs,message:"✖ Wrong",type:"error"})
})

}

})

})

module.exports = router
