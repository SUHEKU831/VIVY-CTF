const path = require("path")
const sqlite3 = require("sqlite3").verbose()
const bcrypt = require("bcrypt")

const dbPath = path.join(__dirname,"database.db")
const db = new sqlite3.Database(dbPath)

db.serialize(()=>{

db.run(`
CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY,
username TEXT UNIQUE,
password TEXT,
score INTEGER DEFAULT 0,
isAdmin INTEGER DEFAULT 0
)
`)

db.run(`ALTER TABLE users ADD COLUMN team_id INTEGER`,()=>{})

db.run(`
CREATE TABLE IF NOT EXISTS teams(
id INTEGER PRIMARY KEY,
name TEXT UNIQUE
)
`)

db.run(`
CREATE TABLE IF NOT EXISTS challenges(
id INTEGER PRIMARY KEY,
title TEXT,
description TEXT,
flag_hash TEXT,
points INTEGER,
category TEXT,
file TEXT,
link TEXT
)
`)

db.run(`
CREATE TABLE IF NOT EXISTS solves(
id INTEGER PRIMARY KEY,
user_id INTEGER,
challenge_id INTEGER
)
`)

db.run(`ALTER TABLE solves ADD COLUMN team_id INTEGER`,()=>{})

db.get("SELECT * FROM users WHERE username='admin'", async (err,row)=>{
if(!row){
const hash = await bcrypt.hash("Elang910",10)
db.run(`INSERT INTO users(username,password,isAdmin) VALUES(?,?,1)`,["admin",hash])
}
})

})

module.exports = db
