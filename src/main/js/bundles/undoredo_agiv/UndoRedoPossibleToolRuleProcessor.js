define([
    "dojo/_base/declare",
    "dojo/_base/array"
], function (
    declare,
    d_array,
    undefined
    ) {
    var checkBooleanRuleCondition = function (
        expectedValue,
        currentValue,
        results
        ) {
        if (expectedValue === undefined) {
            // rule evaluation not required
            return;
        }
        if (currentValue === undefined) {
            results.push(undefined);
        }
        results.push(expectedValue === currentValue);
    };
    /**
     * COPYRIGHT 2010-2011 con terra GmbH Germany
     *
     * @fileOverview  UndoRedoPossibleToolRule encapsulates the check if undo/redo is possible.
     */
    return declare([], {
        // this rule processes such rule properties;
        ruleProperties: [
            "canRedo",
            "canUndo",
            "undoInProgress",
            "redoInProgress"
        ],
        // injected Stateful
        ruleContextState: null,
        // injected undoRedo Service
        undoRedoService: null,
        activate: function () {
            // check on startup
            this._checkUndoRedoState();

            // here we force synchron evaluation if undo processing changes
            // we do this to ensure correct states of the undo/redo tools
            // because this will not so often, it should not a performance problem
            var context = this.ruleContextState;
            var forceToolEvaluation = function () {
                context.forceEvaluation();
            };
            var watches = this._watches = [];
            watches.push(context.watch("undoredo_undoInProgress", forceToolEvaluation));
            watches.push(context.watch("undoredo_redoInProgress", forceToolEvaluation));
        },
        deactivate: function () {
            d_array.forEach(this._watches, function (w) {
                w.unwatch();
            });
            this._watches = undefined;
        },
        /**
         * called during onChange of UndoService, see manifest.json
         */
        _checkUndoRedoState: function () {
            var context = this.ruleContextState;
            var undoRedo = this.undoRedoService;
            context.set({
                undoredo_canUndo: undoRedo.canUndo,
                undoredo_canRedo: undoRedo.canRedo,
                undoredo_undoInProgress: !!undoRedo.undoProgress,
                undoredo_redoInProgress: !!undoRedo.redoProgress
            });
        },
        /**
         * method is called by the ToolRule Manager.
         */
        isRuleFulfilled: function (
            tool,
            context,
            toolRuleDef
            ) {
            var results = [];
            checkBooleanRuleCondition(toolRuleDef.canRedo, context.get("undoredo_canRedo"), results);
            checkBooleanRuleCondition(toolRuleDef.canUndo, context.get("undoredo_canUndo"), results);
            checkBooleanRuleCondition(toolRuleDef.undoInProgress, context.get("undoredo_undoInProgress"), results);
            checkBooleanRuleCondition(toolRuleDef.redoInProgress, context.get("undoredo_redoInProgress"), results);
            return results;
        }
    });
});