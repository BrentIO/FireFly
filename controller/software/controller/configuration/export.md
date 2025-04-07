# Configuration: Export

To backup configurations that are not ready to be deployed, or simply to save in a safe location, you can use the Export function.  Clicking the **Export** button will cause the database to be downloaded to your browser.

When a configuration is deployed to a Controller, the database is automatically backed up to the `/backup` endpoint of the device.  For more information, see the [API Documentation](/controller/software/controller/api_reference).


::: danger Unencrypted secret information is contained in the file
All information configured about FireFly is contained in this file and the data is **unencrypted**.  Device information, MQTT credentials, and WiFi credentials are stored **unencrypted**.  

*Never post the export to a public forum*.
:::

The file uses the [Dexie.js](https://dexie.org/docs/ExportImport/dexie-export-import) database format.