module.exports = {
  preset: '@shelf/jest-mongodb',
  setupFiles: [
    'dotenv/config',
    './jest-startup.js',
  ],
};
