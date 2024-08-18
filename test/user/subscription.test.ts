import { describe, it, expect } from '@jest/globals';
import { Types } from 'mongoose';
import mockingoose from 'mockingoose';

import { User } from '#user/models.ts';
import {
    subscribe,
    hasSubscribed,
    unsubscribe,
    getSubscribersByPicSource,
} from '#user/subscription.ts';

describe('Test user/subscription.ts.', () => {
    describe('Test subscribe()', () => {
        it('should return true if the user has not subscribed', async () => {
            // @ts-ignore
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 1,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(subscribe(1234)).resolves.toBe(true);
        });

        it('should return false if the user has subscribed', async () => {
            // @ts-ignore
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 0,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(subscribe(1234)).resolves.toBe(false);
        });
    });

    describe('Test hasSubscribed()', () => {
        it('should return true if the user has subscribed', async () => {
            // @ts-ignore
            mockingoose(User).toReturn({
                _id: new Types.ObjectId('000000000000000000000000'),
                user_id: 1234,
                pic_source: 0,
                subscribed: true
            }, 'findOne');
            await expect(hasSubscribed(1234)).resolves.toBe(true);
        });

        it('should return false if the user has not subscribe', async () => {
            // @ts-ignore
            mockingoose(User).toReturn(null, 'findOne');
            await expect(hasSubscribed(5678)).resolves.toBe(false);
        });
    });

    describe('Test unsubscribe()', () => {
        it('should return true if the user has subscribed', async () => {
            // @ts-ignore
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 1,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(unsubscribe(1234)).resolves.toBe(true);
        });

        it('should return false if the user has not subscribe', async () => {
            // @ts-ignore
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 0,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(unsubscribe(5678)).resolves.toBe(false);
        });
    });

    describe('Test getSubscribersByPicSource()', () => {
        it('should return a list of subscribers', async () => {
            // @ts-ignore
            mockingoose(User).toReturn([
                {
                    _id: new Types.ObjectId('000000000000000000000000'),
                    user_id: 1234,
                    pic_source: 0,
                    subscribed: true,
                    receiving_hour: 8
                },
                {
                    _id: new Types.ObjectId('000000000000000000000001'),
                    user_id: 5678,
                    pic_source: 0,
                    subscribed: true,
                    receiving_hour: 8
                },
            ], 'find');
            await expect(getSubscribersByPicSource(0)).resolves.toEqual([1234, 5678]);
        });
    });
});
