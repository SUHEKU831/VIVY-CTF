const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
const fileUpload = require("express-fileupload")
const fs = require("fs")

const app = express()

// buat folder uploads otomatis
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads")
}

// middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

// upload besar (500MB)
app.use(fileUpload({
    limits: { fileSize: 1024 * 1024 * 500 },
    abortOnLimit: true
}))

// proteksi file upload (biar gak bisa dieksekusi)
app.use("/uploads", express.static("uploads", {
    setHeaders: (res) => {
        res.set("Content-Type", "application/octet-stream")
    }
}))

app.set("view engine", "ejs")

app.use(session({
    secret: "vivy-secret",
    resave: false,
    saveUninitialized: true
}))

// routes
app.use("/", require("./routes/auth"))
app.use("/team", require("./routes/team"))
app.use("/challenge", require("./routes/challenge"))
app.use("/admin", require("./routes/admin"))

// leaderboard
const db = require("./database")
app.get("/leaderboard", (req, res) => {
    db.all("SELECT * FROM teams ORDER BY score DESC", (err, teams) => {
        res.render("leaderboard", { teams })
    })
})

app.listen(PORT,"0.0.0.0",()=>{
console.log("CTF running on",PORT)
})
