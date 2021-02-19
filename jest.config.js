module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  moduleNameMapper: {
    '^@thirdparty/(.*)$': '<rootDir>/src/thirdparty/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
};
