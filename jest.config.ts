import type { Config } from 'jest';

const config: Config = {
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '#(.*)\.js': '<rootDir>/lib/$1.ts'
    },
};

export default config;
