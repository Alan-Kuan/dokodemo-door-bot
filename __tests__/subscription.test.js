const pg = require('serverless-postgres');
const { haveSubscribed,
        subscribe,
        unsubscribe,
        getSubscribers } = require('../src/subscription.js');

const db_config = {
        host: process.env.PG_HOST,
        database: process.env.PG_DB,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWD,
        port: 5432,
        debug: true,
        delayMs: 3000
    };

describe('Test subscription.js.', () => {
    let db;

    beforeAll(async () => {
        db = new pg(db_config, manualMaxConnections=true, maxConnections=5)
        await db.connect();
        await db.query(`CREATE TABLE subscribers(
                            user_id bigint NOT NULL,
                            received_hour smallint NOT NULL DEFAULT 8
                        )`);
        await db.query(`CREATE TABLE user_preference(
                            user_id bigint NOT NULL,
                            img_source char
                        )`);
        await db.clean();
    });

    afterAll(async () => {
        await db.connect();
        await db.query(`DROP TABLE subscribers`);
        await db.end();
    });

    // The following 2 tests should be executed in sequence;
    // therefore they're separated into 2 descriptions.
    describe("Test subscribe() when the user haven't subscribe", () => {
        it("should return true", () => {
            return expect(subscribe(1234)).resolves.toBe(true);
        });
    });
    describe('Test subscribe() when the user have subscribed', () => {
        it("should return false", () => {
            return expect(subscribe(1234)).resolves.toBe(false);
        });
    });
    describe('Test haveSubscribed()', () => {
        it('should return true if the user have subscribed', () => {
            return expect(haveSubscribed(1234)).resolves.toBe(true);
        });
        it("should return false if the user havn't subscribe", () => {
            return expect(haveSubscribed(5678)).resolves.toBe(false);
        });
    });
    describe('Test unsubscribe()', () => {
        it('should return true if the user have subscribed', () => {
            return expect(unsubscribe(1234)).resolves.toBe(true);
        });
        it("should return false if the user haven't subscribe", () => {
            return expect(unsubscribe(5678)).resolves.toBe(false);
        });
    });
    describe("Test getSubscribers() when there's no subscribers", () => {
        it('should return an empty list', () => {
            return expect(getSubscribers()).resolves.toHaveLength(0);
        });
    });
    describe("Test getSubscribers() when there are some subscribers", () => {
        it('should return a list of subscribers', async () => {
            await db.connect();
            await db.query('INSERT INTO subscribers VALUES(1357)');
            await db.query('INSERT INTO subscribers VALUES(2468)');
            await db.query('INSERT INTO subscribers VALUES(6666)');
            await db.query("INSERT INTO user_preference VALUES(1357, 'c')");
            await db.query("INSERT INTO user_preference VALUES(2468, 'e')");
            await db.query("INSERT INTO user_preference VALUES(6666, 'e')");
            await db.clean();
            expect(await getSubscribers('c')).toEqual([1357]);
            expect(await getSubscribers('e')).toEqual([2468, 6666]);
        });
    });

});
