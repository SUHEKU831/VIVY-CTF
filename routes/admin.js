const express = require("express")
const db = require("../database")

const router = express.Router()

router.get("/",(req,res)=>{

db.all("SELECT * FROM challenges",(err,challs)=>{

res.render("admin",{challs})

})

})

router.post("/add",(req,res)=>{

const {title,description,flag,points,category} = req.body

db.run(
"INSERT INTO challenges(title,description,flag,points,category) VALUES(?,?,?,?,?)",
[title,description,flag,points,category]
)

res.redirect("/admin")

})

module.exports = router
