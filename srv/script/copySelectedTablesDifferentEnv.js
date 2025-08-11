const cds = require('@sap/cds');
const { compareTablesDiffEnv } = require('../script/compareTablesDiffEnv');
const { switchToEnv } = require('../util/envManager');

module.exports = { copySelectedTablesDifferentEnv };

async function copySelectedTablesDifferentEnv(req) {
  const output = [];

  const sourceDb = await cds.connect.to('db');
  const targetDb = await cds.connect.to('db2');
  const sourceBinding = sourceDb?.options?.binding;
  const targetBinding = targetDb?.options?.binding;

  if (!sourceBinding || !targetBinding) throw new Error('Please provide a source and target binding.');

  const { sourceSchema, targetSchema, tables } = req.data;
  if (!sourceSchema || !targetSchema) throw new Error('Please provide a source and target schema.');
  if (!Array.isArray(tables) || tables.length === 0) throw new Error('Please provide a non-empty list of tables.');

  const compareInfo = await compareTablesDiffEnv({ data: { sourceSchema, targetSchema } });
  const allowed = new Set(compareInfo.presentTables);
  const selected = tables.filter(t => allowed.has(t));

  for (const table of selected) {
    try {
      switchToEnv(sourceBinding.org, sourceBinding.space);
      const data = await sourceDb.run(`SELECT * FROM "${sourceSchema}"."${table}"`);

      switchToEnv(targetBinding.org, targetBinding.space);
      await targetDb.run(`DELETE FROM "${targetSchema}"."${table}"`);
      await targetDb.run(INSERT.into(table).entries(data));

      output.push({ name: table, rows: data.length });
    } catch (error) {
      throw new Error('Something went wrong when trying to insert into ' + table, error);
    }
  }

  return output;
}

