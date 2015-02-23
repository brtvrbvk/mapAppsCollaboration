define(
    ({
        bundleName: "GenericIdentify Config Bundle",
        bundleDescription: "Enable user to rename the attributes.",
        menu: {
            baseTitle: "Generic Identify",
            genericFeatureInfoTitle: "Generic FeatureInfo Attribute Mapping",
            staticFeatureInfoLayerManagerTitle: "Static FeatureInfo LayerManager",
            staticFeatureInfoTitle: "Static FeatureInfo Attribute Mapping",
            featureInfoContent: "Municipality info"
        },
        featureInfoContent: {
            url: "Link to PDF with placeholders for year and municipality",
            year: "Year to use"
        },
        staticFeatureInfoLayerManagerBuilderWidget: {
            categoryTitle: "Title:",
            layerList: "Layer list",
            servicesTitle: "Services",
            dragLayerHint: "Drag layer here..."
        },
        mapModelStoreBuilderWidget: {
            servicesTitle: "Services",
            details: "Details",
            generalMapping: "General Mapping",
            ignoreList: "Ignore List",
            attrNamePlaceholder: "Attribute field name...",
            dispNamePlaceholder: "Field name to display...",
            attrValuePlaceholder: "Attribute field value...",
            dispValuePlaceholder: "Field value to display...",
            serviceIdPlaceholder: "Service ID...",
            layerIdPlaceholder: "Layer ID..."
        }
    })
);