const pool = require("../config/db");

const findAdminByEmail = async (email) => {
    const query = `
        SELECT
            id,
            name,
            email,
            password,
            role,
            status
        FROM users
        WHERE email = $1
        AND role = 'ADMIN';
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0];
};

module.exports = {
    findAdminByEmail,
};