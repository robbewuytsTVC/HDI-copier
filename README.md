# 🚀 HDI Data Copier — SAP CAP Project

## 📚 Overview
This project provides a simple SAP CAP-based service to:  
- ✅ Compare table structures (not data) between two HANA schemas (source and target).  
- ✅ Copy data from tables in the source schema to the target schema.  

It uses **two HDI container bindings** (`db` and `db2`), configured via `cdsrc-private.json`, and exposes two main service functions.  

---

## ⚠ Important Setup Notes  
- This project is for running locally in BAS only! Don't deploy.
- Ensure both HDI containers are bound inside `cdsrc-private.json`.  
- **Make sure both the `name` and `vcap.name` fields are renamed accordingly!**  
- Start the project using:  
```bash
cds watch --profile hybrid
```
- In SAP HANA Database Explorer, check for schema names.  
- Then, call the compare and fill functions using the following endpoints:

---

## 🌐 Service Endpoints (examples)
### ➡️ Compare Schemas (with different environment)
```
/odata/v4/copy/compareSchemas(sourceSchema='86E50857F0EC4D559107D0EDACA012BF',targetSchema='HDI_SCOPE3_MVDL')
/odata/v4/copy/compareTablesDiffEnv(sourceSchema='86E50857F0EC4D559107D0EDACA012BF',targetSchema='HDI_SCOPE3_MVDL')
```

### ➡️ Fill Tables (with different environment)
```
/odata/v4/copy/fillTables(sourceSchema='86E50857F0EC4D559107D0EDACA012BF',targetSchema='HDI_SCOPE3_MVDL')
/odata/v4/copy/fillTablesDifferentEnv(sourceSchema='86E50857F0EC4D559107D0EDACA012BF',targetSchema='HDI_SCOPE3_MVDL')
```

### ➡️ Copy Selected Tables (POST)
```
POST /odata/v4/copy/copySelectedTables
{
  "sourceSchema": "86E50857F0EC4D559107D0EDACA012BF",
  "targetSchema": "HDI_SCOPE3_MVDL",
  "tables": ["TABLE_A", "TABLE_B"]
}
```

---

## ⚙️ Example `cdsrc-private.json` Configuration
> Replace the instance names, keys, and vcap names accordingly! If different orgs or spaces are used, keep in mind to use the correct script!

```json
{
  "requires": {
    "[hybrid]": {
      "db": {
        "binding": {
          "type": "cf",
          "apiEndpoint": "https://api.cf.eu10.hana.ondemand.com",
          "org": "eliagroup-111-dev",
          "space": "111_EHS",
          "instance": "ehs-hana-db-srv",
          "key": "ehs-hana-db-srv-key",
          "resolved": false
        },
        "kind": "hana-cloud",
        "vcap": {
          "name": "db"
        }
      },
      "db2": {
        "binding": {
          "type": "cf",
          "apiEndpoint": "https://api.cf.eu10.hana.ondemand.com",
          "org": "eliagroup-111-dev",
          "space": "111_EHS",
          "instance": "CO2-SC3-HDI-Container-MVDL",
          "key": "CO2-SC3-HDI-Container-MVDL-key",
          "resolved": false
        },
        "kind": "hana-cloud",
        "vcap": {
          "name": "db2"
        }
      }
    }
  }
}
```

---

## ✅ Quick Start
```bash
cds watch --profile hybrid
```
> After running, call the endpoints with appropriate schema names.

---

## 📎 Recommendations
- The `fillTables` function clears target tables before copying data.
- For large tables, copying might take some time — monitor logs for progress.

