const cds = require('@sap/cds');
const { compareSchemas } = require('../script/compareTables');

module.exports = {
    fillTables
}

async function fillTables(req) {
    const output = [];
    const excludedTables = ['COM_ELIAGROUP_EHS_CO2_SC3_USERS', "COM_ELIAGROUP_EHS_CO2_SC3_ATTACHMENTS"]

    // 1. Create connections to both HDI containers (source and target)
    const sourceDb = await cds.connect.to('db');
    const targetDb = await cds.connect.to('db2');

    // 2. Extract source and target schema names from the request payload
    const { sourceSchema, targetSchema } = req.data;

    // 3. Retrieve schema comparison info (tables present in both schemas)
    const compareInfo = await compareSchemas(req);
    console.log("---------------- Successfully compared schemas")
    console.log("---------------- Started the insertion of data")
    // 4. Loop over each table that exists in both source and target schemas
    for (const table of compareInfo.presentTables) {
        if(excludedTables.includes(table)) continue;
        console.log(`Copying data from ${sourceSchema}.${table} to ${targetSchema}.${table}`);
        try {
            // 4a. Fetch all data from the current source table
            const tableData = await sourceDb.run(`SELECT * FROM "${sourceSchema}"."${table}"`);

            // 4b. Delete existing data from the corresponding target table
            await targetDb.run(`DELETE FROM "${targetSchema}"."${table}"`);

            // 4c. Insert the fetched source data into the target table
            await targetDb.run(INSERT.into(table).entries(tableData));

            // 4d. Log the number of inserted rows for each table in the output
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