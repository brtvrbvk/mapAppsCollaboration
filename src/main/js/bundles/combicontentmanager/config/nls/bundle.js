define({
    root: ({
        bundleName: "Map Configuration Wizard Bundle",
        bundleDescription: "The Map bundle manages the main map and all map content information. The client can abstract the services used in a hierarchical Map model so that they can be displayed in various ways to the user.",

        menu: {
            mapmodel: {
                title: "Map Content and categories"
            },
            search: {
                baseTitle: "Content search",
                description: "Configuration of the search in map contents",
                count: "Suggestion count"
            },
            combicontentmanager: {
                title: "Description panel",
                showDescription: "Show description panel",
                content: "Content",
                themePanel: "Theme panel",
                openPanelOnStartup: "Open theme panel on startup"
            }
        },
        commonDelete: {
            saveQuery: "Do you really want to delete '{number}' item(s)? Please note: The system can become inconsistent if you delete services referenced by other components! <b>Currently no consistent checks are performed!</b>",
            error: "Deletion of items '{items}' failed!",
            success: "Items successfully deleted!"
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
            fetchMetadataDesc: "This will work for service types 'AGS_DYNAMIC', 'AGS_TILED'. Nevertheless, other service types can be added manually with this form.",
            fetchError: "Connection to Service '{url}' failed! {error}",
            updateError: "Update of Service '{id}' failed! {error}",
            updateSuccess: "Service '{id}' succesfull saved!"
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
        },
        mapModelBuilderWidget: {
            description: "In this window the map model of this app can be defined with operational and base layers. All available services are listed on the left. They can be dragged and dropped to the different layers in middle.",
            hint: "New services can be added in the menu 'Services Management'.",
            categoryDescription: "Description:",
            categoryDescriptionTooltip: "Description of the service",
            keywordList: "Keywords:",
            keywordListTooltip: "List of synonyms as search keywords, separated by comma",
            categoryTitle: "Title:",
            categoryTitleTooltip: "Title of the service",
            categoryImgUrl: "Image URL:",
            categoryImgUrlTooltip: "Vorschaubild des Kartendienstes",
            minScaleTitle: "Min-Scale",
            minScaleTooltip: "Min-Scale",
            maxScaleTooltip: "Max-Scale",
            maxScaleTitle: "Max-Scale",
            identifyConfig: "Identify config:",
            identifyConfigTooltip: "Identify config",
            imageUrl: "URL for Map Flow cover image:",
            imageUrlTooltip: "URL of Map Flow cover image (Size: 267x159 px, Formats: jpg, png, gif)",
            defaultEnabled: "Category enabled on startup:",
            defaultEnabledTooltip: "Check to set service to be enabled on startup of the app.",
            detailsPaneTitle: "Change settings of service <b>'{title}'</b>",
            detailsPaneService: "Based on service <b>'{service}'</b>",
            isHeaderTitle: "Show as header",
            isHeaderTitleTooltip: "Display the category title as header",
            mapFlowPaneTitle: "<br /><b>Map Flow Settings</b><br />If you are using the Map Flow, you can define properties (description and image) in the section below.",
            detailsHint: "Select node to set details...",
            servicesHint: "Drag services here...",
            servicesTitle: "Services",
            detailsTitle: "Details",
            operationalLayer: "Operational Layer",
            categoriesTitle: "Categories",
            baseLayer: "Base Layer",
            chooseLayers: "Choose which layers should be included in the service and if they should be visible initially.",
            layerHead: "<b>Layer</b>",
            layerVisibleHead: "<b>Visible initially</b>",
            layerVisibleTooltip: "Check to set initial visible state of layer <b>'{title}'</b>.",
            layerIncludeHead: "<b>Include</b>",
            layerIncludeTooltip: "Check to include layer <b>'{title}'</b>.",
            newCategoryDefaultTitle: "New Category",
            capabilitiesError: "There was an error parsing the capabilities",
            fillinFromCapabilities: "Fill from Capabilities",
            metadataUrlDescription: "Metadata-URL",
            metadataUrlDescriptionTooltip: "Metadata-URL"
        },
        mapStateWidget: {
            description: "The map extent defines the visible area of a map. Please choose a method to set the initial map extent.",
            checkBoxApplyMainMapState: "Adjust map extent by panning the main map",
            setExtentManually: "Manually type in the values for the map extent",
            spatialReference: "Spatial Reference:",
            errorMessage: "Please check the coordinates!"
        },
        mapOptionsWidget: {
            description: "With the following settings different map options can be defined.",
            slider: {
                label: "Show zoom-slider",
                tooltip: "Display a zoom-slider on the map"
            },
            sliderStyle: {
                label: "Style of zoom-slider",
                tooltip: "Use small or default slider",
                type: {
                    small: "small",
                    "default": "default"
                }
            },
            nav: {
                label: "Show navigation arrows",
                tooltip: "Defines, if navigation arrows are displayed in the corner of the map."
            },
            logo: {
                label: "Show \"powered-by\" logo",
                tooltip: "Defines, if the \"powered-by\" logo is displayed on the map."
            },
            doubleClickZoom: {
                label: "Allow zooming on double click",
                tooltip: "Defines, if zooming is possible by a double click."
            },
            clickRecenter: {
                label: "Allow recentering on click",
                tooltip: "Defines, if recentering of the map is allowed."
            },
            keyboardNavigation: {
                label: "Allow keyboard navigation",
                tooltip: "Defines, if keyboard navigation is allowed."
            },
            scrollWheelZoom: {
                label: "Allow zoom by mousewheel",
                tooltip: "Defines, if zooming by mousewheel is allowed."
            },
            shiftDoubleClickZoom: {
                label: "Allow [Shift] + double click zoom",
                tooltip: "Defines, if zooming by pressing shift and doubleclicking is possible."
            }
        }
    }),
    "nl": true
});
