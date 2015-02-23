define([
        "./RadioButton",
        "dataform/controls/FormControls"
    ],
    function (
        RadioButton,
        FormControls
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */

        var FCF = FormControls.prototype;

        var controls = FCF.controls;
        var typename = "radiobutton";
        if (!controls[typename]) {
            controls[typename] = RadioButton;
        }
        return FormControls;
    });