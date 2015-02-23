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

        jasperprinting: {
            ui: {
                preparePrint: "Voorbereiden printen",
                error: "Error",
                printError: "An error occured while preparing the print.",
                noLegend: "Geen legende",
                print: "Afdrukken",
                cancel: "Annuleren",
                landscape: "Liggend",
                portrait: "Staand",
                description: "Beschrijving (max 255 tekens)",
                title: "Titel",
                descriptionLeft: "Beschrijving kaart links",
                titleLeft: "Titel kaart links",
                extent: "Centreer de cirkel",
                center: "Midden van het kaartbeeld"
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
                placeHolder: "Adres, interessante plaats, perceelnummer, trefwoord, coördinaat"
            }
        },

        disclaimer: {
            ui: {
                title: "Disclaimer",
                acceptButton: "Sluiten",
                disclaimer: "<p>De toegang tot de informatie op dit geoloket is publiek en kosteloos.</p>" +
                    "<p>U kan alleen kennis nemen van de medegedeelde informatie.</p>" +
                    "<p>Noch het AGIV, noch de bronhouders van de informatie, kan(kunnen) aansprakelijk gesteld worden voor onjuistheden of onvolledigheden in de verstrekte informatie, het gebruik of de gevolgen ervan, noch voor de werking van deze viewer.</p>"
            }
        }

    }
        )
);