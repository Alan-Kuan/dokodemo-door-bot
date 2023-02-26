import pg from 'serverless-postgres';

const db = new pg({
        host: process.env.PG_HOST,
        database: process.env.PG_DB,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWD,
        port: 5432,
        debug: true,
        delayMs: 3000
    }, manualMaxConnections=true, maxConnections=5);

export async function haveSubscribed(user_id) {
    await db.connect();
    let res = await db.query(`SELECT user_id FROM subscribers WHERE user_id = ${user_id}`);
    await db.clean();
    return res.rowCount > 0;
}

export async function subscribe(user_id) {
    await db.connect();
    let res = await db.query(`SELECT user_id FROM subscribers WHERE user_id = ${user_id}`);
    // have subscribed
    if(res.rowCount > 0) {
        await db.clean();
        return false;
    }
    await db.query(`INSERT INTO subscribers VALUES(${user_id})`);
    await db.clean();
    return true;
}

export async function unsubscribe(user_id) {
    await db.connect();
    let res = await db.query(`DELETE FROM subscribers WHERE user_id = ${user_id}`);
    await db.clean();
    return res.rowCount > 0;
}

export async function getSubscribers(src) {
    await db.connect();
    let res = await db.query(`SELECT user_id FROM subscribers NATURAL JOIN user_preference WHERE img_source = '${src}'`);
    await db.clean();
    return res.rows.map(e => e.user_id);
}
