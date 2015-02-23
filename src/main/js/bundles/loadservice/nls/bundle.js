define({ root: /*
 * COPYRIGHT 2010-2011 con terra GmbH Germany
 */
    ({
        bundleName: "SDI Load Service",
        bundleDescription: "A component to load services dynamically",

        ui: {
            dataView: {
                filter: {
                    menuDefaultLabel: "Alle",
                    textBoxPlaceHolder: ""
                },
                pager: {
                    backButtonText: "<",
                    forwardButtonText: ">",
                    firstButtonText: "<<",
                    lastButtonText: ">>",
                    zeroResultsText: "Geen data beschikbaar.",
                    backButtonTooltip: "Vorige pagina",
                    forwardButtonTooltip: "Volgende pagina",
                    firstButtonTooltip: "Eerste pagina",
                    lastButtonTooltip: "Laatste pagina",
                    pageLabeltext: "Pagina:",
                    pageSizeLabelText: "Lagen ${pageStartItemNumber} tot ${pageEndItemNumber} van ${itemCount}"
                },
                DGRID: {
                    noDataMessage: "Geen data beschikbaar.",
                    loadingMessage: "Loading Data...",
                    error: "Unexpected error: "
                }
            },
            fields: {
                id: "ID",
                title: "Titel",
                name: "Titel",
                adapter: "Service",
                type: "Type",
                scaleMin: "Min schaal",
                scaleMax: "Max schaal",
                check: "Selecteer",
                layer: "Laag",
                north: "Noorden",
                east: "Oosten",
                south: "Zuiden",
                west: "Westen"
            },
            window: {title: "Laad nieuwe lagen"},
            tool: {
                title: "Eigen kaart toevoegen",
                tooltip: "Voeg eigen data toe via een WMS of als KML"
            },
            buttons: {
                search: "Laad",
                load: "Toon op kaart",
                back: "Terug",
                clear: "Wis"
            },
            dataLink: "Vereisten voor het laden en correct weergeven van je data.",
            favs: "Favorieten ",
            results: "Resultaten",
            mapModel: {addedServiceCategoryTitle: "Mijn Services"},
            help: "Help",
            stepOne: "Geef de URL van de Service in en druk op \x27Laad\x27",
            stepTwo: "Selecteer \xe9\xe9n of meerdere lagen, klik dan op \x27Toon op kaart\x27",
            errors: {
                title: "Fout",
                401: "Dit is een beveiligde service, gelieve in te loggen op uw account.",
                400: "De ingevoerde URL is geen geldige service.",
                404: "De service is niet bereikbaar.",
                118: "De service reageert niet.",
                serviceNotLoaded: "De service kan niet geladen worden.",
                "NOT  SUPPORTED": "Deze URL wordt niet ondersteund. Gelieve een URL van een \x27WMS\x27 of \x27INSPIRE viewservice\x27 in te voeren.",
                noSupportedLayers: "De service bevat geen lagen die getoond kunnen worden."
            },
            success: {serviceLoaded: "Service succesvol geladen."},
            loadingService: "Service wordt geladen.",
            loadingLayer: "Laag wordt geladen.",
            textBoxPlaceholder: "URL van de service"
        },
        store: {
            title: "Laag toevoegen",
            desc: " Krijgt service-informatie van een URL",
            placeHolder: "Typ de WMS of INSPIRE URL hier"
        }
    }),
    "nl": true
});