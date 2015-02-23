define({
    bundleName: "App Management",
    bundleDescription: "Bietet Oberfl\u00E4chen zur App-Verwaltung",
    commonDelete: {
        saveQuery: "Wollen Sie wirklich '{number}' Element(e) l\u00F6schen?",
        error: "Das L\u00F6schen der Elemente '{items}' ist fehlgeschlagen!",
        partialSuccess: "Einige Elemente konnten nicht gel\u00F6scht werden!",
        errorFinish: "Kein Element konnte gel\u00F6scht werden!",
        success: "Der L\u00F6schvorgang wurde erfolgreich beendet!"
    },
    templatesTool: {
        title: "App-Vorlagen",
        desc: "Liste von App-Vorlagen"
    },
    removeSelectedTemplatesTool: {
        title: "L\u00F6schen",
        desc: "L\u00F6sche App-Vorlagen"
    },
    createTemplateTool: {
        title: "Neue Vorlage",
        desc: "Erzeuge App-Vorlage"
    },
    dataViewCommon: {
        filter: {
            textBoxPlaceHolder: "",
            menuDefaultLabel: "Alle"
        },
        pager: {
            backButtonTooltip: "Vorherige Seite",
            forwardButtonTooltip: "N\u00E4chste Seite",
            firstButtonTooltip: "Erste Seite",
            lastButtonTooltip: "Letzte Seite",
            /**
             * the page lable literal (template)
             */
            pageLabelText: "Seite:",
            /**
             * the page size label literal (template)
             */
            pageSizeLabelText: "Treffer ${pageStartItemNumber}-${pageEndItemNumber} von ${itemCount}:"
        }
    },
    templatesView: {
        title: "Titel",
        desc: "Beschreibung",
        filename: "Datei",
        modifiedBy: "Ge\u00E4ndert durch",
        modifiedAt: "Ge\u00E4ndert am",
        noDataMessage: "Es sind keine App-Vorlagen vorhanden."
    },
    templatesDetailsView: {
        windowTitle: "Vorlage '{title}'",
        createWindowTitle: "Neue Vorlage",
        title: "Titel:",
        description: "Beschreibung:",
        createdAt: "Erstellt am:",
        createdBy: "Erstellt durch:",
        modifiedBy: "Ge\u00E4ndert durch",
        modifiedAt: "Ge\u00E4ndert am",
        id: "ID:",
        fileName: "Datei:",
        upload: "Hochladen",
        uploaded: "100% - Vorlage wird optimiert",

        updateError: "Vorlage '{id}' konnte nicht gespeichert werden! {error}",
        updateSuccess: "Vorlage '{id}' erfolgreich gespeichert!",

        uploadStart: "Hochladen gestarted!",
        uploadError: "Hochladen Fehler: ",
        uploadFinished: "Hochladen beendet!",

        createTemplateInfo: "Bitte geben Sie den Titel Ihrer neuen Vorlage an. Nach erfolgreichem Anlegen der Vorlage k\u00F6nnen Sie Daten hinzuf\u00FCgen.",
        panelDefaultTitle: "<b>Allgemeine Informationen</b>",
        panelFileTitle: "<b>Vorlagen Datei</b>"
    },
    appsTool: {
        title: "Apps",
        desc: "Liste von Apps"
    },
    removeSelectedAppsTool: {
        title: "L\u00F6schen",
        desc: "App(s) l\u00F6schen"
    },
    createAppTool: {
        title: "Neue App erstellen",
        desc: "App erstellen"
    },
    appsView: {
        noDataMessage: "Es sind keine Apps vorhanden.",
        id: "App-ID",
        title: "Titel",
        desc: "Beschreibung",
        filename: "Datei",
        modifiedBy: "Ge\u00E4ndert durch",
        modifiedAt: "Ge\u00E4ndert am",
        editorState: "Status"
    },
    appDetailsView: {
        windowTitle: "App '{title}'",
        createWindowTitle: "Neue App erstellen",
        title: "Titel:",
        description: "Beschreibung:",
        createdAt: "Erstellt am:",
        createdBy: "Erstellt durch:",
        modifiedBy: "Ge\u00E4ndert durch",
        modifiedAt: "Ge\u00E4ndert am",
        id: "App-ID:",
        templateId: "Vorlage:",
        fileName: "Datei:",
        editorState: "Status:",
        editorStateValues: {
            DRAFT: "Entwurf",
            EDITED: "Bearbeitet",
            VERIFIED: "Verifiziert",
            PUBLISHED: "Freigegeben",
            DEPRECATED: "Archiviert"
        },
        enabled: "Online:",

        updateError: "App '{id}' konnte nicht gespeichert werden! {error}",
        updateSuccess: "App '{id}' erfolgreich gespeichert!",
        updateStarted: "Speichern von App '{id}' gestartet...",
        invalidJSONError: "Das JSON ist invalide: {error}",
        editJsonInfo: "In diesem Fenster k\u00F6nnen Sie die App-Konfiguration(app.json) manuell editieren.<br/><b>WARNUNG:</b> Sie k\u00F6nnen hier \u00C4nderungen vornehmen, die einen Start der App verhindern k\u00F6nnen!",

        createAppInfo: {
            id: "Bitte geben Sie eine ID (ohne Leerzeichen) f\u00FCr Ihre neue App ein. Diese ID muss eindeutig sein. Sie wird in der URL verwendet, mit der Ihre App aufgerufen wird.",
            template: "Bitte w\u00E4hlen Sie eine App-Vorlage. Alle initialen Konfigurationseinstellungen werden aus dieser Vorlage gelesen.",
            title: "Bitte geben Sie einen Titel und eine Beschreibung f\u00FCr ihre App ein."
        },

        panelDefaultTitle: "<b>Allgemeine Informationen</b>",
        panelEditorTitle: "<b>Bearbeitungsstatus</b>",
        panelTemplateTitle: "<b>Vorlagen Informationen</b>",
        panelConfigureTitle: "<b>Konfiguration</b>",
        configurePreviewBtn: "In-App Konfiguration",
        configureTextBtn: "Text-Konfiguration",
        configureExportBtn: "Exportieren"
    }
});