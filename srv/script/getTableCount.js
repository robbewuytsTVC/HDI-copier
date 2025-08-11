const cds = require('@sap/cds');

module.exports = { getTableCount };

async function getTableCount(req) {
  const db = await cds.connect.to('db');
  const { sourceSchema, table } = req.data;
  if (!sourceSchema || !table) throw new Error('Provide sourceSchema and table');
  const rows = await db.run(`SELECT COUNT(*) AS CNT FROM "${sourceSchema}"."${table}"`);
  const cnt = Array.isArray(rows) ? rows[0]?.CNT : rows?.CNT;
  return Number(cnt) || 0;
}

