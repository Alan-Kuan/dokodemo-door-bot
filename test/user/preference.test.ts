import { describe, it, expect } from '@jest/globals';
import { Types } from 'mongoose';
import mockingoose from 'mockingoose';

import { User } from '#user/models.ts';
import {
    setPicSource,
    getPicSource,
    hasBlockedBot,
    setBlockedBot,
    setUnblockedBot,
} from '#user/preference.ts';

describe('Test user/preference.ts', () => {
    describe('Test setPicSource()', () => {
       it("should return true if the user's prefered picture source was not the given one", async () => {
            // @ts-ignore
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 1,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(setPicSource(1234, 0)).resolves.toBe(true);
        });

        it("should return false if the user's prefered picture source was already the given one", async () => {
            // @ts-ignore
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 0,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(setPicSource(5678, 0)).resolves.toBe(false);
        });
    });

    describe('Test getPicSource()', () => {
        it('should return prefered picture source if the user exists', async () => {
            // @ts-ignore
            mockingoose(User).toReturn({
                _id: new Types.ObjectId('000000000000000000000000'),
                user_id: 1234,
                pic_source: 0,
                subscribed: false
            }, 'findOne');
            await expect(getPicSource(1234)).resolves.toBe(0);
        });

        it('should return `null` if the user does not exist', async () => {
            // @ts-ignore
            mockingoose(User).toReturn(null, 'findOne');
            await expect(getPicSource(9999)).resolves.toBeNull();
        });
    });

    describe('Test hasBlockedBot()', () => {
        it('should return true if the user blocked the bot', async () => {
            // @ts-ignore
            mockingoose(User).toReturn({

            }, 'findOne');
            await expect(hasBlockedBot(1234)).resolves.toBe(true);
        });

        it('should return false if the user did not block the bot', async () => {
            // @ts-ignore
            mockingoose(User).toReturn({

            }, 'findOne');
            await expect(hasBlockedBot(5678)).resolves.toBe(true);
        });
    });

    describe('Test setBlockedBot()', () => {
        it('should return true if updated successfully', async () => {
            // @ts-ignore
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 1,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(setBlockedBot(1234)).resolves.toBe(true);
        });

        it('should return false if the user has already blocked the bot', async () => {
            // @ts-ignore
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 0,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(setBlockedBot(1234)).resolves.toBe(false);
        });
    });

    describe('Test setUnblockedBot()', () => {
        it('should return true if updated successfully', async () => {
            // @ts-ignore
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 1,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(setUnblockedBot(1234)).resolves.toBe(true);
        });

        it('should return false if the user has already unblocked the bot or did not block the bot', async () => {
            // @ts-ignore
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 0,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(setUnblockedBot(1234)).resolves.toBe(false);
        });
    });
});
