const path = require("path")
const sqlite3 = require("sqlite3").verbose()
const bcrypt = require("bcrypt")

const dbPath = path.join(__dirname,"database.db")
const db = new sqlite3.Database(dbPath)

db.serialize(()=>{

/* ================= USERS ================= */
db.run(`
CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY,
username TEXT UNIQUE,
password TEXT,
team_id INTEGER,
score INTEGER DEFAULT 0,
isAdmin INTEGER DEFAULT 0
)
`)

/* ================= TEAMS ================= */
db.run(`
CREATE TABLE IF NOT EXISTS teams(
id INTEGER PRIMARY KEY,
name TEXT UNIQUE,
score INTEGER DEFAULT 0
)
`)

/* ================= CATEGORIES ================= */
db.run(`
CREATE TABLE IF NOT EXISTS categories(
id INTEGER PRIMARY KEY,
name TEXT UNIQUE
)
`)

/* ================= CHALLENGE ================= */
db.run(`
CREATE TABLE IF NOT EXISTS challenges(
id INTEGER PRIMARY KEY,
title TEXT,
description TEXT,     /* HTML SUPPORTED */
flag_hash TEXT,
points INTEGER,
category_id INTEGER,  /* PAKAI RELASI */
file TEXT,
link TEXT             /* LINK DOWNLOAD / SOAL */
)
`)

/* ================= SOLVES ================= */
/* TEAM BASED (ANTI DOUBLE POINT) */
db.run(`
CREATE TABLE IF NOT EXISTS solves(
id INTEGER PRIMARY KEY,
team_id INTEGER,
challenge_id INTEGER
)
`)

/* ================= AUTO ADMIN ================= */
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
