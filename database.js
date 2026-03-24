const path = require("path")
const sqlite3 = require("sqlite3").verbose()
const bcrypt = require("bcrypt")

const dbPath = path.join(__dirname,"database.db")

const db = new sqlite3.Database(dbPath)

db.serialize(()=>{

/* USERS TABLE */
db.run(`
CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY,
username TEXT UNIQUE,
password TEXT,
score INTEGER DEFAULT 0,
isAdmin INTEGER DEFAULT 0
)
`)

/* ✅ TAMBAH KOLOM TEAM KE USERS */
db.run(`
ALTER TABLE users ADD COLUMN team_id INTEGER
`, (err)=>{})

/* ✅ TEAM TABLE */
db.run(`
CREATE TABLE IF NOT EXISTS teams(
id INTEGER PRIMARY KEY,
name TEXT UNIQUE
)
`)

/* CHALLENGE TABLE */
db.run(`
CREATE TABLE IF NOT EXISTS challenges(
id INTEGER PRIMARY KEY,
title TEXT,
description TEXT,
flag_hash TEXT,
points INTEGER,
category TEXT,
file TEXT
)
`)

/* SOLVES TABLE */
db.run(`
CREATE TABLE IF NOT EXISTS solves(
id INTEGER PRIMARY KEY,
user_id INTEGER,
challenge_id INTEGER
)
`)

db.run(`
ALTER TABLE challenges ADD COLUMN link TEXT
`, (err)=>{})

/* ✅ TAMBAH TEAM_ID KE SOLVES */
db.run(`
ALTER TABLE solves ADD COLUMN team_id INTEGER
`, (err)=>{})

/* AUTO CREATE ADMIN */
db.get("SELECT * FROM users WHERE username='admin'", async (err,row)=>{

if(!row){

const hash = await bcrypt.hash("Elang910",10)

db.run(`
INSERT INTO users(username,password,isAdmin)
VALUES(?,?,1)
`,["admin",hash])

console.log("Admin account created")
}

})

})

module.exports = db
