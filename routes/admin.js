const express = require("express")
const crypto = require("crypto")
const db = require("../database")
const admin = require("../middleware/admin")

const router = express.Router()

router.get("/",admin,(req,res)=>{

db.all("SELECT * FROM challenges",(err,challs)=>{

res.render("admin",{challs})

})

})

router.post("/add",admin,(req,res)=>{

const {title,description,flag,points,category} = req.body

const hash = crypto
.createHash("sha256")
.update(flag)
.digest("hex")

db.run(
"INSERT INTO challenges(title,description,flag_hash,points,category) VALUES(?,?,?,?,?)",
[title,description,hash,points,category]
)

res.redirect("/admin")

})

module.exports = router
