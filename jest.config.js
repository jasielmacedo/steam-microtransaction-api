module.exports = {
  setupFiles: ['./tests/setup.js'],
  preset: 'ts-jest',
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  moduleNameMapper: {
    '^@steam/(.*)$': '<rootDir>/src/steam/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
};
