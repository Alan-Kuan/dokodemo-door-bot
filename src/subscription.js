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

async function haveSubscribed(chat_id) {
    await db.connect();
    let res = await db.query(`SELECT chat_id FROM subscribers WHERE chat_id = ${chat_id}`);
    await db.end();
    return res.rowCount > 0;
}

async function subscribe(chat_id) {
    await db.connect();
    let res = await db.query(`SELECT chat_id FROM subscribers WHERE chat_id = ${chat_id}`);
    // have subscribed
    if(res.rowCount > 0) {
        await db.end();
        return false;
    }
    await db.query(`INSERT INTO subscribers VALUES(${chat_id})`);
    await db.end();
    return true;
}

async function unsubscribe(chat_id) {
    await db.connect();
    let res = await db.query(`DELETE FROM subscribers WHERE chat_id = ${chat_id}`);
    await db.end();
    return res.rowCount > 0;
}

async function getSubscribers() {
    await db.connect();
    let res = await db.query(`SELECT chat_id FROM subscribers`);
    await db.end();
    return res.rows.map(e => e.chat_id);
}

module.exports = { haveSubscribed, subscribe, unsubscribe, getSubscribers };
