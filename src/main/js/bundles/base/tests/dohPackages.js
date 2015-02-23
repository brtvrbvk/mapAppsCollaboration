(function () {
    var dconfig = this["dojoConfig"] || {};
    dconfig.has = dconfig.has || {};
    dconfig.has["extend-esri"] = false;
    var jsBasePath = dconfig.rootJSPath || "../";
    var defaultPackages = [
        {
            name: "ct",
            location: jsBasePath + "ct"
        },
        {
            name: "ct/base",
            location: jsBasePath + "prj/ct/base"
        },
        {
            name: "bundles",
            location: jsBasePath + "bundles"
        },
        {
            name: "dojo",
            location: jsBasePath + "dojo"
        },
        {
            name: "dijit",
            location: jsBasePath + "dijit"
        },
        {
            name: "dojox",
            location: jsBasePath + "dojox"
        },
        {
            name: "dgrid",
            location: jsBasePath + "dgrid"
        },
        {
            name: "put-selector",
            location: jsBasePath + "put-selector"
        },
        {
            name: "xstyle",
            location: jsBasePath + "xstyle"
        },
        {
            name: "esri",
            location: jsBasePath + "esri"
        }
    ];

    var testPackages = [
        // now the bundles
        {
            name: "system",
            location: jsBasePath + "bundles/base/system"
        },
        {
            name: "languagetoggler",
            location: jsBasePath + "bundles/base/languagetoggler"
        },
        {
            name: "parametermanager",
            location: jsBasePath + "bundles/base/parametermanager"
        },
        {
            name: "templatelayout",
            location: jsBasePath + "bundles/base/templatelayout"
        },
        {
            name: "basemapgallery",
            location: jsBasePath + "bundles/basemaps/basemapgallery"
        },
        {
            name: "basemaptoggler",
            location: jsBasePath + "bundles/basemaps/basemaptoggler"
        },
        {
            name: "coordinatetransformer",
            location: jsBasePath + "bundles/mapcore/coordinatetransformer"
        },
        {
            name: "followme",
            location: jsBasePath + "bundles/mapcore/followme"
        },
        {
            name: "infoviewer",
            location: jsBasePath + "bundles/mapcore/infoviewer"
        },
        {
            name: "locateme",
            location: jsBasePath + "bundles/maptools/locateme"
        },
        {
            name: "coordinatefinder",
            location: jsBasePath + "bundles/maptools/coordinatefinder"
        },
        {
            name: "omnisearch",
            location: jsBasePath + "bundles/search/omnisearch"
        },
        {
            name: "locator",
            location: jsBasePath + "bundles/search/locator"
        },
        {
            name: "featureinfo",
            location: jsBasePath + "bundles/selection/featureinfo"
        },
        {
            name: "resultcenter",
            location: jsBasePath + "bundles/selection/resultcenter"
        },
        {
            name: "selection",
            location: jsBasePath + "bundles/selection/selection"
        },
        {
            name: "infoservice",
            location: jsBasePath + "bundles/selection/infoservice"
        },
        {
            name: "joinaddress",
            location: jsBasePath + "bundles/search/joinaddress"
        },
        {
            name: "bookmarks",
            location: jsBasePath + "bundles/maptools/bookmarks"
        },
        {
            name: "geojson",
            location: jsBasePath + "bundles/mapcore/geojson"
        },
        {
            name: "toolrules",
            location: jsBasePath + "bundles/base/toolrules"
        },
        {
            name: "editing",
            location: jsBasePath + "bundles/maptools/editing"
        },
        {
            name: "poi",
            location: jsBasePath + "prj/agiv/bundles/poi"
        },
        {
            name: "search",
            location: jsBasePath + "prj/agiv/bundles/search"
        },
        {
            name: "statestoring",
            location: jsBasePath + "prj/agiv/bundles/statestoring"
        },
        {
            name: "coordinateviewer_agiv",
            location: jsBasePath + "prj/agiv/bundles/coordinateviewer_agiv"
        },
        {
            name: "agiv",
            location: jsBasePath + "prj/agiv"
        },
        {
            name: "agiv_bundles",
            location: jsBasePath + "prj/agiv/bundles"
        },
        {
            name: "splitviewmap",
            location: jsBasePath + "prj/agiv/bundles/splitviewmap"
        },
        {
            name: "combicontentmanager",
            location: jsBasePath + "prj/agiv/bundles/combicontentmanager"
        },
        {
            name: "geopunt",
            location: jsBasePath + "prj/agiv/bundles/geopunt"
        },
        {
            name: "toextent",
            location: jsBasePath + "prj/agiv/bundles/toextent"
        },
        {
            name: "genericidentify",
            location: jsBasePath + "prj/agiv/bundles/genericidentify"
        },
        {
            name: "geolocator",
            location: jsBasePath + "prj/agiv/bundles/geolocator"
        },
        {
            name: "parcelselection",
            location: jsBasePath + "prj/agiv/bundles/parcelselection"
        },
        {
            name: "kmltogeojson",
            location: jsBasePath + "prj/agiv/bundles/kmltogeojson"
        },
        {
            name: "kml",
            location: jsBasePath + "prj/agiv/bundles/kml"
        },
        {
            name: "coordinateparser",
            location: jsBasePath + "prj/agiv/bundles/coordinateparser"
        }
    ];

    var concat = function (
        a,
        b
        ) {
        return !a ? b : a.concat(b);
    };

    var packages = dconfig.packages || [];
    if (packages.length > 0) {
        // default packages not added if specified external
        packages = concat(packages, defaultPackages);
    }
    // add test packages
    dconfig.packages = concat(packages, testPackages);
    dconfig.async = true;
    dconfig.locale = "nl";

    window.dojoConfig = dconfig;

    //must be provided by runner.html
    window.nextBoot && nextBoot();
})();