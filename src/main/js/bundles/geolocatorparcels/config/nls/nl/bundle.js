define(
    ({
        bundleName: "Geolocator_Parcels Config Bundle",
        menu: {
            baseTitle: "Geolocator_Parcels",
            urlTitle: "Geolocator_Parcels URLs",
            parcelTitle: "Geolocator_Parcels Parcel URL",
            description: "Configuration for the Geolocator parcels service",
            parcel: {
                url: "URL used for parcel geometry retrieval",
                parcelIDFieldName: "Column name for parcel geometry retrieval"
            },
            geolocator: {
                baseTitle: "Geolocator_Parcels search configuration",
                description: "Configuration for the Geolocator_Parcels ",
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