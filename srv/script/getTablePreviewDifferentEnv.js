const cds = require('@sap/cds');
const { switchToEnv } = require('../util/envManager');

module.exports = { getTablePreviewDifferentEnv };

async function getTablePreviewDifferentEnv(req) {
  const sourceDb = await cds.connect.to('db');
  const targetDb = await cds.connect.to('db2');
  const sourceBinding = sourceDb?.options?.binding;
  const targetBinding = targetDb?.options?.binding;
  if (!sourceBinding || !targetBinding) throw new Error('Provide both bindings');

  const { sourceSchema, table, limit = 50 } = req.data;
  if (!sourceSchema || !table) throw new Error('Provide sourceSchema and table');

  switchToEnv(sourceBinding.org, sourceBinding.space);
  const rows = await sourceDb.run(`SELECT * FROM "${sourceSchema}"."${table}" LIMIT ${Number(limit) || 50}`);
  return rows.map(r => ({ json: JSON.stringify(r) }));
}

