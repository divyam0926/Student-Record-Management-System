/**
 * Server Entry Point
 */

const app = require('./app');
const { initDatabase, getIsUsingMySQL } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Initialize Database (Connects to MySQL or falls back gracefully)
        await initDatabase();

        const server = app.listen(PORT, () => {
            console.log('====================================================');
            console.log('  STUDENT RECORD MANAGEMENT SYSTEM (SRMS)');
            console.log('  MCA Mini Project - Data Structures & Algorithms');
            console.log('====================================================');
            console.log(`  Application Server running at: http://localhost:${PORT}`);
            console.log(`  Database Storage Engine:      ${getIsUsingMySQL() ? 'MySQL 8.0' : 'In-Memory Engine (Ready)'}`);
            console.log(`  API Endpoint Base:            http://localhost:${PORT}/api`);
            console.log(`  Default Admin Credentials:    admin / admin123`);
            console.log('====================================================');
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is in use. Retrying on port ${Number(PORT) + 1}...`);
                app.listen(Number(PORT) + 1, () => {
                    console.log(`Application Server running at: http://localhost:${Number(PORT) + 1}`);
                });
            } else {
                console.error('Server startup error:', err);
            }
        });
    } catch (error) {
        console.error('Fatal initialization error:', error);
        process.exit(1);
    }
}

startServer();