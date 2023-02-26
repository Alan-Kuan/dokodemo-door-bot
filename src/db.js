import pg from 'serverless-postgres';

export default new pg({
        host: process.env.PG_HOST,
        database: process.env.PG_DB,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWD,
        port: 5432,
        // only in serverless-postgres
        delayMs: 3000,
        manualMaxConnections: true,
        maxConnections: 5,
    });
