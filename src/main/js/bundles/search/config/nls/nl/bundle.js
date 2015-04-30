define(
    ({
        bundleName: "Search Config Bundle",
        menu: {
            baseTitle: "Search",
            description: "Configuration for the search bar",
            sources: {
                baseTitle: "Search sources",
                description: "Configuration for the different search sources"
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
                highlight: "Highlight the searchterm in resulttitle",
                closeOnBlur: "Close the resultlist if user clicks somewhere else?"
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