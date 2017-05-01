const runBackend = require('./runBackend.js');
const webpackConfigBackendOffline = require('../config/webpack.config.backend.offline');

runBackend(webpackConfigBackendOffline);
