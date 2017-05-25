function GootaxAdapter() {
    this.url = '/api_integration/index_client.php?command=';
    this.authorizePhones = {};
}

GootaxAdapter.prototype = Object.create(AbstractAdapter.prototype);
GootaxAdapter.constructor = GootaxAdapter;

GootaxAdapter.prototype.formatOrderTime = function (OrderTime) {
    var addZero = function (val) {
        if (+val < 10) {
            val = '0' + val;
        }
        return val;
    };
    
    return addZero(OrderTime.getDate()) + '.' + addZero(OrderTime.getMonth() + 1) + '.' + OrderTime.getFullYear() + ' ' + addZero(OrderTime.getHours()) + ':' + addZero(OrderTime.getMinutes()) + ':' + addZero(OrderTime.getSeconds());
};

GootaxAdapter.prototype.isAuthorizedPhone = function (phone, yes, no) {
    if (this.authorizePhones.hasOwnProperty(phone)) {
        yes();
        return;
    }

    this.needSendSms(phone, function (need) {
        need ? no() : yes();
    });
};

GootaxAdapter.prototype.setAuthorizedPhone = function (params, then) {
    if (!params || !params.phone) {
        return;
    }

    this.authorizePhones[params.phone] = true;

    if (params.browserKey) {
        var
            cookieBrowserKey = {
                name: 'browserKey',
                value: params.browserKey
            };

        this.setCookie(cookieBrowserKey);
    }

    if (params.token) {
        var
            cookieToken = {
                name: 'token',
                value: params.token
            };

        this.setCookie(cookieToken);
    }

    if (TypeHelper.isFunction(then)) {
        then();
    }
};

GootaxAdapter.prototype.createEmptyParam = function () {
    return '';
};

GootaxAdapter.prototype.calculateCost = function (clientParams, success, error) {
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

GootaxAdapter.prototype.createOrder = function (clientParams, success, error) {
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
        url: that.url + 'createOrder',
        params: params,
        success: success,
        error: error
    }));
};