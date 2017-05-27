function GNewMap() {
    this.form = null;
    this.connection = null;
    this.mapImplementor = null;
    this.container = '';
    this.centerCoords = [];
    this.zoom = 10;
    this.mapElements = {};
    this.categoryPoints = 'default';
}

GNewMap.prototype.setForm = function (form) {
    this.form = form;
};

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

GNewMap.prototype.setPointOnMap = function (coords, category) {
    var newPoint = this.newSinglePoint(coords, category);

    this.updateMapElement(newPoint, category);
};

GNewMap.prototype.newSinglePoint = function (coords, category) {
    var mapPoint = {};

    switch (category) {
        case'from':
            mapPoint = this.newPointAddressFrom(coords);
            mapPoint.htmlField = $('#input-from-street');
            this.addressPointReplaced(mapPoint, category);
            break;
        case'to':
            mapPoint = this.newPointAddressTo(coords);
            mapPoint.htmlField = $('#input-to-street');
            this.addressPointReplaced(mapPoint, category);
            break;
        case'freeCar':
            mapPoint = this.newPointFreeCar(coords);
            break;
        case'busyCar':
            mapPoint = this.newPointBusyCar();
            break;
    }

    return mapPoint;
};

GNewMap.prototype.newPointAddressFrom = function (coords) {
    return this.newMapPoint(coords, {
        iconLayout: 'default#image',
        iconImageHref: '/local/templates/g-newtaxi/taxiorder/images/i/a_icon.png',
        iconImageSize: [24, 27],
        draggable: true
    });
};

GNewMap.prototype.newPointAddressTo = function (coords) {
    return this.newMapPoint(coords, {
        iconLayout: 'default#image',
        iconImageHref: '/local/templates/g-newtaxi/taxiorder/images/i/b_icon.png',
        iconImageSize: [24, 27],
        draggable: true
    });
};

GNewMap.prototype.GeoResultObjectGetComponents = function (GeoObject) {
    var
        Components = GeoObject.properties.getAll().metaDataProperty.GeocoderMetaData.Address.Components,
        addressComponents = {};

    Components.forEach(function (Component) {
        addressComponents[Component.kind] = Component.name;
    });

    return addressComponents;
};

GNewMap.prototype.addressPointReplaced = function (mapPoint, category) {
    var that = this;

    mapPoint.events.add('dragend', function (e) {
        var
            coords = e.get('target').geometry.getCoordinates(),
            addressComponents = {},
            addressLine = '',
            $htmlField = mapPoint.htmlField;

        that.geocode({coords: coords, results: 1}, function (GeoResult) {
            addressComponents = that.GeoResultObjectGetComponents(GeoResult.geoObjects.get(0));
            addressLine = that.getAddressLineFromComponents(addressComponents);

            var
                direction = this.form.defineDirection($htmlField),
                field = 'from' === direction ? 'streetFrom' : 'streetTo',
                paramLat = 'from' === direction ? 'latFrom' : 'latTo',
                paramLon = 'from' === direction ? 'lonFrom' : 'lonTo';


            this.form.setFieldValue($htmlField, addressLine);

            this.form.setParam(paramLat, coords[0]);
            this.form.setParam(paramLon, coords[1]);
            this.form.setParam(field, addressLine);
        });
    });
};

GNewMap.prototype.geocode = function (params, then) {
    this.getConnection().geocode(params.coords, {results: params.results}).then(function (GeoResult) {
        then(GeoResult);
    });
};

GNewMap.prototype.getAddressLineFromComponents = function (Components) {
    var
        city = Components.locality,
        hydro = Components.hydro,
        district = Components.district,
        street = Components.street,
        house = Components.house,
        address = '';


    if (hydro) {
        address = [city, hydro];
    }
    else {
        address = [city, district, street, house].filter(function (param) {
            return param && param.length;
        });
    }

    return address.join(', ');
};

GNewMap.prototype.newPointFreeCar = function (coords) {
    return this.newMapPoint(coords, {
        iconLayout: 'default#image',
        iconImageHref: '/local/templates/g-newtaxi/taxiorder/images/i/green_car.png',
        iconImageSize: [24, 27]
    });
};

GNewMap.prototype.newPointBusyCar = function (coords) {
    return this.newMapPoint(coords, {
        iconLayout: 'default#image',
        iconImageHref: '/local/templates/g-newtaxi/taxiorder/images/i/red_car.png',
        iconImageSize: [24, 27]
    });
};

GNewMap.prototype.newMapPoint = function (coords, options) {
    var connection = this.getConnection();

    return new connection.GeoObject({
        geometry: {
            type: 'Point',
            coordinates: coords
        }
    }, options);
};

GNewMap.prototype.updateMapElement = function (mapElement, category) {
    this.removeMapElement(category);
    this.addMapElement(mapElement, category);
};

GNewMap.prototype.removeMapElement = function (category) {
    var mapElement = this.getMapElement(category);

    this.removeGeoObjectFromMap(mapElement);
    this.removeCategoryElements(category);
};

GNewMap.prototype.getMapElement = function (category) {
    return this.mapElements[category];
};

GNewMap.prototype.removeCategoryElements = function (category) {
    delete this.mapElements[category];
};

GNewMap.prototype.removeGeoObjectFromMap = function (GeoObject) {
    if (this.mapHasGeoObject(GeoObject)) {
        this.getMapObjects().remove(GeoObject);
    }
};

GNewMap.prototype.addMapElement = function (mapElement, category) {
    this.addGeoObjectOnMap(mapElement);
    this.setMapElement(mapElement, category);
};

GNewMap.prototype.addGeoObjectOnMap = function (GeoObject) {
    this.getMapObjects().add(GeoObject);
};

GNewMap.prototype.setMapElement = function (mapElement, category) {
    this.mapElements[category] = mapElement;
};

GNewMap.prototype.mapHasGeoObject = function (GeoObject) {
    return this.getMapObjects().indexOf(GeoObject) > -1;
};

GNewMap.prototype.getMapObjects = function () {
    return this.getMapImplementation().geoObjects;
};

GNewMap.prototype.setMultiPointsOnMap = function (points, category) {
    var newCollection = this.newMapCollection(points, category);

    this.updateMapElement(newCollection, category);
};

GNewMap.prototype.newMapCollection = function (objects, category) {
    var
        that = this,
        mapCollection = that.createMapCollection();


    objects.forEach(function (object) {
        var
            lat = parseFloat(object.lat),
            lon = parseFloat(object.lon),
            singlePoint = that.newSinglePoint([lat, lon], category);

        that.addGeoObjectOnMapCollection(mapCollection, singlePoint);
    });

    return mapCollection;
};

GNewMap.prototype.createMapCollection = function () {
    var connection = this.getConnection();

    return new connection.GeoObjectCollection();
};

GNewMap.prototype.addGeoObjectOnMapCollection = function (mapCollection, GeoObject) {
    mapCollection.add(GeoObject);
};