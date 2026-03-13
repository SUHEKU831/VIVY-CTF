const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
const http = require("http")
const socketio = require("socket.io")

const db = require("./database")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.set("view engine","ejs")

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))

app.use(session({
secret:"ctfsecret",
resave:false,
saveUninitialized:false
}))

app.use("/",require("./routes/auth"))
app.use("/challenge",require("./routes/challenge"))
app.use("/admin",require("./routes/admin"))
app.use("/scoreboard",require("./routes/scoreboard"))

io.on("connection",(socket)=>{
console.log("user connected")
})

server.listen(process.env.PORT || 3000,()=>{
console.log("CTF running")
})
