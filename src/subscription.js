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

async function haveSubscribed(user_id) {
    await db.connect();
    let res = await db.query(`SELECT user_id FROM subscribers WHERE user_id = ${user_id}`);
    await db.end();
    return res.rowCount > 0;
}

async function subscribe(user_id) {
    await db.connect();
    let res = await db.query(`SELECT user_id FROM subscribers WHERE user_id = ${user_id}`);
    // have subscribed
    if(res.rowCount > 0) {
        await db.end();
        return false;
    }
    await db.query(`INSERT INTO subscribers VALUES(${user_id})`);
    await db.end();
    return true;
}

async function unsubscribe(user_id) {
    await db.connect();
    let res = await db.query(`DELETE FROM subscribers WHERE user_id = ${user_id}`);
    await db.end();
    return res.rowCount > 0;
}

async function getSubscribers(src) {
    await db.connect();
    let res = await db.query(`SELECT user_id FROM subscribers NATURAL JOIN user_preference WHERE img_source = '${src}'`);
    await db.end();
    return res.rows.map(e => e.user_id);
}

module.exports = { haveSubscribed, subscribe, unsubscribe, getSubscribers };
