function TaxiOrder() {

}
TaxiOrder.prototype.constructor = TaxiOrder;

TaxiOrder.prototype.doRequest = function (method) {
    var self = this;

    return new Promise(function (resolve, reject) {
        $.ajax({
            async: (typeof(method.async) !== 'undefined') ? method.async : true,
            url: self.config.request.ajaxClientUrl + '?command=' + method.name,
            type: self.config.request['method'],
            timeout: (typeof(method.timeout) !== 'undefined') ? method.timeout : self.config.request.timeout,
            data: (typeof(method.params) !== 'undefined') ? method.params : false,
            dataType: self.config.request.dataType,
        }).done(function (response) {
            if (response === null || (response.hasOwnProperty('errorCode') && response.errorCode))
                reject(response);
            else if (response.hasOwnProperty('status') && response.status > 0)
                resolve(response.result);

        }).fail(function (response) {
            reject(response);
        });
    });
}