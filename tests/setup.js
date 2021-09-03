const env = {
  NODE_ENV: 'test',
  STEAM_WEBKEY: 'FAKE-KEY-FOR-TEST-ONLY',
  STEAM_APP_ID: '480',
  PORT: 4422,
};

process.env = {
  ...process.env,
  ...env,
};
