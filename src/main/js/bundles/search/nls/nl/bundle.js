define(
    ({
        bundleName: "Search",
        bundleDescription: "Search",
        ui: {
            placeHolder: "Adres, gemeente, interessante plaats, perceel, thema",
            noValue: "Geen waarde",
            searchTypes: {
                GEOLOCATOR: "adres"
            },
            errorMessage: "Coordinaten als parameter kan slechts éénmaal gebruikt worden.",
            invalidMessage: "Coordinaten ${coordinate} als parameter niet gevonden."
        },
        defaultInfoTemplate: {
            title: "Zoekresultaat",
            content: "${title}"
        }
    })
);