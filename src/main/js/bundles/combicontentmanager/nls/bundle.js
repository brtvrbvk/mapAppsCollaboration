define({
    root: ({
        bundleName: "combicontentmanager",
        bundleDescription: "The Magnifier upscales a specific area of the map in a separate window. Thereby this area can be inspected in more detail without leaving the current view of the main map.",
        ui: {
            nodescription: "No description available",
            scale: "From scale ${maxScale} to ${minScale}",
            searchTypes: {
                CONTENTMODEL: "thema"
            },
            tree: {
                categorytooltip: "Open layer under thema ${category}",
                layertooltip: "${description}"
            },
            switcher: {
                mapLeftTooltip: "Klik om kaarten toe te voegen aan het linkse venster",
                mapRightTooltip: "Klik om kaarten toe te voegen aan het rechtse venster",
                switchButtonTooltip: "Klik om kaarten toe te voegen aan het linkse of rechtse venster"
            }
        },
        rvv: {
            map: {
                operational: {
                    agiv: {
                        title: "Geoloket RVV-themabestand",
                        description: "Agiv RVV Feature Service",
                        municipalborders: {
                            title: "Gemeentegrenzen"
                        },
                        grotkleinschalig: {
                            title: "RVV-afbakeningen"
                        },
                        kleinschalig: {
                            title: "RVV-afbakeningen (\u2264 1 : 15 000)",
                            description: "Recht van voorkoop vastgesteld"
                        },
                        grootschalig: {
                            title: "RVV-afbakeningen (> 1 : 14 999)",
                            description: "Recht van voorkoop vastgesteld"
                        },
                        RVVPercelen: {
                            title: "RVV-themabestand",
                            description: "Recht van voorkoop van toepassing"
                        },
                        parcels: {
                            title: "Digitale kadastrale percelenplannen"
                        },
                        cadmap: {
                            title: "Perceel"
                        },
                        parcelnumbers: {
                            title: "Kadastraal perceelnummer"
                        }
                    }
                }
            }
        }
    }),
    "nl": true
});