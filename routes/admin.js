const express = require("express")
const crypto = require("crypto")
const multer = require("multer")
const path = require("path")

const db = require("../database")
const auth = require("../middleware/auth")

const router = express.Router()

const storage = multer.diskStorage({
destination:(req,file,cb)=>{
cb(null,"public/files")
},
filename:(req,file,cb)=>{
cb(null,Date.now()+"-"+file.originalname)
}
})

const upload = multer({storage})

router.get("/",auth,(req,res)=>{
res.render("admin")
})

router.post("/add",auth,upload.single("file"),(req,res)=>{

const {title,description,flag,points,category} = req.body

const hash = crypto
.createHash("sha256")
.update(flag)
.digest("hex")

const file = req.file ? req.file.filename : null

db.run(
`INSERT INTO challenges(title,description,flag_hash,points,category,file)
VALUES(?,?,?,?,?,?)`,
[title,description,hash,points,category,file]
)

res.redirect("/admin")

})

module.exports = router
