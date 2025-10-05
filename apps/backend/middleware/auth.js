const adminEmails = ['pavankommi0503@gmail.com', 'admin2@example.com']; // List of admin emails

function determineRole(req, res, next) {
    // Ensure req.oidc.user is defined
    if (req.oidc && req.oidc.user && req.oidc.user.email) {
        const userEmail = req.oidc.user.email;

        // Determine role based on email
        if (adminEmails.includes(userEmail)) {
            req.userRole = 'admin'; // Set user role to admin
        } else {
            req.userRole = 'author'; // Set user role to author
        }
    } else {
        req.userRole = 'guest'; // Set default role if user is not authenticated
    }
    next();
}

function checkAuth(req, res, next) {
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).send('You need to log in to access this route.');
    }
    next();
}

function requireRole(role) {
    return (req, res, next) => {
        // Use the role set by determineRole middleware
        if (req.userRole === role) {
            return next();
        }
        return res.status(403).send('Access denied.');
    };
}

module.exports = { determineRole, checkAuth, requireRole };
