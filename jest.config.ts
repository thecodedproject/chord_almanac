module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "\\.css$": "<rootDir>/__mocks__/style_mock.js",
    // see webpack.config.js: one react, even when music-lib is linked locally
    "^react$": "<rootDir>/node_modules/react",
    "^react/(.*)$": "<rootDir>/node_modules/react/$1",
  },
};
