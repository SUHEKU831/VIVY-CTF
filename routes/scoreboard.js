const express = require("express")
const db = require("../database")

const router = express.Router()

router.get("/",(req,res)=>{

db.all(
"SELECT username,score FROM users ORDER BY score DESC",
(err,users)=>{

res.render("scoreboard",{users})

})

})

module.exports = router
