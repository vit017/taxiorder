function DemoNewForm() {
    this.params = {};
    this.messenger = {};
    this.events = {};

    this.setFields();
    this.setParamsEvents();
    this.initFieldsEvents();
}

DemoNewForm.prototype = Object.create(StandartForm.prototype);
DemoNewForm.constructor = DemoNewForm;

DemoNewForm.prototype.setFields = function () {
    this.fields = {
        cityFrom: '',
        streetFrom: '#FIELD_FROM_STREET',
        autocompleteFrom: '#FIELD_FROM_AUTOCOMPLETE_STREET',
        houseFrom: '#FIELD_FROM_HOUSE',
        porchFrom: '#FIELD_FROM_PORCH',
        cityTo: '',
        streetTo: '#FIELD_TO_STREET',
        autocompleteTo: '#FIELD_TO_AUTOCOMPLETE_STREET',
        houseTo: '#FIELD_TO_HOUSE',
        comment: '#FIELD_FROM_COMMENT',
        phone: '#FIELD_PHONE',
        tariffID: '#FIELD_TARIFFS',
        cost: '#RESULT_COST_SUM',
        orderTime: '#FIELD_TIME',
    };
};

DemoNewForm.prototype.setParamsEvents = function () {
    this.paramsEvents = [
        'streetFrom',
        'houseFrom',
        'porchFrom',
        'streetTo',
        'houseTo',
        'phone',
        'comment'
    ];
};

DemoNewForm.prototype.initFieldsEvents = function () {
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

DemoNewForm.prototype.getTariffTarget = function () {
    return $(this.getField('tariffID'));
};

DemoNewForm.prototype.createTariffTemplate = function (tariff) {
    var option = document.createElement('option');
    option.value = tariff.id;
    option.text = tariff.label;

    return option;
};

DemoNewForm.prototype.showTariffs = function () {
    this.getTariffTarget().show();
};

DemoNewForm.prototype.createGeoObjectTemplate = function (object) {
    var li = document.createElement('li'),
        text = object.label;

    li.className = 'geoobject';
    li.dataset.res = text;
    li.textContent = text;

    return li;
};

DemoNewForm.prototype.showGeoObjects = function ($target) {
    $target.addClass('active_autocomplete');
    $target.parents('.di_invisible').find('.dii_step').hide();
    $target.parents('.di_invisible').find('.ds_1').show();
};

DemoNewForm.prototype.getGeoObjectSelector = function () {
    return '.geoobject';
};

DemoNewForm.prototype.geoObjectChoosen = function (Event) {
    var
        $object = this.getEventTarget(Event),
        fieldValue = $object.text(),
        direction = this.defineDirection($object),
        field = 'from' === direction ? 'streetFrom' : 'streetTo',
        $street = $(this.getField(field)),
        $autocomplete = $(this.getFieldAttr($street, 'data-autocomplete'));

    this.setFieldValue($street, fieldValue);
    this.setParam(field, fieldValue);

    this.hideGeoObjects($autocomplete);
};

DemoNewForm.prototype.hideGeoObjects = function ($target) {
    $target.parents('.direction_input').find('.dii_step').hide();
    $target.parents('.direction_input').find('.ds_2').show();
};

DemoNewForm.prototype.setCost = function ($target, cost) {
    console.log(cost);
};

DemoNewForm.prototype.showCost = function ($target) {

};

DemoNewForm.prototype.waitOrderTime = function () {
    var that = this;

    that.startListen('click', '.time_selector button', function (Event) {
        var $target = that.getEventTarget(Event),
            orderTime = $target.parent().find('option:selected').html() + ' ' + $target.parent().find('input[type="time"]').val() + ':00';

        that.setParam('orderTime', orderTime);
    });

    that.startListen('click', '.tm_selector label', function (Event) {
        var $target = that.getEventTarget(Event),
            dataAttribute = parseInt(that.getFieldAttr($target, 'data-time'), 10);

        if (!isFinite(dataAttribute)) {
            return;
        }

        var
            orderTime = '',
            now = new Date();

        if (dataAttribute) {
            now.setMinutes(now.getMinutes() + dataAttribute);
            orderTime = that.messenger.formatOrderTime(now);
        }

        that.setParam('orderTime', orderTime);
    });
};

DemoNewForm.prototype.defineDirection = function ($target) {
    return $target.closest('.direction_input').attr('data-direction');
};

DemoNewForm.prototype.getValidateResultsField = function () {
    return $('#result-message');
};

DemoNewForm.prototype.getCreateOrderSelector = function () {
    return '#BUTTON_CREATE_ORDER';
};

DemoNewForm.prototype.toggleAuthorizationStep = function () {
    go_to_step(3);
};

DemoNewForm.prototype.toggleOrderInfoStep = function () {
    go_to_step(4);
};

DemoNewForm.prototype.getConfirmPhoneSelector = function () {
    return '#BUTTON_SMS';
};

DemoNewForm.prototype.getSmsCodeSelector = function () {
    return '#FIELD_SMS';
};

DemoNewForm.prototype.getSendSmsAgainSelector = function () {
    return '.send_again';
};

DemoNewForm.prototype.getCancelOrderSelector = function () {
    return '.reject_order';
};

DemoNewForm.prototype.showOrderInfo = function (orderInfo) {
    console.log(orderInfo)
    //carId
    //statusLabel
};