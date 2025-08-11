const cds = require('@sap/cds');
const { compareTablesDiffEnv } = require('../script/compareTablesDiffEnv');
const { switchToEnv } = require('../util/envManager');

module.exports = {
    fillTablesDifferentEnv
}

async function fillTablesDifferentEnv(req) {
    const output = [];
    const excludedTables = ['COM_ELIAGROUP_EHS_CO2_SC3_USERS', "COM_ELIAGROUP_EHS_CO2_SC3_ATTACHMENTS"];

    // 1. Create connections to both HDI containers (source and target)
    const sourceDb = await cds.connect.to('db');
    const targetDb = await cds.connect.to('db2');
    const sourceBinding = sourceDb?.options?.binding;
    const targetBinding = targetDb?.options?.binding;

    if(!sourceBinding || !targetBinding) throw new Error("Please provide a source and target binding.")

    // 2. Extract source and target schema names from the request payload
    const { sourceSchema, targetSchema } = req.data;

    // 3. Retrieve schema comparison info (tables present in both schemas)
    const compareInfo = await compareTablesDiffEnv(req);
    console.log("---------------- Successfully compared schemas")
    console.log("---------------- Started the insertion of data")
    // 4. Loop over each table that exists in both source and target schemas
    for (const table of compareInfo.presentTables) {
        if (excludedTables.includes(table)) continue;
        console.log(`Copying data from ${sourceSchema}.${table} to ${targetSchema}.${table}`);
        try {
            // 4a. Switch to source env
            switchToEnv(sourceBinding.org, sourceBinding.space);

            // 4b. Fetch all data from the current source table
            const tableData = await sourceDb.run(`SELECT * FROM "${sourceSchema}"."${table}"`);

            // 4c. Switch to target env
            switchToEnv(targetBinding.org, targetBinding.space);

            // 4d. Delete existing data from the corresponding target table
            await targetDb.run(`DELETE FROM "${targetSchema}"."${table}"`);

            // 4e. Insert the fetched source data into the target table
            await targetDb.run(INSERT.into(table).entries(tableData));

            // 4f. Log the number of inserted rows for each table in the output
            output.push({ name: table, rows: tableData.length });
        } catch (error) {
            // 5. Catch and throw errors with the table name included
            throw new Error("Something went wrong when trying to insert into " + table, error);
        }
    }

    // 6. Log completion message once all tables have been processed
    console.log("---------------- Successfully finished the data insertion");

    // 7. Return a summary of inserted tables and row counts
    return output;
}