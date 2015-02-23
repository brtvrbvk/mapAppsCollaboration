define({
    root: ({
        bundleName: "Service Management",
        bundleDescription: "Service management",
        commonDelete: {
            saveQuery: "Do you really want to delete '{number}' item(s)?",
            error: "Deletion of items '{items}' failed!",
            partialSuccess: "Some items could not be deleted!",
            errorFinish: "No item could be deleted!",
            success: "Items successfully deleted!",
            errorRetrievingServices: "Unable to retrieve services. Try again in a few moment."
        },
        importIdentifyMappingsTool: {
            title: "Import all",
            desc: "Import a previously exported identify mapping file"
        },
        importAllServicesTool: {
            title: "Import all",
            desc: "Import a previously exported config file"
        },
        exportAllIdentifyMappings: {
            title: "Export all identify configs",
            desc: "Export all identify mappings between services and identify configurations"
        },
        exportAllServicesTool: {
            title: "Export all",
            desc: "Export all Service configs"
        },
        exportSelectedServicesTool: {
            title: "Export",
            desc: "Export Service configs"
        },
        serviceTool: {
            title: "Service Configuration Management",
            desc: "List of service configurations"
        },
        editServiceTool: {
            title: "Edit",
            desc: "Edit Service config"
        },
        removeSelectedServicesTool: {
            title: "Delete",
            desc: "Delete Service config"
        },
        createServiceTool: {
            title: "Create",
            desc: "Create Service config"
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
        serviceView: {
            noDataMessage: "No templates available.",
            title: "Title",
            desc: "Description",
            filename: "File",
            modifiedBy: "Modified By",
            modifiedAt: "Modified At"
        },
        serviceConfigsImportView: {
            windowTitle: "Import service configuration from exported file",
            createWindowTitle: "New Service",
            title: "Title:",
            description: "Description:",
            createdAt: "Created At:",
            createdBy: "Created By:",
            modifiedAt: "Modified At:",
            modifiedBy: "Modified By:",
            id: "ID:",
            fileName: "File:",
            upload: "Upload",
            uploaded: "100% - Optimize Service",

            updateError: "Update of Service '{id}' failed! {error}",
            updateSuccess: "Service configuration '{id}' succesfull saved!",

            uploadStart: "Import Started",
            uploadError: "Import Error: ",
            uploadFinished: "Import Finished",

            panelDefaultTitle: "<strong>Common Information</strong>",
            panelFileTitle: "<strong>You can upload a previously exported service configuration file to import services</strong>"
        },
        servicesDetailsView: {
            windowTitle: "Service configuration '{title}'",
            createWindowTitle: "New Service",
            title: "Title:",
            description: "Description:",
            createdAt: "Created At:",
            createdBy: "Created By:",
            modifiedAt: "Modified At:",
            modifiedBy: "Modified By:",
            id: "ID:",
            fileName: "File:",
            upload: "Upload",
            uploaded: "100% - Optimize Service",

            updateError: "Update of Service '{id}' failed! {error}",
            updateSuccess: "Service configuration '{id}' succesfull saved!",

            uploadStart: "Upload Started",
            uploadError: "Upload Error: ",
            uploadFinished: "Upload Finished",

            createServiceInfo: "Enter a name of your new service configuration. After the new service configuration was created successfully, you can upload data to it.",
            panelDefaultTitle: "<strong>Common Information</strong>",
            panelFileTitle: "<strong>You can upload a service file to import services</strong>",
            editLabel: "<strong>or start editing a blank configuration</strong>",
            editServiceConfiguration: "Edit"
        },
        appsTool: {
            title: "Apps",
            desc: "List of Apps"
        },
        removeSelectedAppsTool: {
            title: "Delete",
            desc: "Delete App(s)"
        },
        createAppTool: {
            title: "Create new App",
            desc: "Create App"
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
            optionstooltip: "<p>Here you can enter special options for service construction, structured like: <pre>{\n  \"optionName\": \"optionValue\",\n  ...\n}</pre></p><p>For example, opacity of a service can be configured as follows: <pre>{\n  \"opacity\": 0.5\n}</pre></p><p>Or configure a REST service for a WMS for themainfos: <pre>{\n  \"REST\":{\n  \"url\": \"http://geo.agiv.be/ArcGIS/rest/services/RVV/MapServer\"\n \"titleAttribute\":\"NAAM\"\n}\n}</pre></p>",
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
    }),
    "de": true
})