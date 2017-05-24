function TaxiMasterAdapter() {
    this.url = '/api_integration/index_client.php?command=';
}
TaxiMasterAdapter.prototype = Object.create(AbstractAdapter.prototype);
TaxiMasterAdapter.constructor = TaxiMasterAdapter;


TaxiMasterAdapter.prototype.calculateCost = function (clientParams, success, error) {
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
        url: that.url + 'callCost',
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