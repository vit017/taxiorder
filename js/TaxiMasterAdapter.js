function TaxiMasterAdapter() {
    this.url = '/api_integration/index_client.php?command=';
}
TaxiMasterAdapter.prototype = Object.create(AbstractAdapter.prototype);
TaxiMasterAdapter.constructor = TaxiMasterAdapter;

TaxiMasterAdapter.prototype.formatOrderTime = function (OrderTime) {
    var addZero = function (val) {
        if (+val < 10) {
            val = '0' + val;
        }
        return val;
    };
    return addZero(OrderTime.getDate()) + '.' + addZero(OrderTime.getMonth() + 1) + '.' + OrderTime.getFullYear() + ' ' + addZero(OrderTime.getHours()) + ':' + addZero(OrderTime.getMinutes()) + ':' + addZero(OrderTime.getSeconds());
};

TaxiMasterAdapter.prototype.createEmptyParam = function () {
    return '';
};

TaxiMasterAdapter.prototype.calculateCost = function (clientParams, success, error) {
    var that = this,
        params = {
            fromCity: clientParams.cityFrom,
            fromStreet: clientParams.streetFrom,
            fromHouse: clientParams.houseFrom,
            fromHousing: clientParams.housingFrom,
            fromBuilding: clientParams.buildingFrom,
            fromPorch: clientParams.porchFrom,
            fromLat: clientParams.latFrom,
            fromLon: clientParams.lonFrom,
            toCity: clientParams.toCity,
            toStreet: clientParams.streetTo,
            toHouse: clientParams.houseTo,
            toHousing: clientParams.housingTo,
            toBuilding: clientParams.buildingTo,
            toPorch: clientParams.porchTo,
            toLat: clientParams.latTo,
            toLon: clientParams.lonTo,
            clientName: clientParams.clientName,
            phone: clientParams.phone,
            priorTime: clientParams.orderTime,
            customCarId: clientParams.carID,
            customCar: clientParams.car,
            carType: clientParams.carType,
            carGroupId: clientParams.carGroupID,
            tariffGroupId: clientParams.tariffID,
            comment: clientParams.comment
        };

    var empty = this.createEmptyParam();
    Object.keys(params).forEach(function (key) {
        if (!(params[key])) {
            params[key] = empty;
        }
    });

    this.process(new Request({
        url: that.url + 'callCost',
        params: params,
        success: success,
        error: error
    }));
};