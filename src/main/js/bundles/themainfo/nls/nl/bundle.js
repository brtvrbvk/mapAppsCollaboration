define(
    ({
        bundleName: "Themainfo",
        bundleDescription: "Themainfo",
        ui: {
            docktool: {
                title: "Info",
                tooltip: "Info"
            },
            thema: {tooltip: "Toon/verberg kaarten"},
            layermanager: {tooltip: "Toon/verberg mijn selecties"},
            description: {
                title: "Toelichting",
                content: "Via deze kaarttoepassing kan je nagaan of er een Vlaams voorkooprecht van toepassing is op een bepaald perceel in Vlaanderen.<br/>Je raadpleegt het  <b>Geografisch themabestand 'Vlaamse voorkooprechten'</b> (Harmoniseringsdecreet Rechten van Voorkoop - 25/05/2007). Enkel de Vlaamse voorkooprechten die in dit themabestand zijn opgenomen, kunnen ook effectief uitgeoefend worden door de begunstigden ervan.<br/><br/>Klik <a target=\"_blank\" href=\"http://www.agiv.be/producten/rvv\">hier</a> voor meer informatie over recht van voorkoop (RVV)."
            },
            kiesThemas: "In de buurt",
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
                notVisible: "Niet zichtbaar voor dit zoomniveau",
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
                visibleMinScale: "Zoom in om deze kaart zichtbaar te maken",
                visibleMaxScale: "Zoom uit om deze kaart zichtbaar te maken"
            },
            nodescription: "No description available",
            scale: "Van schaal ${maxScale} tot ${minScale}",
            linkToMetadata: "Meer info",
            loadingMetadata: "Bezig met laden",
            noMetadata: "Geen extra informatie beschikbaar",
            searchTypes: {
                CONTENTMODEL: "kaarten"
            },
            tree: {
                categorytooltip: "Toon lagen onder het thema ${category}",
                layertooltip: "${description}",
                mainCategory: "In de buurt"
            },
            nearbyPlaces: {
                radiusText: "Binnen een straal van ",
                around: " rond "
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
        }
    })
);