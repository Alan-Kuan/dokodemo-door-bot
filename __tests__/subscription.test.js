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
        db = new pg(db_config, maxConnections=5)
        await db.connect();
        await db.query(`CREATE TABLE subscribers(
                            user_id bigint NOT NULL,
                            received_hour smallint NOT NULL
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
            return expect(subscribe(1234)).resolves.toBeTrue();
        });
    });
    describe('Test subscribe() when the user have subscribed', () => {
        it("should return false", () => {
            return expect(subscribe(1234)).resolves.toBeFalse();
        });
    });
    describe('Test haveSubscribed()', () => {
        it('should return true if the user have subscribed', () => {
            return expect(haveSubscribed(1234)).resolves.toBeTrue();
        });
        it("should return false if the user havn't subscribe", () => {
            return expect(haveSubscribed(5678)).resolves.toBeFalse();
        });
    });
    describe('Test unsubscribe()', () => {
        it('should return true if the user have subscribed', () => {
            return expect(unsubscribe(1234)).resolves.toBeTrue();
        });
        it("should return false if the user haven't subscribe", () => {
            return expect(unsubscribe(5678)).resolves.toBeFalse();
        });
    });
    describe("Test getSubscribers() when there's no subscribers", () => {
        it('should return an empty list', () => {
            return expect(getSubscribers()).resolves.haveSize(0);
        });
    });
    describe("Test getSubscribers() when there are some subscribers", () => {
        it('should return a list of subscribers', async () => {
            await db.connect();
            await db.query('INSERT INTO subscribers VALUES(1357)');
            await db.query('INSERT INTO subscribers VALUES(2468)');
            await db.query('INSERT INTO subscribers VALUES(6666)');
            await db.clean();
            return expect(getSubscribers()).resolves.toEqual([1357, 2468, 6666]);
        });
    });

});
