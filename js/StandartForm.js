function StandartForm() {
    throw new Error('StandartForm constructor');
}

StandartForm.prototype = Object.create(AbstractForm.prototype);
StandartForm.constructor = StandartForm;

StandartForm.prototype.getFieldsEvents = function () {
    return this.fieldsRaiseEvents;
};

StandartForm.prototype.getParamsEvents = function () {
    return this.paramsEvents;
};

StandartForm.prototype.waitParamsEvents = function () {
    var
        that = this,
        fields = this.getFields(),
        paramsEvents = this.getParamsEvents();

    paramsEvents.forEach(function (field) {
        if (fields.hasOwnProperty(field)) {
            that.startListen('blur', fields[field], that.fieldChanged.bind(that, field));
        }
    });
};

StandartForm.prototype.fieldChanged = function (field, Event) {
    var
        $target = this.getEventTarget(Event);

    this.setParam(field, this.getFieldValue($target));
};

StandartForm.prototype.findTariffs = function () {
    var that = this;

    that.messenger.findTariffs(function (tariffs) {
        that.setTariffs(tariffs);
        that.showTariffs();
        that.waitTariffChange();
    });
};

StandartForm.prototype.setTariffs = function (tariffs) {
    var
        that = this,
        $documentFragment = $(document.createDocumentFragment()),
        $tariifsField = this.getTariffTarget(),
        tariffView = '';

    tariffs.forEach(function (tariff) {
        tariffView = that.createTariffTemplate(tariff);
        $documentFragment.append(tariffView);
    });

    $tariifsField.append($documentFragment);
    that.setParam('tariffID', tariffs[0].id);
};

StandartForm.prototype.waitTariffChange = function () {
    var that = this;

    that.startListen('change', that.getField('tariffID'), function (Event) {
        var
            $target = that.getEventTarget(Event),
            tariffID = +that.getFieldValue($target);

        that.setParam('tariffID', tariffID);
    });
};

StandartForm.prototype.waitGeoObjects = function () {
    var
        streetFrom = this.getField('streetFrom'),
        streetTo = this.getField('streetTo');

    this.startListen('keyup', streetFrom + ',' + streetTo, this.findGeoObjects.bind(this));
};

StandartForm.prototype.findGeoObjects = function (Event) {
    var
        that = this,
        $target = that.getEventTarget(Event),
        $autocomplete = $(that.getFieldAttr($target, 'data-autocomplete')),
        text = that.getFieldValue($target);

    that.messenger.findGeoObjects({text: text}, function (objects) {
        that.setGeoObjects($autocomplete, objects);
        that.showGeoObjects($autocomplete);
        that.waitGeoObjectClick();
    });
};

StandartForm.prototype.setGeoObjects = function ($target, objects) {
    var
        that = this,
        $fragment = $(document.createDocumentFragment()),
        objectView = '';

    $target.empty();
    objects.forEach(function (object) {
        objectView = that.createGeoObjectTemplate(object);
        $fragment.append(objectView);
    });

    $target.append($fragment);
};

StandartForm.prototype.waitGeoObjectClick = function () {
    var objectSelector = this.getGeoObjectSelector();
    this.startListen('click', objectSelector, this.geoObjectChoosen.bind(this));
};

StandartForm.prototype.afterSetParam = function (key) {
    var fieldsEvents = this.getFieldsEvents();

    if (!fieldsEvents.hasOwnProperty(key)) {
        return;
    }

    var events = fieldsEvents[key];

    events.forEach(function (event) {
        event();
    });
};

StandartForm.prototype.calculateCost = function () {
    var that = this,
        params = that.getParams();

    clearTimeout(that.calculateCost.timeout);
    that.calculateCost.timeout = setTimeout(function () {
        that.messenger.calculateCost(params, function (cost) {
            that.setCost(cost);
            that.showCost();
        });
    }, 200);
};

StandartForm.prototype.waitCreateOrder = function () {
    var that = this,
        createOrderSelector = that.getCreateOrderSelector();

    that.startListen('click', createOrderSelector, that.tryCreateOrder.bind(that));
};

StandartForm.prototype.tryCreateOrder = function (Event) {
    var that = this;

    that.preventEvent(Event);

    var $phone = $(that.getField('phone')),
        phone = that.getFieldValue($phone).trim();

    if (!phone.length) {
        $phone.addClass('error');
        return;
    }

    var $validateResultField = that.getValidateResultsField();

    $validateResultField.empty();
    that.validateParams(function (validateResult) {
        if (!validateResult.result) {
            $validateResultField.html(validateResult.html);
            return;
        }

        var successOrderCreate = that.successOrderCreate.bind(that),
            failOrderCreate = that.failOrderCreate.bind(that),
            ifAuthorize = that.createOrder.bind(that, successOrderCreate, failOrderCreate);


        that.isAuthorizedPhone(phone, ifAuthorize, that.tryAuthorize.bind(that, ifAuthorize));
    });
};

StandartForm.prototype.successOrderCreate = function (orderID) {
    this.startOrderInfo(orderID);
    this.toggleOrderInfoStep();
    this.waitCancelOrder(orderID);
};

StandartForm.prototype.waitCancelOrder = function (orderID) {
    var that = this,
        afterCancelOrder = that.afterCancelOrder.bind(that);

    that.startListen('click', that.getCancelOrderSelector(), function (Event) {
        that.preventEvent(Event);
        that.showConfirm('Отменить заказ?', that.rejectOrder.bind(that, orderID, afterCancelOrder));
    });
};

StandartForm.prototype.afterCancelOrder = function (result) {
    this.showPopup(result);
};

StandartForm.prototype.failOrderCreate = function (error) {
    this.showPopup(error.statusText);
};

StandartForm.prototype.validateParams = function (then) {
    this.messenger.validateParams(this.getParams(), then);
};

StandartForm.prototype.tryAuthorize = function (then) {
    var that = this,
        phone = that.getParam('phone');

    if (!phone.length) {
        throw new Error('Phone is required');
    }

    that.trySmsAuthorize(then);
};

StandartForm.prototype.trySmsAuthorize = function (then) {
    var that = this,
        phone = that.getParam('phone'),
        isFirstCall = that.isFirstFunctionCall(that.trySmsAuthorize);

    that.sendSms(phone, function () {
        that.toggleAuthorizationStep();
        if (isFirstCall) {
            that.setFunctionCalled(that.trySmsAuthorize);
            that.waitSendSmsAgain();
            that.waitConfirmSms(then);
        }
    });
};

StandartForm.prototype.getFunctionCounter = function () {
    return 'countCalls';
};

StandartForm.prototype.isFirstFunctionCall = function (func) {
    var counter = this.getFunctionCounter();
    return !func.hasOwnProperty(counter);
};

StandartForm.prototype.setFunctionCalled = function (func, countCalls) {
    var counter = this.getFunctionCounter();
    return func[counter] = countCalls || 1;
};

StandartForm.prototype.isAuthorizedPhone = function (phone, yes, no) {
    this.messenger.isAuthorizedPhone(phone, yes, no);
};

StandartForm.prototype.sendSms = function (phone, then) {
    var that = this;

    that.messenger.sendSms(phone, function (sendResult) {
        that.showPopup(sendResult.text);

        if (TypeHelper.isFunction(then)) {
            then();
        }
    });
};

StandartForm.prototype.waitConfirmSms = function (then) {
    var that = this;

    that.startListen('click', that.getConfirmPhoneSelector(), that.confirmSms.bind(that, then));
};

StandartForm.prototype.confirmSms = function (then) {
    var that = this,
        $smsCode = $(that.getSmsCodeSelector()),
        smsCode = that.getFieldValue($smsCode).trim(),
        phone = that.getParam('phone');

    if (!smsCode.length) {
        $smsCode.addClass('error');
        return;
    }

    var params = {
        phone: phone,
        smsCode: smsCode
    };

    that.messenger.confirmSms(params, function (confirmResult) {
        if (!confirmResult.success) {
            that.showPopup(confirmResult.text);
            return;
        }

        if (TypeHelper.isFunction(then)) {
            then();
        }
    });
};

StandartForm.prototype.waitSendSmsAgain = function () {
    var that = this;

    that.startListen('click', that.getSendSmsAgainSelector(), function (Event) {
        that.preventEvent(Event);
        var
            phone = that.getParam('phone');

        if (!phone) {
            throw new Error('phone is required');
        }

        that.sendSms(phone);
    });
};

StandartForm.prototype.createOrder = function (success, error) {
    var that = this,
        params = that.getParams();

    that.messenger.createOrder(params, success, error);
};

StandartForm.prototype.rejectOrder = function (orderID, then) {
    var that = this;

    that.messenger.rejectOrder(orderID, function (rejected) {

        if (TypeHelper.isFunction(then)) {
            then(rejected);
        }

    });
};

StandartForm.prototype.startOrderInfo = function (orderID) {
    if (!orderID) {
        throw new Error('orderID is required');
    }

    var that = this;

    that.startOrderInfo.interval = setInterval(function () {
        that.messenger.getOrderInfo(orderID, that.showOrderInfo.bind(that));
    }, 4000);
};

StandartForm.prototype.showOrderInfo = function (orderInfo) {
    console.log(orderInfo)
    //carId
    //statusLabel
};