require('dotenv').config()

module.exports = {
  testEnvironment: "node",
  globalSetup: '<rootDir>/tests/setup.mjs',
  moduleFileExtensions: ['js', 'mjs']
};
