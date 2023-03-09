import { Types } from 'mongoose';
import mockingoose from 'mockingoose';
import { User } from '../../lib/user/models.js';
import user from '../../lib/user/index.js';

describe('Test preference.js', () => {
    describe('Test setPicSource()', () => {
       it("should return true if the user's prefered picture source was not the given one", async () => {
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 1,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(user.setPicSource(1234, 0)).resolves.toBe(true);
        });

        it("should return false if the user's prefered picture source was already the given one", async () => {
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 0,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(user.setPicSource(5678, 0)).resolves.toBe(false);
        });
    });

    describe('Test getPicSource()', () => {
        it('should return prefered picture source if the user exists', async () => {
            mockingoose(User).toReturn({
                _id: new Types.ObjectId('000000000000000000000000'),
                user_id: 1234,
                pic_source: 0,
                subscribed: false
            }, 'findOne');
            await expect(user.getPicSource(1234)).resolves.toBe(0);
        });

        it('should return `null` if the user does not exist', async () => {
            mockingoose(User).toReturn(null, 'findOne');
            await expect(user.getPicSource(9999)).resolves.toBeNull();
        });
    });

    describe('Test hasBlockedBot()', () => {
        it('should return true if the user blocked the bot', async () => {
            mockingoose(User).toReturn({

            }, 'findOne');
            await expect(user.hasBlockedBot(1234)).resolves.toBe(true);
        });

        it('should return false if the user did not block the bot', async () => {
            mockingoose(User).toReturn({

            }, 'findOne');
            await expect(user.hasBlockedBot(5678)).resolves.toBe(true);
        });
    });

    describe('Test setBlockedBot()', () => {
        it('should return true if updated successfully', async () => {
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 1,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(user.setBlockedBot(1234)).resolves.toBe(true);
        });

        it('should return false if the user has already blocked the bot', async () => {
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 0,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(user.setBlockedBot(1234)).resolves.toBe(false);
        });
    });

    describe('Test setUnBlockedBot()', () => {
        it('should return true if updated successfully', async () => {
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 1,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(user.setUnBlockedBot(1234)).resolves.toBe(true);
        });

        it('should return false if the user has already unblocked the bot or did not block the bot', async () => {
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 0,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(user.setUnBlockedBot(1234)).resolves.toBe(false);
        });
    });
});
