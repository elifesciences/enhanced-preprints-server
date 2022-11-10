import config from './jest.config';

export default {
  ...config,
  testPathIgnorePatterns: ['/node_modules/', '/src/'],
};
