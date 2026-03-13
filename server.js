const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")

const app = express()

require("./database")

app.set("view engine","ejs")

const path = require("path")
app.use(express.static(path.join(__dirname,"public")))
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

server.listen(3000,()=>{
console.log("CTF running on port 3000")
})
