define({ root: ({
    bundleName: "Browser Check",
    bundleDescription: "Displays a note via the notifier if a user uses a too old browser for the application.",
    notifier: {
        title: "Warning",
        warning: "Not supported browser version detected: ${userAgent}!",
        zoomMessage: "Your browser uses a zoomed view. Some componenets might not work correctly under these circumstances."
    }
}),
    "nl": true
});