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

module.exports = router
