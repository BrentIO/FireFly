# Filtering the Controller's Configuration JSON File

The controller configuration files, stored on ConfigFS, can be very large documents because they contain information both for the controller's production, but also the needs of the configuration application (as described in the Swagger document).  Additionally, the files will be subject to changes in future verions, and only the necessary fields should be evaluated during setup.

To minimize memory consumption, the configuration files are filtered before being evaluated.  This allows ArduinoJSON to limit the fields available available for evaluation by the application, saving memory and offering protection against new fields being added to the JSON.

For information on filtering, see [ArduinoJSON's Filtering Done Right](https://arduinojson.org/news/2020/03/22/version-6-15-0/) article.

Filter for the outputs:
```json
{
    "outputs": {
        "*": {
            "id": true,
            "area": true,
            "icon": true,
            "type": true,
            "enabled": true
        }
    }
}
```

Filter for the input I/O:
```json
{
    "ports": {
        "*": {
            "id": true,
            "channels": {
                "*": {
                    "type": true,
                    "long_change": true,
                    "enabled": true,
                    "offset": true,
                    "actions": true
                }
            }
        }
    }
}
```

