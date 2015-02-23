define(
    ({
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
            elevation: "Hoogteprofiel",
            calculate: "Calculeren",
            clearTargetFields: "Verwijder routing",
            printRoutingResult: "Printen",
            routeTo: "Route naar ",
            instructionTitle: "Instruction",
            types: {
                fastest: "snelste",
                shortest: "kortste",
                economic: "economisch"
            },
            textboxPlaceholder: "Geef de gewenste locatie",
            distance: "Afstand: ${distance} km",
            duration: "Duur: ${hour} h ${min} min",
            transportation: "${mode}, ${type} route",
            sendMail: "Deel via E-mail",
            mailBody: "${url}",
            mailSubject: "Check out this map!",
            transport: {
                car: "auto",
                pedestrian: "voetganger"
            },
            addTarget: "Bestemming toevoegen",
            deleteTarget: "X",
            switchTargets: "Switch",
            exceedMaxTarget: "Niet mogelijk om meer dan 10 beestemmingen in te geven",
            contextMenu: {
                start: "vanaf dit punt",
                end: "naar dit punt",
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
            menuToolTitle: "Routing contextmenu tool",
            menuToolTooltip: "Routing contextmenu tool"
        }
    })
);