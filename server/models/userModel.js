/**
 * User Model
 * Data access abstraction for admin and faculty users
 */

const { getPool, getIsUsingMySQL, inMemoryStore, autoIncrementCounters } = require('../config/db');

class UserModel {
    static async findByUsername(username) {
        if (getIsUsingMySQL()) {
            const pool = getPool();
            const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
            return rows[0] || null;
        } else {
            const user = inMemoryStore.users.find(u => u.username.toLowerCase() === username.toLowerCase());
            return user ? {...user } : null;
        }
    }

    static async findById(id) {
        if (getIsUsingMySQL()) {
            const pool = getPool();
            const [rows] = await pool.query('SELECT user_id, username, role, created_at FROM users WHERE user_id = ?', [id]);
            return rows[0] || null;
        } else {
            const user = inMemoryStore.users.find(u => u.user_id === parseInt(id, 10));
            if (!user) return null;
            const { password, ...safeUser } = user;
            return safeUser;
        }
    }

    static async create(userData) {
        const { username, password, role = 'admin' } = userData;
        if (getIsUsingMySQL()) {
            const pool = getPool();
            const [result] = await pool.query(
                'INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role]
            );
            return { user_id: result.insertId, username, role };
        } else {
            const newUser = {
                user_id: autoIncrementCounters.users++,
                username,
                password,
                role,
                created_at: new Date()
            };
            inMemoryStore.users.push(newUser);
            return { user_id: newUser.user_id, username, role };
        }
    }
}

module.exports = UserModel;