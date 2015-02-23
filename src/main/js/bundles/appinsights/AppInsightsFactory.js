define([
        "dojo/_base/declare",
        "./AppInsightsV0",
        "./AppInsightsV07"
    ],
    function (
        declare,
        AppInsightsV0,
        AppInsightsV07
        ) {
        return declare([],
            {
                createInstance: function () {
                    var props = this._properties;

                    switch (props.versionToUse) {
                        case "v00":
                            return new AppInsightsV0(props.v00);
                            break;
                        case "v07":
                            return new AppInsightsV07(props.v07);
                            break;
                    }
                }
            });
    });