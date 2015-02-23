define(
    ({
        appTitle: "Geopunt-viewer",
        generic: {
            map: {
                operational: {
                    administrative_units: {
                        //the title shown in the mapflow
                        title: "Administratieve Eenheden",
                        //the description shown in the bottom bar, if selected
                        description: "Administratieve Eenheden",
                        //the different layers and their title mappings
                        Refgew: "Refgew",
                        Watering: "Watering",
                        Polder: "Polder",
                        Refgem: "Refgem",
                        Refarr: "Refarr",
                        Refprv: "Refprv"
                    },
                    adresses: {
                        title: "Adressen",
                        description: "Adressen",
                        Adrespos: "Adrespos"
                    },
                    hydrography: {
                        title: "Hydrografie",
                        description: "Hydrografie",
                        Wlas: "Wlas",
                        Bekken: "Bekken",
                        Deelbekken: "Deelbekken",
                        Vhazone: "Vhazone"
                    },
                    protected_areas: {
                        title: "Beschermde Gebieden",
                        description: "Beschermde Gebieden",
                        Habrl: "Habrl",
                        Bosres: "Bosres",
                        Vogrl: "Vogrl",
                        Ven: "Ven",
                        Natres: "Natres"
                    },
                    land_use: {
                        title: "Bodemgebruik",
                        description: "Bodemgebruik",
                        Bosreferentielaag: "Bosreferentielaag"
                    },
                    height: {
                        title: "Hoogte",
                        description: "Hoogte",
                        DHM: "DHM"
                    },
                    ortho_imagery: {
                        title: "Orthobeeldvorming",
                        description: "Orthobeeldvorming",
                        RGB: "RGB",
                        PAN: "PAN",
                        CIR: "CIR"
                    },
                    historic: {
                        title: "Historic",
                        ferraris: "ferraris",
                        popp: "popp"
                    }
                }
            }
        },

        printhtml: {
            bronnenText: "Bronnen: Geopunt-viewer (${date}), <theme>",
            printTitle: "Geopunt-viewer (${date})"
        },

        splashscreen: {
            loadTitle: "De kaart wordt geladen.",
            loadBundle: "{percent}%"
        },

        search: {
            ui: {
                placeHolder: "Adres, co\u00F6rdinaat",
                noValue: "Geen waarde",
                searchTypes: {GEOLOCATOR: "adres"},
                noResult: "Niet gevonden. Probeer opnieuw."
            },
            defaultInfoTemplate: {title: "Zoekresultaat", content: "${title}"}
        },

        disclaimer: {
            ui: {
                title: "Disclaimer",
                acceptButton: "Sluiten",
                disclaimer: "<p>De toegang tot de informatie op dit geoloket is publiek en kosteloos.</p>" +
                    "<p>U kan alleen kennis nemen van de medegedeelde informatie.</p>" +
                    "<p>Noch het AGIV, noch de bronhouders van de informatie, kan(kunnen) aansprakelijk gesteld worden voor onjuistheden of onvolledigheden in de verstrekte informatie, het gebruik of de gevolgen ervan, noch voor de werking van deze viewer.</p>"
            }
        },
        combicontentmanager: {
            ui: {
                docktool: {
                    title: "Thema",
                    tooltip: "Kies thema\u00b4s en lagen"
                },
                thema: {tooltip: "Toon/verberg thema\u00b4s"},
                layermanager: {tooltip: "Toon/verberg mijn selecties"},
                kiesThemas: "Thema\u00b4s",
                mijnSelecties: "Mijn selecties",
                graphicLayerTitle: "Mijn plaatsen",
                operationalLayerTitle: "Mijn lagen",
                graphicLayerManager: {
                    allLayersLabel: "Alle lagen",
                    backgroundLabel: "achtergrond",
                    overlayLabel: "mijn datalagen",
                    layersLabel: "Lagen",
                    notVisible: "Deze laag is pas zichtbaar vanaf een groter schaalniveau. Zoom verder in om de laag zichtbaar te maken.",
                    shownPOIsLabel: "Shown",
                    totalPOIsLabel: "Total",
                    removeLayer: "Verwijder plaats",
                    switchLayerVisible: "Toon plaats",
                    switchLayerInvisible: "Verberg plaats",
                    switchAllLayersInvisible: "alle lagen onzichtbaar",
                    switchAllLayersVisible: "alle lagen zichtbaar",
                    removeAllLayers: "Verwijder al mijn plaatsen",
                    infoLayer: "Toon lijst van de kaart getoonde plaatsen over ${poitype}",
                    transparency: "Wijzig transparantie",
                    poiListItem: {
                        poiWindowTitle: "Info",
                        id: "ID",
                        primarylabel: "Naam",
                        vialink: "Meer Info"
                    }
                },
                operationalLayerManager: {
                    allLayersLabel: "Alle lagen",
                    backgroundLabel: "achtergrond",
                    overlayLabel: "mijn datalagen",
                    layersLabel: "Lagen",
                    notVisible: "Deze laag is pas zichtbaar vanaf een groter schaalniveau. Zoom verder in om de laag zichtbaar te maken.",
                    shownPOIsLabel: "Shown",
                    totalPOIsLabel: "Total",
                    removeLayer: "Verwijder laag",
                    switchLayerVisible: "Toon laag",
                    switchLayerInvisible: "Verberg laag",
                    switchAllLayersInvisible: "alle lagen onzichtbaar",
                    switchAllLayersVisible: "alle lagen zichtbaar",
                    removeAllLayers: "Verwijder al mijn lagen",
                    infoLayer: "POI Info",
                    transparency: "Wijzig transparantie",
                    poiListItem: {
                        poiWindowTitle: "Info",
                        id: "ID",
                        primarylabel: "Naam",
                        vialink: "Meer Info"
                    }
                },
                nodescription: "No description available",
                scale: "Van schaal ${maxScale} tot ${minScale}",
                searchTypes: {CONTENTMODEL: "thema"},
                tree: {
                    categorytooltip: "Toon lagen onder het thema ${category}",
                    layertooltip: "${description}",
                    mainCategory: "Thema\u00b4s"
                }
            },
            rvv: {
                map: {
                    operational: {
                        agiv: {
                            title: "Geoloket RVV-themabestand",
                            description: "Agiv RVV Feature ServicesConfig",
                            municipalborders: {title: "Gemeentegrenzen"},
                            grotkleinschalig: {title: "RVV-afbakeningen"},
                            kleinschalig: {
                                title: "RVV-afbakeningen (\u2264 1 : 15 000)",
                                description: "Recht van voorkoop vastgesteld"
                            },
                            grootschalig: {
                                title: "RVV-afbakeningen (\x3e 1 : 14 999)",
                                description: "Recht van voorkoop vastgesteld"
                            },
                            RVVPercelen: {
                                title: "RVV-themabestand",
                                description: "Recht van voorkoop van toepassing"
                            },
                            parcels: {title: "Digitale kadastrale percelenplannen"},
                            cadmap: {title: "Perceel"},
                            parcelnumbers: {title: "Kadastraal perceelnummer"}
                        }
                    }
                }
            }
        }
    })
);