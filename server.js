const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const session = require("express-session")
const bodyParser = require("body-parser")
const http = require("http")
const {Server} = require("socket.io")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.set("trust proxy",1)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.use(session({
secret:"ctfsecret",
resave:false,
saveUninitialized:false,
cookie:{secure:false}
}))

app.use(express.static(path.join(__dirname,"public")))

const db = new sqlite3.Database("database.db")

/* DATABASE */

db.serialize(()=>{

db.run(`CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE,
password TEXT,
role TEXT DEFAULT 'user',
score INTEGER DEFAULT 0
)`)

db.run(`CREATE TABLE IF NOT EXISTS challenges(
id TEXT PRIMARY KEY,
name TEXT,
flag TEXT,
points INTEGER
)`)

db.run(`INSERT OR IGNORE INTO users(username,password,role)
VALUES("admin","admin123","admin")`)

})

/* ADMIN CHECK */

function isAdmin(req,res,next){

if(!req.session.user) return res.status(403).send("login required")

db.get(
"SELECT role FROM users WHERE username=?",
[req.session.user],
(err,row)=>{

if(!row || row.role !== "admin")
return res.status(403).send("admin only")

next()

})

}

/* REGISTER */

app.post("/register",(req,res)=>{

const {username,password} = req.body

db.run(
"INSERT INTO users(username,password) VALUES(?,?)",
[username,password],
err=>{
if(err) return res.json({status:"error"})
res.json({status:"ok"})
}
)

})

/* LOGIN */

app.post("/login",(req,res)=>{

const {username,password} = req.body

db.get(
"SELECT * FROM users WHERE username=? AND password=?",
[username,password],
(err,row)=>{

if(!row) return res.json({status:"fail"})

req.session.user=row.username

res.json({status:"ok"})

})

})

/* GET CHALLENGES */

app.get("/challenges",(req,res)=>{

db.all(
"SELECT id,name,points FROM challenges",
(err,rows)=>{
res.json(rows)
})

})

/* SUBMIT FLAG */

app.post("/submit",(req,res)=>{

if(!req.session.user)
return res.json({status:"login_required"})

const {challenge,flag} = req.body

db.get(
"SELECT * FROM challenges WHERE id=?",
[challenge],
(err,row)=>{

if(!row) return res.json({status:"invalid"})

if(flag === row.flag){

db.run(
"UPDATE users SET score=score+? WHERE username=?",
[row.points,req.session.user]
)

io.emit("score_update")

res.json({status:"correct"})

}else{

res.json({status:"wrong"})

}

})

})

/* SCOREBOARD */

app.get("/scoreboard",(req,res)=>{

db.all(
"SELECT username,score FROM users ORDER BY score DESC",
(err,rows)=>{
res.json(rows)
})

})

/* ADMIN ADD CHALLENGE */

app.post("/admin/add",isAdmin,(req,res)=>{

const {id,name,flag,points} = req.body

db.run(
"INSERT INTO challenges(id,name,flag,points) VALUES(?,?,?,?)",
[id,name,flag,points],
err=>{
if(err) return res.json({status:"error"})
res.json({status:"added"})
})

})

/* ADMIN PAGE */

app.get("/admin",isAdmin,(req,res)=>{
res.sendFile(path.join(__dirname,"public/admin.html"))
})

/* SOCKET */

io.on("connection",socket=>{
console.log("user connected")
})

/* START SERVER */

const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{
console.log("running on "+PORT)
})
