const express = require("express")
const crypto = require("crypto")
const db = require("../database")
const auth = require("../middleware/auth")

const router = express.Router()

router.get("/",auth,(req,res)=>{

db.all("SELECT * FROM challenges",(err,challs)=>{

res.render("challenge",{
challs:challs,
message:null,
type:null
})

})

})

router.post("/submit",auth,(req,res)=>{

const {flag,id} = req.body

const hash = crypto
.createHash("sha256")
.update(flag)
.digest("hex")

db.get("SELECT * FROM challenges WHERE id=?",[id],(err,chall)=>{

if(!chall) return res.redirect("/challenge")

if(hash === chall.flag_hash){

// 🔥 ambil team_id user (kalau belum ada, pakai user_id sendiri)
const teamId = req.session.user.team_id || req.session.user.id

// 🔥 CEK: apakah team sudah solve?
db.get(
"SELECT * FROM solves WHERE challenge_id=? AND team_id=?",
[id, teamId],
(err,row)=>{

db.all("SELECT * FROM challenges",(err,challs)=>{

if(row){
return res.render("challenge",{
challs:challs,
message:"⚠ Team sudah solve",
type:"error"
})
}

// 🔥 SIMPAN solve + team_id
db.run(
"INSERT INTO solves(user_id,challenge_id,team_id) VALUES(?,?,?)",
[req.session.user.id,id,teamId]
)

// 🔥 TAMBAH SCORE (hanya sekali per team)
db.run(
"UPDATE users SET score = score + ? WHERE id=?",
[chall.points,req.session.user.id]
)

return res.render("challenge",{
challs:challs,
message:"✔ Correct Flag! +" + chall.points + " points",
type:"success"
})

})

})

}else{

db.all("SELECT * FROM challenges",(err,challs)=>{

res.render("challenge",{
challs:challs,
message:"✖ Wrong Flag",
type:"error"
})

})

}

})

})

module.exports = router
