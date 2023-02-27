import db from './db.js';

export async function getImgSource(user_id) {
    await db.connect();
    let res = await db.query(`SELECT img_source FROM user_preference WHERE user_id = ${user_id}`);
    await db.clean();
    if (res.rowCount === 0) {
        return null;
    }
    return res.rows[0].img_source;
}

export async function setImgSource(user_id, src) {
    await db.connect();
    let res = await db.query(`UPDATE user_preference SET img_source = '${src}' WHERE user_id = ${user_id}`);
    if (res.rowCount === 0) {
        await db.query(`INSERT INTO user_preference VALUES(${user_id}, '${src}')`);
    }
    await db.clean();
}

export async function removeImgSource(user_id) {
    await db.connect();
    await db.query(`DELETE FROM user_preference WHERE user_id = ${user_id}`);
    await db.clean();
}
