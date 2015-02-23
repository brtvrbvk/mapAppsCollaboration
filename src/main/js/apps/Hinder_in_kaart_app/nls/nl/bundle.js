define(
    ({
        appTitle: "GIPOD",
        generic: {
            map: {
                operational: {

                }
            }
        },

        printhtml: {
            bronnenText: "Bronnen: Geopunt-viewer (${date}), <theme>",
            printTitle: "Geopunt-viewer (${date})"
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

        splashscreen: {
            loadTitle: "De kaart wordt geladen.",
            loadBundle: "{percent}%"
        },
        search: {
            ui: {
                placeHolder: "Adres, co\u00F6rdinaat",
                noValue: "Geen waarde",
                searchTypes: {
                    GEOLOCATOR: "adres"
                },
                noResult: "Niet gevonden. Probeer opnieuw."
            },
            defaultInfoTemplate: {
                title: "Zoekresultaat",
                content: "${title}"
            }
        },
        genericidentify: {
            ui: {
                feature: "Feature",
                contentInfoWindowTitle: "Info",
                noResultsFound: "Op deze locatie werden geen objecten gevonden",
                loadingInfoText: "Infos are loading...",
                layer: "Layer",
                noQueryLayersFound: "No Layers queryable!",
                graphicsLayerTitle: "Graphics",
                loadingGeneralInfo: "Loading..",
                cityLevel: "De aangeklikte locatie ligt in ",
                addressLevel: "Dichtstbijzijnd adres: ",
                activeLayers: "Actieve lagen:",
                serviceErrorMsg: "An error occured",
                showGeneralInfo: "Toon info",
                hideGeneralInfo: "Verberg info",
                showDescription: "Details",
                hideDescription: "Verberg details",
                showRoute: "Route",
                profileSheets: "profielschets van ",
                infoAbout: "Volgende informatie is van toepassing op de aangeklikte locatie:",
                windowTitle: "Een probleem melden",
                moreInformationPOI: "Meer informatie over ${name}",
                descriptionLabel: "Beschriving",
                noteLabel: "Note",
                more: "meer",
                less: "minder",
                routeTo: "Routing naar deze locatie",
                routeFrom: "Routing vanaf deze locatie",
                crabErrorMessage: "Coordinate not within Flanders or Brussels",
                loadErrorMessage: "Could not load geolocation page",
                featureInfoToolTitle: "Info",
                featureInfoToolTooltip: "Toon meer informatie over een locatie",
                addressTitle: "Adres"
            }
        }
    })
);