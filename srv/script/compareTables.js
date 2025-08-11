const cds = require('@sap/cds');

module.exports = {
    compareSchemas
}

async function compareSchemas(req) {
    // 1. Create connections to HDI containers
    const sourceDb = await cds.connect.to('db');
    const targetDb = await cds.connect.to('db2');

    // 2. Get schema names
    const { sourceSchema, targetSchema } = req.data

    // 3. Validate input parameters
    if (!sourceSchema || !targetSchema) throw new Error("Please provide a source and target schema.")

    // 4. Get all table names from the source schema
    const sourceTablesQuery = `SELECT TABLE_NAME FROM SYS.TABLES WHERE SCHEMA_NAME = '${sourceSchema}'`;
    const sourceTablesResult = await sourceDb.run(sourceTablesQuery);
    const sourceTables = sourceTablesResult.map(row => row.TABLE_NAME);

    // 5. Get all table names from the target schema
    const targetTablesQuery = `SELECT TABLE_NAME FROM SYS.TABLES WHERE SCHEMA_NAME = '${targetSchema}'`;
    const targetTablesResult = await targetDb.run(targetTablesQuery);
    const targetTables = targetTablesResult.map(row => row.TABLE_NAME);

    // 6. Compare schemas
    const missingInTarget = sourceTables.filter(tableName => !targetTables.includes(tableName));
    const presentInBoth = sourceTables.filter(tableName => targetTables.includes(tableName));

    // 7. Return output
    return {
        isComplete: missingInTarget.length === 0,
        missingTables: missingInTarget,
        presentTables: presentInBoth
    };
}