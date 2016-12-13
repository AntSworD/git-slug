'use strict';

let slug = require('../index');
let pathResolve = require('path').resolve;

slug(pathResolve(__dirname, '../')).then(console.log).catch(console.error);
