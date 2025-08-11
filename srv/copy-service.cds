// CopyService with two exposed functions
@requires: 'any'
service CopyService {

    // Compares tables between source and target schemas
    function compareSchemas(sourceSchema : String, targetSchema : String)         returns compareTablesOutput;
    // Compares tables between source and target schemas with a different org or space
    function compareTablesDiffEnv(sourceSchema : String, targetSchema : String)   returns compareTablesOutput;
    // Copies data from source to target tables
    function fillTables(sourceSchema : String, targetSchema : String)             returns many fillTablesOutput;
    // Copies data from source to target tables with a different org or space
    function fillTablesDifferentEnv(sourceSchema : String, targetSchema : String) returns many fillTablesOutput;

    // Copies data only for the selected tables (POST action to allow request body)
    action copySelectedTables(
        sourceSchema : String,
        targetSchema : String,
        tables       : many String
    ) returns many fillTablesOutput;

    // Copies only selected tables when source and target are in different orgs/spaces
    action copySelectedTablesDifferentEnv(
        sourceSchema : String,
        targetSchema : String,
        tables       : many String
    ) returns many fillTablesOutput;
}

// Output type for compareSchemas
type compareTablesOutput {
    isComplete    : Boolean;
    missingTables : many String;
    presentTables : many String;
}

// Output type for fillTables
type fillTablesOutput {
    name : String;
    rows : Int64;
}
