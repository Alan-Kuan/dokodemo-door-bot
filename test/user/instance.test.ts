import { describe, it, expect } from '@jest/globals';
import { Types } from 'mongoose';
import mockingoose from 'mockingoose';

import { User } from '#user/models.ts';
import { add } from '#user/instance.ts';

describe('Test user/instance.ts', () => {
    describe('Test add()', () => {
        it('should return true if successfully added', async () => {
            // @ts-ignore
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 0,
                upsertedId: new Types.ObjectId('000000000000000000000000'),
                upsertedCount: 1,
                matchedCount: 0
            }, 'updateOne');
            await expect(add(1234)).resolves.toBe(true);
        });

        it('should return false if the user already existed', async () => {
            // @ts-ignore
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 0,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(add(1234)).resolves.toBe(false);
        });
    });
});
