define([
        "dojo/_base/declare",
        "./ContentPanelUI"
    ],
    function (
        declare,
        ContentPanelUI
        ) {
        /*
         * COPYRIGHT 2014 con terra GmbH Germany
         */
        return declare([ContentPanelUI],
            {
                topics: {
                    ON_CONTENTMANAGER_SHOW: "ct/contentmanager/compare/ON_CONTENTMANAGER_SHOW",
                    ON_CONTENTMANAGER_HIDE: "ct/contentmanager/compare/ON_CONTENTMANAGER_HIDE",
                    ON_POI_HOVER: "ct/contentmanager/ON_POI_HOVER",
                    ON_POI_LEAVE: "ct/contentmanager/ON_POI_LEAVE",
                    APP_SELECTED: "ct/appsoverview/APP_SELECTED",
                    INFO_CLICK: "ct/contentmanager/INFO_CLICK"
                }
            });
    });