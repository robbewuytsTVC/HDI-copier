const cds = require('@sap/cds');
const { compareSchemas } = require('../script/compareTables');

module.exports = {
  copySelectedTables
}

async function copySelectedTables(req) {
  const output = [];

  const sourceDb = await cds.connect.to('db');
  const targetDb = await cds.connect.to('db2');

  const { sourceSchema, targetSchema, tables } = req.data;

  if (!sourceSchema || !targetSchema) throw new Error('Please provide a source and target schema.');
  if (!Array.isArray(tables) || tables.length === 0) throw new Error('Please provide a non-empty list of tables.');

  const compareInfo = await compareSchemas({ data: { sourceSchema, targetSchema } });

  // Only allow tables that are present in both schemas
  const allowedTables = new Set(compareInfo.presentTables);
  const selectedPresentTables = tables.filter(t => allowedTables.has(t));

  for (const table of selectedPresentTables) {
    try {
      const tableData = await sourceDb.run(`SELECT * FROM "${sourceSchema}"."${table}"`);
      await targetDb.run(`DELETE FROM "${targetSchema}"."${table}"`);
      await targetDb.run(INSERT.into(table).entries(tableData));
      output.push({ name: table, rows: tableData.length });
    } catch (error) {
      throw new Error('Something went wrong when trying to insert into ' + table, error);
    }
  }

  return output;
}

