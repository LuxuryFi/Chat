/**
 * Required due to mysql2 dynamic lazy loading - Refer this link for more info
 * https://stackoverflow.com/questions/46227783/encoding-not-recognized-in-jest-js
 */
require('mysql2/node_modules/iconv-lite').encodingExists('foo');
const auditLogger = require('audit-logger');
const config = require('./src/config/config');

// Initialize Audit Logger DB Connection to avoid error throw
auditLogger.init(config.auditDBSettings);
