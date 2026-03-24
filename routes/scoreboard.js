const express = require("express")
const db = require("../database")

const router = express.Router()

router.get("/",(req,res)=>{

db.all(`
SELECT 
    teams.name as team_name,
    COALESCE(SUM(users.score),0) as score
FROM teams
LEFT JOIN users ON users.team_id = teams.id
GROUP BY teams.id
ORDER BY score DESC
`,(err,teams)=>{

res.render("scoreboard",{teams})

})

})

module.exports = router
