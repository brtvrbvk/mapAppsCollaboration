define(
    ({
        bundleName: "POI Config Bundle",
        menu: {
            baseTitle: "POI",
            description: "The scale field defines the the border to switch to ungeneralized icons. When a new scale is set, the layer stack will be cleared.",
            scale: "Scale",
            search: {
                baseTitle: "POI Search",
                description: "Configuration for the POI search",
                count: "Suggestion count",
                url: "URL of POI service",
                minQueryLength: "Minimal length of input",
                useInSearch: "Use this component in search"
            },
            symbolization: {
                title: "Symbolization",
                icons: "Icon symbolization",
                texts: "Cluster text symbolization",
                clusterlabels: "Show cluster labels?",
                maxcount: "Max count of unclustered POIs"
            }
        }
    })
);