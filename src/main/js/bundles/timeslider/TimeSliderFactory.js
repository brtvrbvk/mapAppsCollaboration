/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 17.12.13
 * Time: 08:48
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "./TimeSliderWidget"
    ],
    function (
        declare,
        Stateful,
        TimeSliderWidget
        ) {
        return declare([Stateful],
            {
                constructor: function () {

                },

                activate: function () {
                    this._inst = new TimeSliderWidget({
                        imageSelector: this.imageSelector,
                        timeSliderBar: this.timeSliderBar
                    });
                },

                createInstance: function () {
                    return this._inst;
                },

                destroyInstance: function (inst) {
                    //is there a better way to ensure positioning across different templates than to reuse the old instance?
                    //inst.destroy();
                }
            }
        )
    }
);