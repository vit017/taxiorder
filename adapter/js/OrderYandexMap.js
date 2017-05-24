function OrderYandexMap(params) {
    this.config = params;
    return this;
}

//OrderYandexMap.prototype = Object.create(OrderMap.prototype);
//OrderYandexMap.prototype.constructor = OrderYandexMap;

OrderYandexMap.prototype.initMap = function () {
    var self = this;

    ymaps.ready(function () {
        self.map = new ymaps.Map(self.config.targetId, {
            center: [55.76, 37.64],
            zoom: self.config.zoom
        });
    });
}

OrderYandexMap.prototype.drawCars = function (cars, successCbk, errorCbk) {
    var self = this;

    ymaps.ready(function () {
        var carsCollection = new ymaps.GeoObjectCollection();
        var carFlag = '';
        cars.forEach(function (item) {
            if (item.isFree) carFlag = 'freeCar';
            else carFlag = 'busyCar';
            carsCollection.add(self.createGeoPoint([item.lat, item.lon], self.config.icon[carFlag]));
        });

        if (self.map.hasOwnProperty('carsCollection'))
            self.map.carsCollection.removeAll();

        self.map.carsCollection = carsCollection;
        self.map.geoObjects.add(carsCollection);
        successCbk();
    });
}

OrderYandexMap.prototype.getCoords = function (address, successCbk, errorCbk) {
    ymaps.geocode(address, {results: 1}).then(function (res) {
        successCbk(res.geoObjects.get(0).geometry.getCoordinates());
    }, function (error) {
        errorCbk(error);
    });
}

OrderYandexMap.prototype.drawPoint = function (params, successCbk, errorCbk) {
    var geoPoint = this.createGeoPoint(params.coords, this.config.icon[params.direction]);
    this.map.geoObjects.add(geoPoint);
    successCbk(geoPoint);
}

OrderYandexMap.prototype.drawRoute = function (addresses, successCbk, errorCbk) {
    var self = this;
    ymaps.route(addresses).then(function (route) {
        route.getPaths().options.set(self.config.RouteLineStyle);
        route.getWayPoints().get(0).options.set(self.config.icon.from);
        route.getWayPoints().get(1).options.set(self.config.icon.to);
        self.map.geoObjects.add(route);
        self.map.setBounds(route.getWayPoints().getBounds());
        console.log('ok route')
        successCbk(route);
    }, function (error) {
        console.log('err route')
        console.log(error)
        errorCbk(error)
    });
}

OrderYandexMap.prototype.createGeoPoint = function (coords, icon) {
    return new ymaps.GeoObject(
        {
            geometry: {
                type: "Point",
                coordinates: coords
            }
        },
        icon
    )
}

OrderYandexMap.prototype.panMap = function (coords) {
    if (coords === undefined)
        this.map.setBounds(this.map.geoObjects.getBounds());
    else
        this.map.panTo(coords);
}