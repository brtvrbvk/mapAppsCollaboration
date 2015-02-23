define({
    root: ({
        bundleName: "Idnetify Management",
        bundleDescription: "Idnetify management",
        commonDelete: {
            saveQuery: "Do you really want to delete '{number}' item(s)?",
            error: "Deletion of items '{items}' failed!",
            partialSuccess: "Some items could not be deleted!",
            errorFinish: "No item could be deleted!",
            success: "Items successfully deleted!"
        },
        exportAllIdentifyConfigTool: {
            title: "Export all",
            desc: "Export Identify configs"
        },
        importAllIdentifyConfigTool: {
            title: "Import from configuration file",
            desc: "Import from previously exported configuration file"
        },
        importOldIdentifyConfigTool: {
            title: "Import from old configuration file",
            desc: "Import from old configuration file"
        },
        identifyTool: {
            title: "Identify Configuration Management",
            desc: "List of identify configurations"
        },
        createIdentifyTool: {
            title: "Create new identify configuration",
            desc: "Create new identify configuration"
        },
        removeSelectedIdentifyConfigTool: {
            title: "Remove selected identify configurations",
            desc: "Remove selected identify configurations"
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
                /**
                 * the page lable literal (template)
                 */
                //pageLabelText: "Page ${currentPage} of ${endPage}",
                pageLabeltext: "Page:",
                /**
                 * the page size label literal (template)
                 */
                pageSizeLabelText: "Items ${pageStartItemNumber}-${pageEndItemNumber} of ${itemCount}:"
            }
        },
        identifyView: {
            noDataMessage: "No templates available.",
            title: "Title",
            desc: "Description",
            filename: "File",
            modifiedBy: "Modified By",
            modifiedAt: "Modified At",
            generalMapping: "General mapping"
        },
        identifyConfigsImportView: {
            windowTitle: "Identify import",
            fileName: "File:",
            upload: "Upload",
            uploaded: "100% - Optimize Service",

            updateError: "Update of identify configuration '{id}' failed! {error}",
            updateSuccess: "Identify configuration '{id}' succesfull saved!",

            uploadStart: "Import Started",
            uploadError: "Import Error: ",
            uploadFinished: "Import Finished",

            panelDefaultTitle: "<strong>Common Information</strong>",
            panelFileTitle: "<strong>You can upload an identify config file to import</strong>"
        },
        identifyConfigsImportFromOldView: {
            windowTitle: "Identify import from old configuration",
            fileName: "File:",
            upload: "Upload",
            uploaded: "100% - Optimize Service",

            updateError: "Update of identify configuration '{id}' failed! {error}",
            updateSuccess: "Identify configuration '{id}' succesfull saved!",

            uploadStart: "Import Started",
            uploadError: "Import Error: ",
            uploadFinished: "Import Finished",

            panelDefaultTitle: "<strong>Common Information</strong>",
            panelFileTitle: "<strong>You can upload an old identify configuration file to import</strong>"
        },
        identifyConfigsDetailsView: {
            createIdentifyConfigInfo: "Create a new identify mapping",
            windowTitle: "Identify configuration '{title}'",
            createWindowTitle: "New identify configuration",
            title: "Title:",
            description: "Description:",
            generalMapping: "General mapping:",
            createdAt: "Created At:",
            createdBy: "Created By:",
            modifiedAt: "Modified At:",
            modifiedBy: "Modified By:",
            id: "ID:",
            fileName: "File:",
            upload: "Upload",
            uploaded: "100% - Optimize Service",

            updateError: "Update of identify configuration '{id}' failed! {error}",
            updateSuccess: "Identify configuration '{id}' succesfull saved!",

            uploadStart: "Upload Started",
            uploadError: "Upload Error: ",
            uploadFinished: "Upload Finished",

            createServiceInfo: "Enter a name of your new service configuration. After the new service configuration was created successfully, you can upload data to it.",
            panelDefaultTitle: "<strong>Common Information</strong>",
            panelFileTitle: "<strong>You can upload a service file to import services</strong>",
            editLabel: "<strong>or start editing a blank configuration</strong>",
            editIdentifyConfiguration: "Edit"
        },
        identifyMappingWidget: {
            createWindowTitle: "New identify configuration",
            updateFinished: "Identifymapping successfully saved",
            updateError: "Update of identify configuration '{id}' failed! {error}",
            details: "Details",
            extraInfo: "Extra info",
            ignoreList: "Ignore list",
            mappingWidget: {
                servicesTitle: "Services",
                details: "Details",
                generalMapping: "General Mapping",
                ignoreList: "Ignore List",
                attrNamePlaceholder: "Attribute field name...",
                dispNamePlaceholder: "Field name to display...",
                attrValuePlaceholder: "Attribute field value...",
                dispValuePlaceholder: "Field value to display...",
                serviceIdPlaceholder: "Service ID...",
                layerIdPlaceholder: "Layer ID...",
                hideFieldWhenBlank: "Hide when blank"
            }
        },
        appsView: {
            noDataMessage: "No apps available.",
            id: "App-ID",
            title: "Title",
            desc: "Description",
            filename: "File",
            modifiedBy: "Modified By",
            modifiedAt: "Modified At",
            editorState: "State"
        },
        serviceDetails: {
            windowTitle: "Service '{id}'",
            newServiceId: "New",
            url: "URL:",
            urltooltip: "Please enter the exact service endpoint url here! e.g. http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
            title: "Title:",
            titletooltip: "Please enter a title for the service",
            description: "Description:",
            descriptiontooltip: "Please enter a description for the service",
            type: "Type:",
            typetooltip: "Please choose the valid service type",
            layer: "Layer:",
            layertooltip: "Here you can enter the layer metadata of the service, structured like: <pre>[{\n  \"id\": \"0\",\n  \"title\": \"My Layer\"\n},...]</pre>",
            options: "Options:",
            optionstooltip: "<p>Here you can enter special options for service construction, structured like: <pre>{\n  \"optionName\": \"optionValue\",\n  ...\n}</pre></p><p>For example, opacity of a service can be configured as follows: <pre>{\n  \"opacity\": 0.5\n}</pre></p>",
            fetchMetadata: "Fetch Metadata",
            fetchMetadatatooltip: "Click this to fetch the configuration metadata from the url. Please note that all entered metadata will be overwritten with the data provided by the service!",
            fetchMetadataDesc: "This will work for service types 'AGS_DYNAMIC', 'AGS_FEATURE' and 'AGS_TILED'. Nevertheless, other service types can be added manually with this form.",
            fetchError: "Connection to Service '{url}' failed! {error}",
            updateError: "Update of Service '{id}' failed! {error}",
            updateSuccess: "Service configuration '{id}' succesfull saved!"
        },
        mrrBuilderWidget: {
            createNewTitle: "Create new node",
            removeServiceTool: "Remove service",
            addServiceTool: "Add new service",
            dataView: {
                pager: {},
                filter: {
                    menuDefaultLabel: "[All]",
                    textBoxPlaceHolder: ""
                },
                noDataFound: "No services available..."
            },
            categories: {
                id: "Name",
                title: "Title",
                serviceUrl: "URL",
                serviceType: "Type"
            }
        }
    })
})