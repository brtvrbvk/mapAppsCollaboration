/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 02.04.2014.
 */
define([
        "dojo/dom"
    ],
    function (d_dom) {
        return {
            releaseHorde: function () {
                gremlins.createHorde(Math.round(new Date().getTime() * Math.random()))
                    .gremlin(
                    gremlins.species.clicker()
                        .canClick(function (element) {
//                            return d_dom.isDescendant(element.id, 'uniqName_17_0-dockingBarBottom');
                            return true;
                        }))
                    .gremlin(
                    gremlins.species.toucher()
                        .canTouch(function (element) {
                            return d_dom.isDescendant(element.id, 'uniqName_31_1_gc');
                        }))
                    .strategy(gremlins.strategies.distribution()
                        .delay(80))
                    .unleash();
            }
        }
    }
);