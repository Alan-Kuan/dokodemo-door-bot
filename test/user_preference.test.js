import pg from 'serverless-postgres';
import { getImgSource, setImgSource, removeImgSource } from '../src/user_preference.js';
import { IMG_SRCS } from '../src/wiki/index.js';

const db_config = {
        host: process.env.PG_HOST,
        database: process.env.PG_DB,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWD,
        port: 5432,
        debug: true,
        delayMs: 3000
    };

describe('Test src/user_preference.js', () => {
    let db;

    beforeAll(async () => {
        db = new pg(db_config, manualMaxConnections=true, maxConnections=5)
        await db.connect();
        await db.query(`CREATE TABLE user_preference(
                            user_id bigint NOT NULL,
                            img_source smallint
                        )`);
        await db.clean();
    });

    afterAll(async () => {
        await db.connect();
        await db.query(`DROP TABLE user_preference`);
        await db.end();
    });

    describe('Test setImgSource()', () => {
        it('should update the record if user_id exists in the table', async () => {
            await db.connect();
            await db.query(`INSERT INTO user_preference VALUES(123, ${ IMG_SRCS.wikipedia_en })`);
            await db.clean();
            await setImgSource(123, IMG_SRCS.wikimedia_commons);
            await db.connect();
            let res = await db.query('SELECT img_source FROM user_preference WHERE user_id = 123');
            await db.clean();
            expect(res.rowCount).toBe(1);
            expect(res.rows[0].img_source).toBe(IMG_SRCS.wikimedia_commons);
        });

        it("should insert a new record if user_id doesn't exist in the table", async () => {
            await setImgSource(456, IMG_SRCS.wikipedia_en);
            await db.connect();
            let res = await db.query('SELECT img_source FROM user_preference WHERE user_id = 456');
            await db.clean();
            expect(res.rowCount).toBe(1);
            expect(res.rows[0].img_source).toBe(IMG_SRCS.wikipedia_en);
        });
    });

    describe('Test getImgSource()', () => {
        it('should return prefered image source if user_id exists in the table', () => {
            return expect(getImgSource(123)).resolves.toBe(IMG_SRCS.wikimedia_commons);
        });

        it("should return 'null' if user_id doesn't exist in the table", () => {
            return expect(getImgSource(789)).resolves.toBeNull();
        });
    });

    describe('Test removeImgSource()', () => {
        it('should remove the record if user_id exists in the table', async () => {
            await setImgSource(123, IMG_SRCS.wikipedia_en);
            await removeImgSource(123);
            await db.connect();
            let res = await db.query('SELECT user_id FROM user_preference WHERE user_id = 123');
            await db.clean();
            expect(res.rows).toHaveLength(0);
        });
    });
});
