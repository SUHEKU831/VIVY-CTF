const express = require("express")
const bodyParser = require("body-parser")
const sqlite3 = require("sqlite3").verbose()
const session = require("express-session")
const http = require("http")
const {Server} = require("socket.io")
const crypto = require("crypto")
const fs = require("fs")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const db = new sqlite3.Database("database.db")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.use(session({
secret:"ctfsecret",
resave:false,
saveUninitialized:true
}))

app.use(express.static("public"))
app.use("/files",express.static("challenges"))

function hashFlag(flag){
return crypto.createHash("sha256").update(flag).digest("hex")
}

db.serialize(()=>{

db.run(`
CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY,
username TEXT UNIQUE,
password TEXT,
score INTEGER DEFAULT 0
)
`)

db.run(`
CREATE TABLE IF NOT EXISTS challenges(
id TEXT PRIMARY KEY,
name TEXT,
points INTEGER,
flag_hash TEXT
)
`)

db.run(`
CREATE TABLE IF NOT EXISTS solves(
id INTEGER PRIMARY KEY,
username TEXT,
challenge TEXT
)
`)

/* =========================
DEFAULT CHALLENGES
========================= */

db.run(
"INSERT OR IGNORE INTO challenges(id,name,points,flag_hash) VALUES(?,?,?,?)",
[
"crypto1",
"Easy Crypto",
100,
hashFlag("ctf{base64_easy}")
]
)

db.run(
"INSERT OR IGNORE INTO challenges(id,name,points,flag_hash) VALUES(?,?,?,?)",
[
"forensics1",
"Hidden Data",
150,
hashFlag("ctf{stego_secret}")
]
)

db.run(
"INSERT OR IGNORE INTO challenges(id,name,points,flag_hash) VALUES(?,?,?,?)",
[
"web1",
"Hidden Panel",
200,
hashFlag("ctf{admin_panel_found}")
]
)

})

function updateScoreboard(){
db.all("SELECT username,score FROM users ORDER BY score DESC",(err,rows)=>{
io.emit("scoreboard",rows)
})
}

function checkFirstBlood(challenge){

db.get(
"SELECT * FROM solves WHERE challenge=?",
[challenge],
(err,row)=>{

if(!row){
io.emit("firstblood",challenge)
}

})

}

/* =========================
REGISTER
========================= */

app.post("/register",(req,res)=>{

const {username,password}=req.body

db.run(
"INSERT INTO users(username,password) VALUES(?,?)",
[username,password],
(err)=>{

if(err) return res.send("User already exists")

res.redirect("/login.html")

})

})

/* =========================
LOGIN
========================= */

app.post("/login",(req,res)=>{

const {username,password}=req.body

db.get(
"SELECT * FROM users WHERE username=? AND password=?",
[username,password],
(err,row)=>{

if(row){
req.session.user=username
res.redirect("/")
}else{
res.send("Login failed")
}

})

})

/* =========================
LOGOUT
========================= */

app.get("/logout",(req,res)=>{
req.session.destroy()
res.redirect("/login.html")
})

/* =========================
GET CHALLENGES
========================= */

app.get("/challenges",(req,res)=>{

db.all(
"SELECT id,name,points FROM challenges",
(err,rows)=>{
res.json(rows)
})

})

/* =========================
CHALLENGE DESCRIPTION
========================= */

app.get("/description/:id",(req,res)=>{

const path="./challenges/"+req.params.id+"/description.txt"

if(fs.existsSync(path)){
res.sendFile(__dirname+"/"+path)
}else{
res.send("No description")
}

})

/* =========================
SUBMIT FLAG
========================= */

app.post("/submit",(req,res)=>{

if(!req.session.user) return res.send("Login first")

const {challenge,flag}=req.body

const hash=hashFlag(flag)

db.get(
"SELECT * FROM challenges WHERE id=?",
[challenge],
(err,row)=>{

if(!row) return res.send("Challenge not found")

if(hash!==row.flag_hash){
return res.send("Wrong flag ❌")
}

db.get(
"SELECT * FROM solves WHERE username=? AND challenge=?",
[req.session.user,challenge],
(err,solved)=>{

if(solved) return res.send("Already solved")

db.run(
"INSERT INTO solves(username,challenge) VALUES(?,?)",
[req.session.user,challenge]
)

db.run(
"UPDATE users SET score=score+? WHERE username=?",
[row.points,req.session.user],
()=>{

checkFirstBlood(challenge)
updateScoreboard()

})

res.send("Correct flag 🎉")

})

})

})

/* =========================
SOCKET.IO
========================= */

io.on("connection",socket=>{
updateScoreboard()
})

/* =========================
START SERVER
========================= */

server.listen(3000,()=>{
console.log("CTF running on port 3000")
})
