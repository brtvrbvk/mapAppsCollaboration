define([
        "dojo/_base/declare",
        "ct/Stateful",
        "./TimeSliderBarWidget"
    ],
    function (
        declare,
        Stateful,
        TimeSliderBarWidget
        ) {
        return declare([Stateful],
            {
                constructor: function () {

                },

                createInstance: function () {
                    return new TimeSliderBarWidget({
                    });
                }
            }
        )
    }
);