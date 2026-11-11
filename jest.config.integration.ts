import config from './jest.config.ts';

export default {
  ...config,
  testPathIgnorePatterns: ['/node_modules/', '/src/'],
};
