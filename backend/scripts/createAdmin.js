const bcrypt = require("bcrypt");
const pool = require("../config/db");
require("dotenv").config();

const createAdmin = async () => {
    try {
        const name = "Platform Admin";
        const email = "admin@quizplatform.com";
        const password = "Admin@123";

        const existingAdmin = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingAdmin.rows.length > 0) {
            console.log("Admin account already exists");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `
                INSERT INTO users (
                    name,
                    email,
                    password,
                    role,
                    status
                )
                VALUES ($1, $2, $3, 'ADMIN', 'ACTIVE')
                RETURNING id, name, email, role, status;
            `,
            [name, email, hashedPassword]
        );

        console.log("Admin created successfully:");
        console.log(result.rows[0]);
    } catch (error) {
        console.error("Failed to create admin:", error.message);
    } finally {
        await pool.end();
    }
};

createAdmin();