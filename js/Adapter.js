function Adapter() {
}

Adapter.prototype.wrapTimeout = function (func, functionName, timeoutValue) {
    clearTimeout(this[functionName].timeOut);
    this[functionName].timeOut = setTimeout(func, timeoutValue);
};

Adapter.prototype.findTariffs = function (success, error) {

    this.process(new Request({
        url: '/api_integration/index_client.php?command=findTariffs',
        params: {},
        success: success,
        error: error
    }));

};

Adapter.prototype.findGeoObjects = function (clientParams, success, error) {

    var that = this,
        text = clientParams.text;

    if (text.trim().length < 3) {
        return;
    }

    this.wrapTimeout(function () {
        var params = {
            streetPart: clientParams.text,
            city: clientParams.city || '',
            maxLimit: clientParams.results || 10,
            type: clientParams.type || ''
        };

        that.process(new Request({
            url: '/api_integration/index_client.php?command=findGeoObjects',
            params: params,
            success: success,
            error: error
        }));

    }, 'findGeoObjects', 400);

};

Adapter.prototype.calculateCost = function (clientParams, success, error) {
    var that = this,
        params = {
            fromCity: clientParams.from.city,
            fromStreet: clientParams.from.street,
            fromHouse: clientParams.from.house,
            fromHousing: '',
            fromBuilding: '',
            fromPorch: clientParams.from.porch,
            fromLat: '',
            fromLon: '',
            toCity: clientParams.to.city,
            toStreet: clientParams.to.street,
            toHouse: clientParams.to.house,
            toHousing: '',
            toBuilding: '',
            toPorch: '',
            toLat: '',
            toLon: '',
            clientName: '',
            phone: clientParams.phone,
            priorTime: clientParams.orderTime,
            customCarId: '',
            customCar: '',
            carType: clientParams.carType,
            carGroupId: '',
            tariffGroupId: clientParams.tariffID,
            comment: clientParams.from.comment
        };

    this.process(new Request({
        url: '/api_integration/index_client.php?command=callCost',
        params: params,
        success: success,
        error: error
    }), function (Response) {

        var data = Response.getData();
        Response.data = {
            'length': data.result.summaryDistance,
            'cost': data.result.summaryCost
        };

        return Response;
    });
};

Adapter.prototype.process = function (Request, done) {
    var that = this,
        ClientResponse = {};

    $.ajax({
        url: Request.getUrl(),
        type: Request.getMethod(),
        data: Request.getParams(),
        dataType: Request.getDataType()
    }).done(function (data, textStatus, jqXHR) {

        if (that.isSuccessfulResponse(data)) {
            ClientResponse = that.createSuccessfulResponse(Request, jqXHR, data)
        }
        else {
            jqXHR.status = 400;
            jqXHR.statusText = 'Bad Request';
            ClientResponse = that.createFailResponse(Request, jqXHR);
        }

    }).fail(function (jqXHR, textStatus, errorThrown) {

        ClientResponse = that.createFailResponse(Request, jqXHR);

    }).always(function () {

        that.sendResponse(ClientResponse, done);

    });
};

Adapter.prototype.createSuccessfulResponse = function (Request, jqXHR, data) {
    return new Response({
        status: jqXHR.status,
        statusText: jqXHR.statusText,
        data: data.result,
        success: Request.getSuccessFunction(),
    })
};

Adapter.prototype.createFailResponse = function (Request, jqXHR) {
    return new Response({
        status: jqXHR.status,
        statusText: jqXHR.statusText,
        data: null,
        error: Request.getErrorFunction()
    })
};

Adapter.prototype.isSuccessfulResponse = function (data) {
    return typeof data === 'object' && +data.status > 0;
};

Adapter.prototype.sendResponse = function (Response, done) {
    if (Response.isSuccessful()) {
        if (done && 'function' === typeof done) {
            Response = done(Response);
        }
        Response.getSuccessFunction()(Response.getData());
    }
    else {
        Response.getErrorFunction()({
            status: Response.getStatus(),
            message: Response.getStatusText()
        });
    }
};