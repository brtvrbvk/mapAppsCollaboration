define(
    ({
        bundleName: "Geolocator Config Bundle",
        menu: {
            baseTitle: "Geolocator",
            urlTitle: "Geolocator URLs",
            parcelTitle: "Parcel URL",
            description: "Configuration for the Geolocator",
            parcel: {
                url: "URL used for parcel geometry retrieval",
                parcelIDFieldName: "Column name for parcel geometry retrieval"
            },
            geolocator: {
                baseTitle: "Geolocator search configuration",
                description: "Configuration for the Geolocator",
                count: "Suggestion count",
                minQueryLength: "Minimal length of input",
                useNavteqFallback: "Use Navteq geolocation if Geolocator service has no results",
                useInSearch: "Use this component in search",
                suggestUrl: "URL for suggest requests",
                locationUrl: "URL for location requests"
            }
        }
    })
);