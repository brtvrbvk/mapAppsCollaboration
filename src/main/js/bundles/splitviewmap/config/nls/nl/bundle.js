define(
    ({
        bundleName: "Splitviewmap config",
        bundleDescription: "Splitviewmap config",
        menu: {
            content: {
                title: "Splitviewmap content"
            }
        },
        mapModelBuilderWidget: {
            description: "In this window the map model of this app can be defined with operational and base layers. All available services are listed on the left. They can be dragged and dropped to the different layers in middle.",
            hint: "New services can be added in the menu 'Services Management'.",
            categoryDescription: "Description:",
            categoryDescriptionTooltip: "Description of the service",
            categoryTitle: "Title:",
            categoryTitleTooltip: "Title of the service",
            imageUrl: "URL for Map Flow cover image:",
            imageUrlTooltip: "URL of Map Flow cover image (Size: 267x159 px, Formats: jpg, png, gif)",
            defaultEnabled: "Category enabled on startup:",
            defaultEnabledTooltip: "Check to set service to be enabled on startup of the app.",
            detailsPaneTitle: "Change settings of service <b>'{category.title}'</b>",
            detailsPaneService: "Based on service <b>'{service}'</b>",
            mapFlowPaneTitle: "<br /><b>Map Flow Settings</b><br />If you are using the Map Flow, you can define properties (description and image) in the section below.",
            detailsHint: "Select node to set details...",
            servicesHint: "Drag services here...",
            servicesTitle: "Services",
            detailsTitle: "Details",
            operationalLayer: "Operational Layer",
            baseLayer: "Base Layer",
            chooseLayers: "Choose which layers should be included in the service and if they should be visible initially.",
            layerHead: "<b>Layer</b>",
            layerVisibleHead: "<b>Visible initially</b>",
            layerVisibleTooltip: "Check to set initial visible state of layer <b>'{title}'</b>.",
            layerIncludeHead: "<b>Include</b>",
            layerIncludeTooltip: "Check to include layer <b>'{title}'</b>."
        }
    })
);