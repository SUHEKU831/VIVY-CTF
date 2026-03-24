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

/* ADMIN PANEL */

router.get("/",auth,(req,res)=>{

db.all("SELECT * FROM challenges",(err,challs)=>{

res.render("admin",{challs})

})

})

/* ADD CHALLENGE */

router.post("/add",auth,upload.single("file"),(req,res)=>{

const {title,description,flag,points,category,link} = req.body  // ✅ TAMBAH LINK

const hash = crypto
.createHash("sha256")
.update(flag)
.digest("hex")

const file = req.file ? req.file.filename : null

db.run(
`INSERT INTO challenges(title,description,flag_hash,points,category,file,link)
VALUES(?,?,?,?,?,?,?)`,
[title,description,hash,points,category,file,link] // ✅ TAMBAH LINK
)

res.redirect("/admin")

})

/* EDIT PAGE */

router.get("/edit/:id",auth,(req,res)=>{

db.get(
"SELECT * FROM challenges WHERE id=?",
[req.params.id],
(err,chall)=>{

res.render("edit",{chall})

})

})

/* UPDATE CHALLENGE */

router.post("/edit/:id",auth,upload.single("file"),(req,res)=>{

const {title,description,points,category,link} = req.body // ✅ TAMBAH LINK

let file = null

if(req.file){
file = req.file.filename
}

if(file){

db.run(
`UPDATE challenges
SET title=?,description=?,points=?,category=?,file=?,link=?
WHERE id=?`,
[title,description,points,category,file,link,req.params.id]
)

}else{

db.run(
`UPDATE challenges
SET title=?,description=?,points=?,category=?,link=?
WHERE id=?`,
[title,description,points,category,link,req.params.id]
)

}

res.redirect("/admin")

})

/* DELETE CHALLENGE */

router.get("/delete/:id",auth,(req,res)=>{

db.run(
"DELETE FROM challenges WHERE id=?",
[req.params.id]
)

res.redirect("/admin")

})

module.exports = router
