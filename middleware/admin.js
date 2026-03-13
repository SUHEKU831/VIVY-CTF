module.exports = function(req,res,next){

if(!req.session.user || req.session.user.isAdmin !== 1){
return res.send("Admin only")
}

next()

}
