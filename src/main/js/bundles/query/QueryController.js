define(["dojo/_base/declare", "ct/_Connect", "dojo/date/locale", "ct/store/Filter"], function (declare, _Connect, d_locale, Filter) {
    return declare([_Connect], {// Inherit from _Connect
        activate: function () {
            this.connect(this.queryWidget, "onFind", this._onFind);
            this.queryWidget.setPlaceHolder(this._properties.namePlaceHolder);
        },
        deactivate: function () {
            this.disconnect();
        },
        _onFind: function (event) {
debugger;
            console.debug("QueryController: onFind event received", event);
            var complexQuery = this._buildComplexQuery(event.query);
            console.debug("QueryController: complex query", complexQuery);
            var resultCenterDataModel = this._resultCenterDataModel;
            var filter = Filter(this._store, complexQuery);
            resultCenterDataModel.setDatasource(filter);
        },
        _buildComplexQuery: function (queryData) {
            // and part
            var query = {
                $and: []
            };
            var and = query.$and;

            // melder query
            var name = queryData.name;
            if (name && name.length) {
                var detailsQuery = {
                    melder: {
                        $eq: name
                    }
                };
                and.push(detailsQuery);
            }

            // date query
            var date = queryData.date;
            if (date) {
                var dateQuery = {
                    zeitpunkt: {
                        $gte: d_locale.format(date, {
                            datePattern: "yyy-MM-dd", selector: 'date'
                        })
                    }
                };
                and.push(dateQuery);
            }

            // extent query
            var isExtent = queryData.extent;
            if (isExtent) {
                var extent = this._getCurrentExtent();
                var extentQuery = {
                    geometry: {
                        $contains: extent
                    }
                };
                and.push(extentQuery);
            }
            return query;
        },
        _getCurrentExtent: function () {
            return this._mapState.getExtent();
        }
    });
});