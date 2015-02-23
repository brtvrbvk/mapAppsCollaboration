/**
 * Patch for ct/tools/ToolButton to allow to change the tool button tooltip programmatically on a tool.
 */
define([
        "ct/tools/ToolButton",
        "ct/_Connect"
    ],
    function (
        ToolButton,
        Connect
        ) {
        ToolButton.extend({
            postMixInProperties: function () {
                this.inherited(arguments);

                var that = this;
                var listeners = this._listeners = new Connect();
                listeners.connectP(this.tool, "tooltip", function () {
                    that.get("_tooltip").set("label", that.tool.get("tooltip"));
                });
            },

            destroy: function() {
                this.inherited(arguments);

                this._listeners.disconnect();
            }
        });
    });