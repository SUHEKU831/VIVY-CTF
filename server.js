const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")

const app = express()

require("./database")

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

app.listen(process.env.PORT || 3000,()=>{
console.log("CTF running")
})
