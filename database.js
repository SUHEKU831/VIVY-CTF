const sqlite3 = require("sqlite3").verbose()

const db = new sqlite3.Database("./database.db")

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

db.run(`
CREATE TABLE IF NOT EXISTS challenges(
id INTEGER PRIMARY KEY,
title TEXT,
description TEXT,
flag_hash TEXT,
points INTEGER,
category TEXT
)
`)

db.run(`
CREATE TABLE IF NOT EXISTS solves(
id INTEGER PRIMARY KEY,
user_id INTEGER,
challenge_id INTEGER
)
`)

})

module.exports = db
