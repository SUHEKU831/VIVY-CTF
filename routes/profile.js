const express = require("express")
const db = require("../database")
const auth = require("../middleware/auth")

const router = express.Router()

router.get("/",auth,(req,res)=>{

db.all(`
SELECT challenges.title, challenges.points
FROM solves
JOIN challenges
ON solves.challenge_id = challenges.id
WHERE solves.user_id = ?
`,
[req.session.user.id],
(err,rows)=>{

res.render("profile",{
user:req.session.user,
solves:rows
})

})

})


// ✅ TAMBAHKAN DI SINI
router.post("/join-team", auth, (req,res)=>{
    const { team } = req.body
    const userId = req.session.user.id

    db.get("SELECT * FROM teams WHERE name = ?", [team], (err,row)=>{
        if(row){
            db.run("UPDATE users SET team_id=? WHERE id=?", [row.id,userId])
            return res.redirect("/profile")
        } else {
            db.run("INSERT INTO teams(name) VALUES(?)",[team], function(){
                db.run("UPDATE users SET team_id=? WHERE id=?", [this.lastID,userId])
                res.redirect("/profile")
            })
        }
    })
})

module.exports = router
