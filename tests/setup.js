const env = {
  NODE_ENV: 'test',
};

process.env = {
  ...process.env,
  ...env,
};
