const adminOnly = (req, res, next) => {

    if (req.user.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin only."
        });
    }

    next();
};

const studentOnly = (req, res, next) => {

    if (req.user.role !== "STUDENT") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Student only."
        });
    }

    next();
};

module.exports = {
    adminOnly,
    studentOnly,
};