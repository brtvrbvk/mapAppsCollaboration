define({
    bundleName: "UndoRedo",
    bundleDescription: "Das Modul bietet ein undo/redo System an.",
    undoTool: {
        title: "R\u00FCckg\u00E4ngig",
        tooltip: "R\u00FCckg\u00E4ngig"
    },
    redoTool: {
        title: "Wiederholen",
        tooltip: "Wiederholen"
    },
    messages: {
        undo: {
            start: "R\u00FCckg\u00E4ngig {operation} gestartet",
            success: "R\u00FCckg\u00E4ngig {operation} beendet",
            failure: "R\u00FCckg\u00E4ngig {operation} fehlgeschlagen. Fehler: {error}"
        },
        redo: {
            start: "Wiederholung {operation} gestartet",
            success: "Wiederholung {operation} beendet",
            failure: "Wiederholung {operation} fehlgeschlagen. Fehler: {error}"
        }
    }
});