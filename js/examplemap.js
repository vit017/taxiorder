var k = 0;
function generateKey(params) {
    return '' + k++;

    var arUniq = [];

    switch (typeof params) {
        case 'undefined':
            arUniq.push('');
            break;
        case 'object':
            Object.keys(params).forEach(function (key) {
                arUniq.push(generateKey(params[key]));
            });
            break;
        default:
            arUniq.push('' + params);
    }

    return arUniq.join('');
}

function YandexPoint(params) {
    this.coords = params.coords || [];
    this.options = params.options || {};
    this.category = params.category || '';
    this.ya = null;
    this.id = generateKey(params);
}
YandexPoint.prototype.uniq = function () {
    return this.id;
};
YandexPoint.prototype.update = function (params) {
    var that = this;

    Object.keys(this).forEach(function (key) {
        if (params.hasOwnProperty(key)) {
            that[key] = params[key];
        }
    });
    that.id = generateKey(params);

    return that;
};
YandexPoint.prototype.param = function (key, value) {
    if (1 === arguments.length) {
        return this[key];
    }

    this[key] = value;
};
YandexPoint.prototype.create = function () {
    if (this.ya) {
        return this.ya;
    }

    var that = this;
    this.ya = new ymaps.GeoObject({
        geometry: {
            type: "Point",
            coordinates: that.coords
        }
    }, that.options);

    return this.ya;
};
YandexPoint.prototype.get = function () {
    if (!this.ya) {
        this.ya = this.create();
    }

    return this.ya;
};
YandexPoint.prototype.addEvent = function (eventType, cbk) {
    this.get().events.add(eventType, cbk);
};

function YandexMap(params) {
    this.container = params.container || '';
    this.coords = params.coords || [];
    this.zoom = params.zoom || 10;
}
YandexMap.Points = {};
YandexMap.Settings = {
    categoryPoints: 'default'
};
YandexMap.ready = function (cbk) {
    ymaps.ready(cbk);
};
YandexMap.prototype.param = function (key, value) {
    if (1 === arguments.length) {
        return this[key];
    }

    this[key] = value;
};
YandexMap.prototype.create = function () {
    if (this.ya) {
        return this.ya;
    }

    var that = this;
    this.ya = new ymaps.Map(that.container, {
        center: that.coords,
        zoom: that.zoom
    });

    return this.ya;
};
YandexMap.prototype.get = function () {
    if (!this.ya) {
        this.ya = this.create();
    }

    return this.ya;
};
YandexMap.prototype.addEvent = function (eventType, cbk) {
    this.get().events.add(eventType, cbk);
};
YandexMap.prototype.addPoint = function (Point, category) {
    var c = (2 === arguments.length) ? '' + category : (Point.category || YandexMap.Settings.categoryPoints);

    if (!YandexMap.Points.hasOwnProperty(c)) {
        YandexMap.Points[c] = {};
    }

    YandexMap.Points[c][Point.uniq()] = Point;

    return this.get().geoObjects.add(Point.get());
};
YandexMap.prototype.removePoint = function (Point, category) {
    var
        c = (2 === arguments.length) ? '' + category : (Point.category || YandexMap.Settings.categoryPoints),
        pid = Point.uniq(),
        Points = YandexMap.Points,
        mapObjects = this.get().geoObjects,
        p = Point.get();


    if (Points.hasOwnProperty(c) && Points[c].hasOwnProperty(pid)) {
        delete Points[c][pid];
    }

    if (mapObjects.indexOf(p) > -1) {
        mapObjects.remove(p);
    }
};
YandexMap.prototype.removePoints = function (category) {
    var c = (1 === arguments.length) ? '' + category : YandexMap.Settings.categoryPoints,
        Points = YandexMap.Points;

    if (!Points.hasOwnProperty(c)) {
        return;
    }

    var that = this,
        ps = Points[c];

    Object.keys(ps).forEach(function (key) {
        that.removePoint(ps[key]);
    });
    delete Points[c];
};
YandexMap.prototype.getAddressLine = function (GeoResult) {
    var Text = GeoResult.properties.getAll();
    return Text.name + ', ' + Text.description.split(',').reverse().join(', ').trim();
};
YandexMap.prototype.getCoords = function (GeoResult) {
    return GeoResult.geometry.getCoordinates();
};
YandexMap.prototype.center = function (coords) {
    if (!arguments.length) {
        return this.get().getCenter();
    }

    this.get().setCenter(coords);
};
YandexMap.prototype.geocode = function (params, cbk) {
    var options = {
        results: params.results || 10
    };
    if (params.hasOwnProperty('bounds')) {
        options.boundedBy = params.bounds;
        options.strictBounds = true;
    }

    ymaps.geocode(params.request, options).then(function (result) {
        if (cbk && typeof cbk === 'function') {
            if (1 === params.results) {
                cbk(result.geoObjects.get(0));
            }
            else {
                cbk(result.geoObjects);
            }
        }
    });
};
YandexMap.prototype.route = function (params, cbk) {
    ymaps.route(params.points, {
        mapStateAutoApply: params.autoMapState || false
    }).then(function (route) {
        if (cbk && typeof cbk === 'function') {
            cbk(route);
        }
    }, function (e) {
        if (cbk && typeof cbk === 'function') {
            cbk(e);
        }
    });
};