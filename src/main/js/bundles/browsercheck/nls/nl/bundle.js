define(
    ({
        bundleName: "Browser Check",
        bundleDescription: "Displays a note via the notifier if a user uses a too old browser for the application.",
        notifier: {
            title: "Waarschuwing",
            warning: "Er is een webbrowserversie gedetecteerd die niet ondersteund wordt: ${userAgent}!",
            zoomMessage: "Er is een browser schermgrootte (zoom-level) gedetecteerd die niet alle functionaliteiten ondersteunt. Open deze toepassing met browser schermgrootte ingesteld op 100 \u0025 in-/uitzoomen voor het beste resultaat."
        }
    })
);