const pg = require('serverless-postgres');

const db = new pg({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PASSWD,
    port: 5432,
    debug: true,
    delayMs: 3000
});

async function getImgSource(user_id) {
    await db.connect();
    let res = await db.query(`SELECT img_source FROM user_preference WHERE user_id = ${user_id}`);
    await db.end();
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
    await db.end();
}

module.exports = { getImgSource, setImgSource };
