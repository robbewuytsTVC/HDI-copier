const cds = require('@sap/cds');

module.exports = { getTablePreview };

async function getTablePreview(req) {
  const sourceDb = await cds.connect.to('db');
  const { sourceSchema, table, limit = 50 } = req.data;
  if (!sourceSchema || !table) throw new Error('Provide sourceSchema and table');
  const rows = await sourceDb.run(`SELECT * FROM "${sourceSchema}"."${table}" LIMIT ${Number(limit) || 50}`);
  return rows.map(r => ({ json: JSON.stringify(r) }));
}

