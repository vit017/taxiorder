function AbstractAdapter() {
    throw new Error('AbstractAdapter constructor');
}

AbstractAdapter.prototype.findTariffs = function (success, error) {
    var that = this;
    this.process(new Request({
        url: that.url + 'findTariffs',
        params: {},
        success: success,
        error: error
    }));
};

AbstractAdapter.prototype.findGeoObjects = function (clientParams, success, error) {

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
            url: that.url + 'findGeoObjects',
            params: params,
            success: success,
            error: error
        }));

    }, 'findGeoObjects', 400);

};


AbstractAdapter.prototype.wrapTimeout = function (func, functionName, timeoutValue) {
    clearTimeout(this[functionName].timeOut);
    this[functionName].timeOut = setTimeout(func, timeoutValue);
};

AbstractAdapter.prototype.process = function (Request, done) {
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

AbstractAdapter.prototype.createSuccessfulResponse = function (Request, jqXHR, data) {
    return new Response({
        status: jqXHR.status,
        statusText: jqXHR.statusText,
        data: data.result,
        success: Request.getSuccessFunction(),
    })
};

AbstractAdapter.prototype.createFailResponse = function (Request, jqXHR) {
    return new Response({
        status: jqXHR.status,
        statusText: jqXHR.statusText,
        data: null,
        error: Request.getErrorFunction()
    })
};

AbstractAdapter.prototype.isSuccessfulResponse = function (data) {
    return typeof data === 'object' && +data.status > 0;
};

AbstractAdapter.prototype.sendResponse = function (Response, done) {
    if (Response.isSuccessful()) {
        if (done && 'function' === typeof done) {
            done(Response);
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