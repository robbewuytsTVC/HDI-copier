const cds = require('@sap/cds');
const { switchToEnv } = require('../util/envManager');

module.exports = { getTableCountDifferentEnv };

async function getTableCountDifferentEnv(req) {
  const sourceDb = await cds.connect.to('db');
  const targetDb = await cds.connect.to('db2');
  const sourceBinding = sourceDb?.options?.binding;
  const targetBinding = targetDb?.options?.binding;
  if (!sourceBinding || !targetBinding) throw new Error('Provide both bindings');

  const { sourceSchema, table } = req.data;
  if (!sourceSchema || !table) throw new Error('Provide sourceSchema and table');

  switchToEnv(sourceBinding.org, sourceBinding.space);
  const rows = await sourceDb.run(`SELECT COUNT(*) AS CNT FROM "${sourceSchema}"."${table}"`);
  const cnt = Array.isArray(rows) ? rows[0]?.CNT : rows?.CNT;
  return Number(cnt) || 0;
}

