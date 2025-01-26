const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login?error=Please log in to access the dashboard');
    }
}

module.exports = { isAuthenticated };