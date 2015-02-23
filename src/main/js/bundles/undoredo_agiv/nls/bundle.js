define({
    root: {
        bundleName: "UndoRedo",
        bundleDescription: "The bundle provides a undo/redo infrastructure.",
        undoTool: {
            title: "Undo",
            tooltip: "Undo"
        },
        redoTool: {
            title: "Redo",
            tooltip: "Redo"
        },
        messages: {
            undo: {
                start: "Undo {operation} started",
                success: "Undo {operation} finished",
                failure: "Undo {operation} failed. Error: {error}"
            },
            redo: {
                start: "Redo {operation} started",
                success: "Redo {operation} finished",
                failure: "Redo {operation} failed. Error: {error}"
            }
        }
    },
    "de": true
});