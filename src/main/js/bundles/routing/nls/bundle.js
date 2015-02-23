define({ root: ({
    bundleName: "routing",
    bundleDescription: "routing",
    stores: {
        noValue: "Geen waarde",
        agivSearchStore: {
            name: "AGIV Geolocator",
            description: "AGIV Geolocator",
            placeHolder: "Tik hier de gezochte locatie (adres / perceel) in ...",
            switchStoreCommand: "Zoek buiten Vlaanderen en Brussel"
        },
        navteqStore: {
            switchStoreCommand: "Zoek in Vlaanderen en Brussel"
        },
        agivParcelByIDSearchStore: {
            name: "AGIV Zoek naar perceel",
            description: "AGIV Zoek naar perceel",
            placeHolder: "Tik hier het gezochte perceel in..."
        }
    },
    ui: {
        tool: {
            title: "Route",
            tooltip: "Toon routenplanner"
        },
        elevation: "Elevation",
        calculate: "Calculate route",
        clearTargetFields: "Verwijder routing",
        printRoutingResult: "Printen",
        routeTo: "Route to ",
        instructionTitle: "Instruction",
        types: {
            fastest: "fastest",
            shortest: "shortest",
            economic: "economic"
        },
        textboxPlaceholder: "Geef de gewenste locatie",
        distance: "Afstand: ${distance} km",
        duration: "Duur: ${hour} h ${min} min",
        transportation: "${mode}, ${type} route",
        sendMail: "EMail",
        mailBody: "${url}",
        mailSubject: "Check out this map!",
        transport: {
            car: "car",
            pedestrian: "pedestrian"
        },
        addTarget: "+",
        deleteTarget: "X",
        switchTargets: "Switch",
        exceedMaxTarget: "Not possible to enter more than 10 locations",
        contextMenu: {
            start: "Rounting start point",
            end: "Rounting end point",
            newPoint: "bestemming toevoegen"
        },
        routing: "Routebeschrijving",
        from: "vanaf dit punt",
        to: "naar dit punt",
        tooltip: {
            deleteButton: "Verwijder locatie",
            marker: "Sleep naar het gewenste punt op de kaart",
            clearRoute: "Verwijder route",
            addTarget: "Voeg een nieuwe locatie toe",
            print: "Print Route",
            switchTargets: "Wijzig volgorde van bestemmingen",
            errorMessage: "Locatie niet gevonden. Controleer spelling en probeer opnieuw. <br>Gebruik straatnamen, gemeenten of postnummers."
        },
        printTip: "Printen",
        endTip: "Terug naar het laatste kaartbeeld",
        featureinfointegration: {
            title: "Route",
            descriptionLabel: "Route van ${start} naar ${destination}",
            duration: "Duur: ${hour} h ${min} min",
            distance: "Afstand: ${distance} km"
        }
    },
    tool: {
        menuToolTitle: "menuTool",
        menuToolTooltip: "menuTool"
    }
}),
    "nl": true
});