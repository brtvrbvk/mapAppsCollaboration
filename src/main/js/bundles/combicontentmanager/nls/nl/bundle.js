define(
    ({
        bundleName: "combicontentmanager",
        bundleDescription: "Die Lupe zeigt einen bestimmten Bereich der Karte in einem gr\u00F6\u00DFeren Ma\u00DFstab innerhalb eines extra Fensters. Dadurch kann dieser Bereich n\u00E4her untersucht werden ohne die aktuelle Kartenansicht zu verlassen.",
        ui: {
            docktool: {
                title: "Kaarten",
                tooltip: "Kies interessante plaatsen en kaarten"
            },
            thema: {tooltip: "Toon/verberg kaarten"},
            layermanager: {tooltip: "Toon/verberg mijn selecties"},
            description: {
                title: "Toelichting",
                content: "Via deze kaarttoepassing kan je nagaan of er een Vlaams voorkooprecht van toepassing is op een bepaald perceel in Vlaanderen.<br/>Je raadpleegt het  <b>Geografisch themabestand 'Vlaamse voorkooprechten'</b> (Harmoniseringsdecreet Rechten van Voorkoop - 25/05/2007). Enkel de Vlaamse voorkooprechten die in dit themabestand zijn opgenomen, kunnen ook effectief uitgeoefend worden door de begunstigden ervan.<br/><br/>Klik <a target=\"_blank\" href=\"http://www.agiv.be/producten/rvv\">hier</a> voor meer informatie over recht van voorkoop (RVV)."
            },
            kiesThemas: "Kaarten en plaatsen",
            mijnSelecties: "Mijn selecties",
            graphicLayerTitle: "Mijn plaatsen",
            operationalLayerTitle: "Mijn kaarten",
            graphicLayerManager: {
                allLayersLabel: "Alle lagen",
                backgroundLabel: "achtergrond",
                overlayLabel: "mijn datalagen",
                layersLabel: "Lagen",
                notVisible: "laag niet zichtbaar op kaart",
                shownPOIsLabel: "Shown",
                totalPOIsLabel: "Total",
                removeLayer: "Verwijder plaats",
                switchLayerVisible: "Toon plaats",
                switchLayerInvisible: "Verberg plaats",
                switchAllLayersInvisible: "alle lagen onzichtbaar",
                switchAllLayersVisible: "alle lagen zichtbaar",
                removeAllLayers: "Verwijder al mijn plaatsen",
                infoLayer: "Meer info",
                poiList: "Toon lijst van de kaart getoonde plaatsen over ${poitype}",
                transparency: "Wijzig transparantie",
                poiListItem: {
                    poiWindowTitle: "Info",
                    id: "ID",
                    primarylabel: "Naam",
                    vialink: "Meer Info"
                },
                visibleScale: "Pas zichtbaar bij schaal ${scale}"
            },
            operationalLayerManager: {
                allLayersLabel: "Alle lagen",
                backgroundLabel: "achtergrond",
                overlayLabel: "mijn datalagen",
                layersLabel: "Lagen",
                notVisible: "Niet zichtbaar voor dit zoomniveau.",
                shownPOIsLabel: "Shown",
                totalPOIsLabel: "Total",
                removeLayer: "Verwijder kaart",
                switchLayerVisible: "Toon kaart",
                switchLayerInvisible: "Verberg kaart",
                switchAllLayersInvisible: "alle lagen onzichtbaar",
                switchAllLayersVisible: "alle lagen zichtbaar",
                removeAllLayers: "Verwijder al mijn kaarten",
                infoLayer: "Meer info",
                transparency: "Wijzig transparantie",
                poiListItem: {
                    poiWindowTitle: "Info",
                    id: "ID",
                    primarylabel: "Naam",
                    vialink: "Meer Info"
                },
                visibleMinScale: "Zoom in om deze kaart zichtbaar te maken.",
                visibleMaxScale: "Zoom uit om deze kaart zichtbaar te maken."
            },
            nodescription: "No description available.",
            scale: "Van schaal ${maxScale} tot ${minScale}",
            linkToMetadata: "Meer info",
            loadingMetadata: "Bezig met laden",
            noMetadata: "Geen extra informatie beschikbaar.",
            searchTypes: {
                CONTENTMODEL: "kaarten"
            },
            tree: {
                categorytooltip: "Toon lagen onder het thema ${category}",
                layertooltip: "${description}",
                mainCategory: "Kaarten en plaatsen"
            },
            mapLeft: "Kaart links",
            mapRight: "Kaart rechts",
            switcher: {
                mapLeftTooltip: "Klik om kaarten toe te voegen aan het linkse venster",
                mapRightTooltip: "Klik om kaarten toe te voegen aan het rechtse venster",
                switchButtonTooltip: "Klik om kaarten toe te voegen aan het linkse of rechtse venster"
            },
            title: "Waarschuwing",
            errorMessage: "Kaart als parameter kan slechts éénmaal gebruikt worden.",
            notFoundMessage: "Kaart ${title} als parameter niet gevonden."
        },
        rvv: {
            map: {
                operational: {
                    agiv: {
                        title: "Geoloket RVV-themabestand",
                        description: "Agiv RVV Feature Service",
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
    })
);