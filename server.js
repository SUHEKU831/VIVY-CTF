const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const session = require("express-session")
const http = require("http")
const { Server } = require("socket.io")
const bodyParser = require("body-parser")

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

/* DATABASE */

db.serialize(()=>{

db.run(`CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY,
username TEXT,
password TEXT,
score INTEGER DEFAULT 0
)`)

db.run(`CREATE TABLE IF NOT EXISTS challenges(
id TEXT PRIMARY KEY,
name TEXT,
points INTEGER
)`)

})

/* TEST ROUTE */

app.get("/",(req,res)=>{
res.send("CTF SERVER RUNNING")
})

/* GET CHALLENGES */

app.get("/challenges",(req,res)=>{

db.all("SELECT * FROM challenges",(err,rows)=>{

if(err) return res.send(err)

res.json(rows)

})

})

/* SOCKET */

io.on("connection",socket=>{
console.log("user connected")
})

/* IMPORTANT FOR RAILWAY */

const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{
console.log("Server running on "+PORT)
})
