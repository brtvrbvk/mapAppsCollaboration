define([
        "dojo/_base/declare",
        "dataform/controls/_Control",
        "dataform/controls/FormControls",
        "dijit/TitlePane"
    ],
    function (
        declare,
        _Control,
        FormControls,
        TitlePane
        ) {

        var TP = declare([_Control],
            {
                controlClass: "titlepane",
                createWidget: function (params) {
                    params.title = params.labelTitle || params.paneLabel;
                    return new TitlePane(params);
                }
            });
        FormControls.prototype.controls.titlepane = TP;
        return TP;
    });