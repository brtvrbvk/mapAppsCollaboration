define([
    "dojo/_base/declare",
    "esri/undoManager",
    "ct/_when",
    "ct/_string",
    "ct/async",
    "dojo/_base/Deferred"
], function (
    declare,
    UndoManager,
    ct_when,
    ct_string,
    ct_async,
    Deferred,
    undefined
    ) {
    /**
     * COPYRIGHT 2010-2011 con terra GmbH Germany
     *
     */
    return declare([UndoManager], {
        undoProgress: undefined,
        redoProgress: undefined,
        undo: function () {
            if (0 === this.position)
                return null;
            var a = this.peekUndo();
            this.position--;
            var deferred = this.performOperation(a, true);
            this.onUndo();
            this._checkAvailability();
            return deferred;
        },
        redo: function () {
            if (this.position === this._historyStack.length)
                return null;
            var a = this.peekRedo();
            this.position++;
            var deferred = this.performOperation(a, false);
            this.onRedo();
            this._checkAvailability();
            return deferred;
        },
        performOperation: function (
            operation,
            isUndo
            ) {
            if (!operation) {
                return undefined;
            }
            var d;
            try {
                d = operation[isUndo ? "performUndo" : "performRedo"]();
            } catch (e) {
                d = new Deferred();
                d.reject(e);
            }
            return this._checkAsyncProgress(d, isUndo, (operation && operation.label) || "");
        },
        _checkAsyncProgress: function (
            deferred,
            isUndo,
            label
            ) {
            var progressProperty = isUndo ? "undoProgress" : "redoProgress";
            var messages = this._i18n.get().messages[isUndo ? "undo" : "redo"];
            //added configurable log messages
            if (this.logInfoMessages) {
                this._logger.info(ct_string.stringReplace(messages.start, {operation: label}));
            }
            return this[progressProperty] = ct_async(function () {
                var reset = function () {
                    this[progressProperty] = undefined;
                    this.onChange();
                };
                return ct_when(deferred, function (result) {
                    reset.call(this);
                    //added configurable log messages
                    if (this.logInfoMessages) {
                        this._logger.info(ct_string.stringReplace(messages.success, {operation: label}));
                    }
                    return result;
                }, function (e) {
                    console.error("Error during undo: ", e);
                    reset.call(this);
                    this._logger.error(ct_string.stringReplace(messages.failure,
                        {operation: label, error: e.message || e}));
                    throw e;
                }, this);
            }, this).promise();
        }
    });
});