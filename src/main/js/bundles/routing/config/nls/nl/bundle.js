define(
    ({
        bundleName: "Routing Config Bundle",
        menu: {
            baseTitle: "Routing",
            description: "Configuration for the rounting bundle",
            sources: {
                baseTitle: "Routing geolocation/search",
                description: "Configuration for the different search sources"
            },
            geolocator: {
                baseTitle: "Geolocator",
                description: "Configuration for the Geolocator used in routing",
                count: "Suggestion count",
                minQueryLength: "Minimal length of input",
                useNavteqFallback: "Use Navteq geolocation if Geolocator service has no results",
                useInSearch: "Use this component in search",
                "suggestUrl": "URL for suggest requests",
                "locationUrl": "URL for location requests"
            },
            searchwidget: {
                baseTitle: "Search Widget",
                description: "Configuration for the search´s widget",
                delay: "Delay of suggestion request in ms"
            },
            resultwidget: {
                baseTitle: "Suggestion Widget",
                description: "Configuration of the suggestion list",
                width: "Width of the list in pixel",
                highlight: "Highlight the searchterm in resulttitle"
            },
            geometryrenderer: {
                baseTitle: "Geometry rendering",
                description: "Configuration of the geometry rendering for search results",
                color: "Fillcolor of the geometries (R,G,B,A)",
                outlineColor: "Outlinecolor of the geometries (R,G,B,A)",
                pointZoomScale: "Scale for point results zoom"
            }
        }
    })
);