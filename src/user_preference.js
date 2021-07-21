const pg = require('serverless-postgres');

const db = new pg({
        host: process.env.PG_HOST,
        database: process.env.PG_DB,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWD,
        port: 5432,
        debug: true,
        delayMs: 3000
    }, maxConnections=5);

async function getImgSource(user_id) {
    await db.connect();
    let res = await db.query(`SELECT img_source FROM user_preference WHERE user_id = ${user_id}`);
    await db.clean();
    if(res.rowCount === 0) {
        return null;
    }
    return res.rows[0].img_source;
}

async function setImgSource(user_id, src) {
    await db.connect();
    let res = await db.query(`UPDATE user_preference SET img_source = '${src}' WHERE user_id = ${user_id}`);
    if(res.rowCount === 0) {
        await db.query(`INSERT INTO user_preference VALUES(${user_id}, '${src}')`);
    }
    await db.clean();
}

module.exports = { getImgSource, setImgSource };
