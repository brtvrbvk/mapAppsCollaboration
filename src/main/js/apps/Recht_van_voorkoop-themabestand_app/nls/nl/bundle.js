define(
    ({
        appTitle: "RVV-themabestand",
        baselayers: {
            ortho: {
                title: "Ortho",
                description: "Middenschalige Ortho-foto's",
                tooltip: "Selecteer Ortho-foto's"
            },
            hybrid: {
                title: "Hybrid",
                tooltip: "Selecteer Hybride"
            },
            GRB: {
                title: "GRB",
                tooltip: "Selecteer GRB"
            },
            basemap4: {
                title: "OSM",
                tooltip: "Selecteer OpenStreetMap"
            },
            basemap5: {
                title: "MapQuest",
                tooltip: "Selecteer MapQuest"
            },
            normalday: {
                title: "Navteq",
                tooltip: "Selecteer Navteq"
            },
            normaldaygrey: {
                title: "Stratenplan",
                tooltip: "Selecteer stratenplan"
            },
            satelliteday: {
                title: "Navteq sat",
                tooltip: "Selecteer Navteq satellite"
            },
            hybridday: {
                title: "Navteq hybrid",
                tooltip: "Selecteer Navteq hybrid"
            },
            terrainday: {
                title: "Navteq terrain",
                tooltip: "Selecteer Navteq terrain"
            },
            ferraris: {
                title: "Ferraris",
                description: "Ferraris basemap",
                tooltip: "Selecteer Ferraris"
            },
            popp: {
                title: "Popp",
                description: "Popp basemap",
                tooltip: "Selecteer Popp"
            },
            nobasemap: {
                title: "Geen",
                description: "Geen Achtergrond",
                tooltip: "Geen Achtergrond"
            }
        },
        rvv: {

            tool: {
                tooltip: "Bevraag het eventuele voorkooprecht op een perceel (vanaf 1 : 15 000)",
                ppr: "Info"
            },

            dataView: {
                initialText: "Sinds 1 oktober 2012 is het Harmoniseringsdecreet in werking en moeten aanbiedingen en uitoefeningen via het e-voorkooploket van de VLM verlopen.<Br/><u>Belangrijk:</u> De rangschikking van de begunstigden die een identieke volgorde hebben in onderstaande lijst is willekeurig en doet geen uitspraak over de volgorde van uitoefenen.",
                addressTextPPR: "Recht van voorkoop van toepassing op {date} op het perceel {parcelnumber}.<Br/>Dichtstbijzijnde adres: {address}.",
                addressTextNoPPR: "<b>Geen recht van voorkoop van toepassing</b> op {date} op het perceel {parcelnumber}.<Br/>Dichtstbijzijnde adres: {address}."
            },

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
                            title: "RVV-afbakeningen (> 1 : 14 999)",
                            description: "Recht van voorkoop vastgesteld"
                        },
                        grootschalig: {
                            title: "RVV-afbakeningen (\u2264 1 : 15 000)",
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
            },

            resultcenter: {
                fields: {
                    type: "Soorttype",
                    beneficiary: "Begunstigde",
                    parcelID: "Perceel-ID",
                    startDate: "begindatum",
                    endDate: "einddatum",
                    order: "Volgorde begunstigde",
                    id: "id"
                }
            }

        },

        splashscreen: {
            loadTitle: "De kaart wordt geladen.",
            loadBundle: "{percent}%"
        },

        search: {
            ui: {
                placeHolder: "Adres, perceelnummer, co\u00F6rdinaat",
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
                    "<p>De informatie kan uitsluitend gebruikt worden binnen het kader van het Harmoniseringsdecreet Rechten van Voorkoop, in het bijzonder de bekendmaking van het Geografisch themabestand ‘Vlaamse voorkooprechten’.</p>" +
                    "<p>U kan alleen kennis nemen van de medegedeelde informatie.</p>" +
                    "<p>Noch het AGIV, noch de bronhouders van de informatie, kan(kunnen) aansprakelijk gesteld worden voor onjuistheden of onvolledigheden in de verstrekte informatie, het gebruik en de werking van dit geoloket of de gevolgen daarvan.</p>"
            }
        }

    })
);