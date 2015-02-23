define(
    ({
        bundleName: "GIPOD integration",
        bundleDescription: "GIPOD integration",
        ui: {
            docktool: {
                title: "Verfijnen",
                tooltip: "Verfijnd zoeken"
            },
            loadingFilters: "Loading filters",
            validation: {
                endBeforeStart: "Datum 'tot' dient groter te zijn dan datum 'vanaf'.",
                defineStart: "Datum 'vanaf' kan enkel vandaag zijn of een datum in de toekomst.",
                startTooSmall: "Datum 'vanaf' kan enkel vandaag zijn of een datum in de toekomst."
            },
            hover: {
                manifestation: "${count} keer andere hinder op de weg",
                workassignment: "${count} werken"
            },
            identificatie: {
                title: "Identificatie",
                info: "Volgende informatie is van toepassing op de ${type}:"
            },
            contact: {
                title: "Contact",
                info: "Voor verdere info betreft deze ${type} kan u contact opnemen met:"

            },
            diversions: {
                title: "Omleidingen",
                widget: "Omleiding",
                info: "Volgende informatie is van toepassing op de ${type}:"
            },
            identifyTitle: "Hinder in Kaart",
            workassignment: "werkopdrachten",
            manifestation: "manifestatie",
            scale: "Schaal: 1 : ${scale}",
            gipodIdNotFoundError: "Er zijn geen gegevens beschikbaar over deze hinder",
            messageWindowTitle: "Waarschuwing"
        }
    })
);