const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const adminAuthRoutes = require("./routes/adminAuthRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const quizRoutes = require("./routes/quizRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const questionRoutes = require("./routes/questionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api", questionRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Quiz Management API is running",
    });
});

pool.connect()
    .then((client) => {
        console.log("PostgreSQL connected successfully");
        client.release();
    })
    .catch((error) => {
        console.error(
            "PostgreSQL connection failed:",
            error.message
        );
    });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});