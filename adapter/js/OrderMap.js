function OrderMap(settings) {
    this.config = settings.config;
    this.params = settings.params;
    this.orderParams = {route: null, location: {from: null, to: null}};

    this.config.map.targetId = this.config.html.elements.id.map;
    this.defineMapService(this.params, this.config.map);

    this.mapService.initMap();

    return this;
}

OrderMap.prototype = Object.create(Order.prototype);
OrderMap.prototype.constructor = OrderMap;


OrderMap.prototype.defineMapService = function(orderParams, mapParams) {
    if ('yandex' == orderParams.map.id)
        this.mapService = new OrderYandexMap(mapParams);
}

OrderMap.prototype.findCarsInterval = function(successCbk, errorCbk, interval) {
    var self = this;
    self.findCars(function(cars) {
        successCbk(cars);
        setTimeout(self.findCarsInterval.bind(self), (interval || self.config.request.findCarsInterval), successCbk, errorCbk, interval)
    },function(error) {
        console.log('err findcars')
        console.log(error)
        errorCbk(error)
    })
}

OrderMap.prototype.findCars = function(successCbk, errorCbk) {
    var method = {
        name: 'findCars'
    };

    this.doRequest(method).then(
        function (result) {
            console.log('ok findCars');
            successCbk(result);
        },
        function (response) {
            console.log('err findCars');
            console.log(response);
            errorCbk(response);
        }
    );
}

OrderMap.prototype.drawCars = function(cars, successCbk, errorCbk) {
    var self = this;
    self.mapService.drawCars(cars, function() {
        self.canPanMap() && self.mapService.panMap();
    }, function(error) {
        console.log('err drawcars')
        console.log(error)
    })
}

OrderMap.prototype.drawPoint = function(params, successCbk, errrorCbk) {
    var self = this;
    self.orderParams.location[params.direction] &&
        self.mapService.map.geoObjects.remove(self.orderParams.location[params.direction]);

    self.mapService.drawPoint(params, function(geoPoint) {
        self.orderParams.location[params.direction] = geoPoint;
        self.canDrawRoute() ? self.drawRoute() : self.mapService.panMap(geoPoint.geometry.getCoordinates());
    }, function(error) {
        console.log('err draw')
    })
}

OrderMap.prototype.canDrawRoute = function() {
    return !!(this.orderParams.location.from && this.orderParams.location.to);
}

OrderMap.prototype.canPanMap = function() {
    return (!this.orderParams.route && !this.orderParams.location.from && !this.orderParams.location.to);
}

OrderMap.prototype.drawRoute = function() {
    var self = this;

    self.orderParams.route && self.mapService.map.geoObjects.remove(self.orderParams.route);
    self.mapService.drawRoute(
        [self.orderParams.location.from.geometry.getCoordinates(), self.orderParams.location.to.geometry.getCoordinates()],
        function(route) {
            self.orderParams.route = route;
            document.getElementById(self.config.html.elements.id.orderForm).dispatchEvent(new CustomEvent('calcCost', {detail: {dist: route.getLength(), time: route.getTime()}}));
        },
        function(error) {
            console.log('err drawroute')
            console.log(error)
        }
    );
}
