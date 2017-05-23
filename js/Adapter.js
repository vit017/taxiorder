function Adapter() {
}

Adapter.prototype.wrapTimeout = function (func, functionName, timeoutValue) {
    clearTimeout(this[functionName].timeOut);
    this[functionName].timeOut = setTimeout(func, timeoutValue);
};

Adapter.prototype.findTariffs = function (success, error) {

    this.sendRequest(new Request({
        url: '/api_integration/index_client.php?command=findTariffs',
        params: {},
        success: success,
        error: error
    }));

};

Adapter.prototype.findGeoObjects = function (clientParams, success, error) {

    var that = this;
    this.wrapTimeout(function () {
        var params = {
            streetPart: clientParams.text,
            city: clientParams.city || '',
            maxLimit: clientParams.results || 10,
            type: clientParams.type || ''
        };

        that.sendRequest(new Request({
            url: '/api_integration/index_client.php?command=findGeoObjects',
            params: params,
            success: success,
            error: error
        }));
    }, 'findGeoObjects', 400);

};

Adapter.prototype.sendRequest = function (Request) {
    var that = this,
        ClientResponse = {};

    $.ajax({
        url: Request.getUrl(),
        type: Request.getMethod(),
        data: Request.getParams(),
        dataType: Request.getDataType()
    }).done(function (data, textStatus, jqXHR) {
        ClientResponse = new Response({
            status: jqXHR.status,
            statusText: jqXHR.statusText,
            success: Request.getSuccessFunction(),
            error: Request.getErrorFunction()
        });
        ClientResponse.setParam('data', (data ? data.result : data));

    }).fail(function (jqXHR, textStatus, errorThrown) {

        ClientResponse = new Response({
            status: jqXHR.status,
            statusText: jqXHR.statusText || errorThrown,
            data: null,
            success: Request.getSuccessFunction(),
            error: Request.getErrorFunction()
        });

    }).always(function () {

        that.sendResponse(ClientResponse);

    });
};

Adapter.prototype.sendResponse = function (ClientResponse) {
    if (ClientResponse.isSuccessful()) {
        ClientResponse.getSuccessFunction()(ClientResponse.getData());
    }
    else {
        ClientResponse.getErrorFunction()({
            status: ClientResponse.getStatus(),
            message: ClientResponse.getStatusText()
        });
    }
};