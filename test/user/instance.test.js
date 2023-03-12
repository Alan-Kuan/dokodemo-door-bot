import { Types } from 'mongoose';
import mockingoose from 'mockingoose';
import { User } from '../../lib/user/models.js';
import user from '../../lib/user/index.js';

describe('Test user/instance.js', () => {
    describe('Test add()', () => {
        it('should return true if successfully added', async () => {
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 0,
                upsertedId: new Types.ObjectId('000000000000000000000000'),
                upsertedCount: 1,
                matchedCount: 0
            }, 'updateOne');
            await expect(user.add(1234)).resolves.toBe(true);
        });

        it('should return false if the user already existed', async () => {
            mockingoose(User).toReturn({
                acknowledged: true,
                modifiedCount: 0,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 1
            }, 'updateOne');
            await expect(user.add(1234)).resolves.toBe(false);
        });
    });
});
