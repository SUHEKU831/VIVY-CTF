const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
const fileUpload = require("express-fileupload")
const fs = require("fs")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000 // ✅ cukup 1x di sini

// ================= FOLDER =================
const uploadPath = path.join(__dirname, "uploads")

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath)
}

// ================= MIDDLEWARE =================
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

app.set("view engine", "ejs")

// ================= FILE UPLOAD =================
app.use(fileUpload({
    limits: { fileSize: 1024 * 1024 * 500 },
    abortOnLimit: true,
    createParentPath: true
}))

// ================= PROTECT UPLOAD =================
app.use("/uploads", express.static(uploadPath, {
    setHeaders: (res, filePath) => {
        res.set("Content-Type", "application/octet-stream")
        res.set("Content-Disposition", "attachment")
    }
}))

// ================= SESSION =================
app.use(session({
    secret: "vivy-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true
    }
}))

// ================= GLOBAL USER =================
app.use((req, res, next) => {
    res.locals.user = req.session.user || null
    next()
})

// ================= ROUTES =================
app.use("/", require("./routes/auth"))
app.use("/team", require("./routes/team"))
app.use("/challenge", require("./routes/challenge"))
app.use("/admin", require("./routes/admin"))

// ================= LEADERBOARD =================
const db = require("./database")

app.get("/leaderboard", (req, res) => {
    db.all(`
        SELECT * FROM teams
        ORDER BY score DESC
    `, (err, teams) => {

        if (err) {
            console.error(err)
            return res.send("Database error")
        }

        res.render("leaderboard", { teams })
    })
})

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).send("Internal Server Error")
})

// ================= START SERVER =================
app.listen(PORT, () => {
    console.log("Server running on port " + PORT)
})
