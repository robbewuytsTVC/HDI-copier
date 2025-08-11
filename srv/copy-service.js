const {compareSchemas} = require('./script/compareTables');
const {compareTablesDiffEnv} = require('./script/compareTablesDiffEnv');
const {fillTables} = require('./script/fillTables');
const {fillTablesDifferentEnv} = require('./script/fillTablesDifferentEnv');
const {copySelectedTables} = require('./script/copySelectedTables');
const {copySelectedTablesDifferentEnv} = require('./script/copySelectedTablesDifferentEnv');
const {getTablePreview} = require('./script/getTablePreview');
const {getTablePreviewDifferentEnv} = require('./script/getTablePreviewDifferentEnv');
const {getTableCount} = require('./script/getTableCount');
const {getTableCountDifferentEnv} = require('./script/getTableCountDifferentEnv');

module.exports = async (srv) => {
    srv.on('compareSchemas', async (req) => await compareSchemas(req));
    srv.on('compareTablesDiffEnv', async (req) => await compareTablesDiffEnv(req));
    srv.on('fillTables', async (req) => await fillTables(req));
    srv.on('fillTablesDifferentEnv', async (req) => await fillTablesDifferentEnv(req));
    srv.on('copySelectedTables', async (req) => await copySelectedTables(req));
    srv.on('copySelectedTablesDifferentEnv', async (req) => await copySelectedTablesDifferentEnv(req));
    srv.on('getTablePreview', async (req) => await getTablePreview(req));
    srv.on('getTablePreviewDifferentEnv', async (req) => await getTablePreviewDifferentEnv(req));
    srv.on('getTableCount', async (req) => await getTableCount(req));
    srv.on('getTableCountDifferentEnv', async (req) => await getTableCountDifferentEnv(req));
}
