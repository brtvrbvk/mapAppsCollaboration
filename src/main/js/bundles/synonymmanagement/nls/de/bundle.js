define({
    bundleName: "Synonym Management",
    bundleDescription: "Bietet Oberfl\u00E4chen zur App-Verwaltung",
    synonymTool: {
        title: "Synonym Management",
        desc: "List of synonym configurations"
    },
    dataViewCommon: {
        filter: {
            menuDefaultLabel: "All",
            textBoxPlaceHolder: ""
        },
        pager: {
            backButtonTooltip: "Previous page",
            forwardButtonTooltip: "Next page",
            firstButtonTooltip: "First page",
            lastButtonTooltip: "Last page",
            pageLabeltext: "Page:",
            pageSizeLabelText: "Items ${pageStartItemNumber}-${pageEndItemNumber} of ${itemCount}:"
        }
    },
    synonymView: {
        noDataMessage: "No templates available.",
        title: "Title",
        synonyms: "Synonyms"
    },
    synonymConfigsDetailsView: {
        createSynonymConfigInfo: "Create a new synonym configuration",
        panelDefaultTitle: "<strong>Synonym configuration</strong>",
        windowTitle: "Synonym configuration '{title}'",
        title: "Title:",
        synonyms: "Synonyms:",
        createWindowTitle: "New synonym configuration",
        updateError: "Update of synonym configuration '{title}' failed! {error}",
        updateSuccess: "Synonym configuration '{title}' saved successfully!"
    },
    commonDelete: {
        saveQuery: "Do you really want to delete '{number}' item(s)?",
        error: "Deletion of items '{items}' failed!",
        partialSuccess: "Some items could not be deleted!",
        errorFinish: "No item could be deleted!",
        success: "Items deleted successfully!"
    },
    exportAllSynonymsTool: {
        title: "Export all",
        desc: "Export synonym configs"
    },
    importAllSynonymsTool: {
        title: "Import from configuration file",
        desc: "Import from previously exported configuration file"
    },
    createSynonymTool: {
        title: "Create new synonym configuration",
        desc: "Create new synonym configuration"
    },
    removeSelectedSynonymsTool: {
        title: "Remove selected synonym configurations",
        desc: "Remove selected synonym configurations"
    },
    importAllSynonymsTool: {
        title: "Import from configuration file",
        desc: "Import from previously exported configuration file"
    },
    synonymConfigsImportView: {
        windowTitle: "Synonym import",
        fileName: "File:",
        upload: "Upload",
        uploaded: "100% - Optimize Service",
        updateError: "Update of synonym configuration '{id}' failed! {error}",
        updateSuccess: "Synonym configuration '{id}' saved successfully!",
        uploadStart: "Import Started",
        uploadError: "Import Error: ",
        uploadFinished: "Import Finished",
        panelDefaultTitle: "<strong>Common Information</strong>",
        panelFileTitle: "<strong>You can upload a synonym config file to import</strong>"
    }
});