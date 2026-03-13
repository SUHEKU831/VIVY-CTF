// middleware/auth.js
module.exports = function(req, res, next) {
    // Cek apakah user sudah login
    if (!req.session || !req.session.user) {
        // Redirect ke halaman login jika belum login
        return res.redirect("/auth/login");
    }
    
    // Lanjut ke route berikutnya jika sudah login
    next();
}
