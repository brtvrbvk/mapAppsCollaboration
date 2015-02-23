/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 31.03.2014.
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "ct/mapping/edit/GraphicsRenderer",
        "ct/mapping/edit/SymbolTableLookupStrategy"
    ],
    function (
        declare,
        Stateful,
        GraphicsRenderer,
        SymbolTableLookupStrategy
        ) {
        return declare([Stateful],
            {
                constructor: function () {

                },

                activate: function () {

                },

                _getRenderer: function () {

                    if (this._renderer) {
                        return this._renderer;
                    }

                    this._renderer = GraphicsRenderer.createForGraphicsNode("chartGeometryPane",
                        this._mapModel);
                    var ms = new SymbolTableLookupStrategy({
                        lookupByGeometryType: true,
                        lookupTable: this._symbolTable
                    });
                    this._renderer.set({
                        symbolLookupStrategy: ms
                    });
                    if (this._renderer.get("hasNodeCreated")) {
                        this._mapModel.fireModelStructureChanged({
                            source: this
                        });
                    }

                    return this._renderer;

                },

                render: function (geom) {

                    var renderer = this._getRenderer();
                    renderer.clear();
                    renderer.draw({
                        geometry: geom,
                        attributes: {
                            geometryType: "-selected"
                        }
                    });
                    this._mapModel.fireModelNodeStateChanged({
                        source: this
                    });

                },

                clear: function () {
                    if (this._renderer) {
                        this._renderer.clear();
                    }
                },

                _render: function (evt) {

                    var geom = evt && evt.getProperty("geometry");
                    if (geom) {
                        this.render(geom);
                    }

                }
            }
        )
    }
);