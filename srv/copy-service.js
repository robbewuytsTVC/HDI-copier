const {compareSchemas} = require('./script/compareTables');
const {compareTablesDiffEnv} = require('./script/compareTablesDiffEnv');
const {fillTables} = require('./script/fillTables');
const {fillTablesDifferentEnv} = require('./script/fillTablesDifferentEnv');
const {copySelectedTables} = require('./script/copySelectedTables');
const {copySelectedTablesDifferentEnv} = require('./script/copySelectedTablesDifferentEnv');

module.exports = async (srv) => {
    srv.on('compareSchemas', async (req) => await compareSchemas(req));
    srv.on('compareTablesDiffEnv', async (req) => await compareTablesDiffEnv(req));
    srv.on('fillTables', async (req) => await fillTables(req));
    srv.on('fillTablesDifferentEnv', async (req) => await fillTablesDifferentEnv(req));
    srv.on('copySelectedTables', async (req) => await copySelectedTables(req));
    srv.on('copySelectedTablesDifferentEnv', async (req) => await copySelectedTablesDifferentEnv(req));
}
