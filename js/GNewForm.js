function GNewForm() {
    this.params = {};
    this.messenger = {};
    this.map = {};
    this.events = {};

    this.setFields();
    this.setParamsEvents();
    this.initFieldsEvents();
}

GNewForm.prototype = Object.create(StandartForm.prototype);
GNewForm.constructor = GNewForm;

GNewForm.prototype.setFields = function () {
    this.fields = {
        cityFrom: '',
        streetFrom: '#input-from-street',
        houseFrom: '#input-from-house',
        housingFrom: '#input-from-housing',
        porchFrom: '#input-from-porch',
        latFrom: '',
        lonFrom: '',
        cityTo: '',
        streetTo: '#input-to-street',
        houseTo: '#input-to-house',
        housingTo: '#input-to-housing',
        porchTo: '#input-to-porch',
        latTo: '',
        lonTo: '',
        comment: '#input-from-comment',
        phone: '#input-user-phone',
        clientName: '#input-user-name',
        tariffID: '#input-tariffs',
        orderTime: '#input-order-time'
    }
};

GNewForm.prototype.setParamsEvents = function () {
    this.paramsEvents = [
        'streetFrom',
        'houseFrom',
        'housingFrom',
        'porchFrom',
        'streetTo',
        'houseTo',
        'housingTo',
        'porchTo',
        'phone',
        'comment',
        'clientName',
        'orderTime'
    ];
};

GNewForm.prototype.initFieldsEvents = function () {
    var calculateCost = this.calculateCost.bind(this);

    this.fieldsRaiseEvents = {
        streetFrom: [calculateCost],
        houseFrom: [calculateCost],
        porchFrom: [calculateCost],
        streetTo: [calculateCost],
        houseTo: [calculateCost],
        tariffID: [calculateCost],
        orderTime: [calculateCost]
    };
};

GNewForm.prototype.getTariffTarget = function () {
    return $(this.getField('tariffID')).find('select');
};

GNewForm.prototype.createTariffTemplate = function (tariff) {
    var option = document.createElement('option');

    option.value = tariff.id;
    option.text = tariff.label;

    return option;
};

GNewForm.prototype.showTariffs = function () {
    $(this.getField('tariffID')).show();
    this.getTariffTarget().show();
};

GNewForm.prototype.createGeoObjectTemplate = function (object) {
    var
        objectCoords = object.address.location,
        li = document.createElement('li');

    li.className = 'geoobject';
    li.dataset.lat = objectCoords[0];
    li.dataset.lon = objectCoords[1];
    li.textContent = object.label;

    return li;
};

GNewForm.prototype.showGeoObjects = function ($target) {
    $target.addClass('active_autocomplete');
};

GNewForm.prototype.getGeoObjectSelector = function () {
    return '.geoobject';
};

GNewForm.prototype.geoObjectChoosen = function (Event) {
    var
        $object = this.getEventTarget(Event),
        fieldValue = $object.text(),
        direction = this.defineDirection($object),
        field = 'from' === direction ? 'streetFrom' : 'streetTo',
        paramLat = 'from' === direction ? 'latFrom' : 'latTo',
        paramLon = 'from' === direction ? 'lonFrom' : 'lonTo',
        latValue = this.getFieldAttr($object, 'data-lat'),
        lonValue = this.getFieldAttr($object, 'data-lon'),
        $street = $(this.getField(field)),
        $autocomplete = $(this.getFieldAttr($street, 'data-autocomplete'));


    this.setFieldValue($street, fieldValue);

    this.setParam(paramLat, latValue);
    this.setParam(paramLon, lonValue);
    this.setParam(field, fieldValue);

    this.map.setPointOnMap([latValue, lonValue], direction);

    this.hideGeoObjects($autocomplete);
};

GNewForm.prototype.hideGeoObjects = function ($target) {
    $target.removeClass('active_autocomplete');
};

GNewForm.prototype.setCost = function (result) {
    var $costField = $('.result-cost');

    $costField.find('.title').text('Ехать: ');
    $costField.find('.dist').text(result.length + ' км');
    $costField.find('.time').text(result.time + ' мин');
    $costField.find('.cost').text(result.cost + ' руб.');
};

GNewForm.prototype.showCost = function ($target) {

};

GNewForm.prototype.waitOrderTime = function () {
    var that = this;

    that.startListen('change', that.getField('orderTime'), function (Event) {
        var $orderTimeField = that.getEventTarget(Event);

        that.setParam('orderTime', that.getFieldValue($orderTimeField));
    });

    that.startListen('click', '.order-now', function () {
        that.setParam('orderTime', '');
    });
};

GNewForm.prototype.defineDirection = function ($target) {
    return $target.closest('.direction').attr('data-direction');
};

GNewForm.prototype.getValidateResultsField = function () {
    return $('#result-message');
};

GNewForm.prototype.getCreateOrderSelector = function () {
    return '#button-create-order';
};

GNewForm.prototype.toggleAuthorizationStep = function () {
    go_to_step(2);
};

GNewForm.prototype.toggleOrderInfoStep = function () {
    go_to_step(3);
};

GNewForm.prototype.getConfirmPhoneSelector = function () {
    return '#go_to_step3';
};

GNewForm.prototype.getSmsCodeSelector = function () {
    return '#smsCode';
};

GNewForm.prototype.getSendSmsAgainSelector = function () {
    return '.send_again';
};

GNewForm.prototype.getCancelOrderSelector = function () {
    return '';
};

GNewForm.prototype.showOrderInfoInit = function (OrderInfo) {
    var id = +OrderInfo.id;

    this.outOrderInfoField(id > 0, '#order_id', '', id);
};

GNewForm.prototype.orderIsInProcess = function (OrderInfo) {
    var isShowCost = OrderInfo.hasOwnProperty('cost') && +OrderInfo.cost;

    this.outOrderInfoField(OrderInfo.statusLabel, '#order_status', '.order_status-caption');
    this.outOrderInfoField(isShowCost, '#order_price', '.order_cost-caption', parseInt(OrderInfo.cost, 10) + ' ' + OrderInfo.costCurrency);
    this.outOrderInfoField(OrderInfo.carDescription, '#order_car', '.car_description-caption');
    this.outOrderInfoField(OrderInfo.carTime, '#order_car_time', '.car_time-caption');
    this.outOrderInfoField(OrderInfo.driverFio, '#order_driver', '.driver_fio-caption');
};

GNewForm.prototype.showOrderInfoDone = function (OrderInfo) {

};