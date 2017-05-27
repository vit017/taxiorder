function GNewMap() {
    this.connection = null;
    this.mapImplementor = null;
    this.container = '';
    this.centerCoords = [];
    this.zoom = 10;
    this.points = {};
    this.categoryPoints = 'default';
}

GNewMap.prototype.setParams = function (params) {
    this.centerCoords = params.coords;
    this.zoom = params.zoom;
    this.container = params.container;
};

GNewMap.prototype.connect = function (then) {
    var
        that = this,
        script = document.createElement('script');


    script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
    document.head.appendChild(script);

    script.onload = function () {
        that.setConnection(ymaps);
        if (TypeHelper.isFunction(then)) {
            then();
        }
    };
};

GNewMap.prototype.ready = function (then) {
    var connection = this.getConnection();

    connection.ready(then);
};

GNewMap.prototype.setConnection = function (object) {
    this.connection = object;
};

GNewMap.prototype.getConnection = function () {
    return this.connection;
};

GNewMap.prototype.setMapImplementation = function (implementor) {
    this.mapImplementor = implementor;
};

GNewMap.prototype.getMapImplementation = function () {
    return this.mapImplementor;
};

GNewMap.prototype.init = function (then) {
    var
        that = this,
        connection = that.getConnection(),
        mapImpl = new connection.Map(that.container, {
            center: that.centerCoords,
            zoom: that.zoom
        });


    that.setMapImplementation(mapImpl);

    if (TypeHelper.isFunction(then)) {
        then();
    }
};

GNewMap.prototype.create = function (params, then) {
    var
        that = this,
        afterReady = that.init.bind(that, then),
        ready = that.ready.bind(that, afterReady);


    that.setParams(params);
    that.connect(ready.bind(afterReady));
};

GNewMap.prototype.setSinglePoint = function (coords, category) {
    var
        categoryParam = (2 === arguments.length) ? '' + category : this.categoryPoints,
        newPoint = this.newSinglePoint(coords, category);


    this.removeSinglePoint(categoryParam);
    this.addSinglePoint(newPoint, categoryParam);
};

GNewMap.prototype.newSinglePoint = function (coords, category) {
    var mapPoint = {};

    switch (category) {
        case 'from':
            mapPoint = new ymaps.GeoObject({
                geometry: {
                    type: 'Point',
                    coordinates: coords
                }
            }, {
                iconLayout: 'default#image',
                iconImageHref: '/local/templates/g-newtaxi/taxiorder/images/i/a_icon.png',
                iconImageSize: [24, 27],
                iconImageOffset: [12, 27]
            });
            break;
        case 'to':
            mapPoint = new ymaps.GeoObject({
                geometry: {
                    type: 'Point',
                    coordinates: coords
                }
            }, {
                iconLayout: 'default#image',
                iconImageHref: '/local/templates/g-newtaxi/taxiorder/images/i/b_icon.png',
                iconImageSize: [24, 27],
                iconImageOffset: [12, 27]
            });
            break;
        default:
            mapPoint = new ymaps.GeoObject({
                geometry: {
                    type: 'Point',
                    coordinates: coords
                }
            }, {
                preset: "islands#blueIcon"
            });
    }

    return mapPoint;
};

GNewMap.prototype.removeSinglePoint = function (category) {
    var
        that = this,
        categoryParam = (1 === arguments.length) ? '' + category : this.categoryPoints,
        mapObjects = this.getMapObjects(),
        mapPoints = that.getPoints(),
        mapPoint = mapPoints[categoryParam];


    if (!mapPoint) {
        return;
    }

    if (mapObjects.indexOf(mapPoint) > -1) {
        mapObjects.remove(mapPoint);
    }

    delete mapPoints[categoryParam];
};

GNewMap.prototype.getMapObjects = function () {
    return this.getMapImplementation().geoObjects;
};

GNewMap.prototype.getPoints = function () {
    return this.points;
};

GNewMap.prototype.addSinglePoint = function (point, category) {
    var categoryParam = (2 === arguments.length) ? '' + category : this.categoryPoints;

    this.points[categoryParam] = point;
    this.getMapObjects().add(point);
};


