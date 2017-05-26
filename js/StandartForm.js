function StandartForm() {
    throw new Error('StandartForm constructor');
}

StandartForm.prototype = Object.create(AbstractForm.prototype);
StandartForm.constructor = StandartForm;

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

StandartForm.prototype.getParamsEvents = function () {
    return this.paramsEvents;
};

StandartForm.prototype.fieldChanged = function (field, Event) {
    var $target = this.getEventTarget(Event);

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

    fieldsEvents[key].forEach(function (event) {
        event();
    });
};

StandartForm.prototype.getFieldsEvents = function () {
    return this.fieldsRaiseEvents;
};

StandartForm.prototype.calculateCost = function () {
    var
        that = this,
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
    var
        that = this,
        createOrderSelector = that.getCreateOrderSelector();

    that.startListen('click', createOrderSelector, that.tryCreateOrder.bind(that));
};

StandartForm.prototype.tryCreateOrder = function (Event) {
    this.preventEvent(Event);

    var
        that = this,
        $phone = $(that.getField('phone')),
        phone = that.getFieldValue($phone).trim();

    if (!phone.length) {
        $phone.addClass('error');
        return;
    }

    var $validateResultField = that.getValidateResultsField();

    $validateResultField.empty();
    that.validateParams(function (validateResult) {
        if (!validateResult.result) {
            that.setFieldValue($validateResultField, validateResult.html);
            return;
        }

        var
            successOrderCreate = that.successOrderCreate.bind(that),
            failOrderCreate = that.failOrderCreate.bind(that),

            ifAuthorize = that.createOrder.bind(that, successOrderCreate, failOrderCreate),
            ifNotAuthorize = that.tryAuthorize.bind(that, ifAuthorize);


        that.isAuthorizedPhone(phone, ifAuthorize, ifNotAuthorize);
    });
};

StandartForm.prototype.validateParams = function (then) {
    this.messenger.validateParams(this.getParams(), then);
};

StandartForm.prototype.isAuthorizedPhone = function (phone, yes, no) {
    this.messenger.isAuthorizedPhone(phone, yes, no);
};

StandartForm.prototype.createOrder = function (success, error) {
    var
        that = this,
        params = that.getParams();

    that.messenger.createOrder(params, success, error);
};

StandartForm.prototype.successOrderCreate = function (orderID) {
    var cookieOrderName = this.messenger.getCookieForOrder();
    this.messenger.setCookie({
        name: cookieOrderName,
        value: orderID
    });

    this.initOrderInfoProcessing(orderID);
};

StandartForm.prototype.failOrderCreate = function (error) {
    this.showPopup(error.statusText);
};

StandartForm.prototype.initOrderInfoProcessing = function (orderID) {
    this.waitCancelOrder(orderID);
    this.startOrderInfoProcess(orderID);
    this.toggleOrderInfoStep();
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

StandartForm.prototype.rejectOrder = function (orderID, then) {
    var that = this;

    that.messenger.rejectOrder(orderID, function (rejected) {

        if (TypeHelper.isFunction(then)) {
            then(rejected);
        }

    });
};

StandartForm.prototype.startOrderInfoProcess = function (orderID) {
    if (!orderID) {
        throw new Error('orderID is required');
    }

    var that = this,
        messenger = that.messenger;


    messenger.getOrderInfo(orderID, that.showOrderInfo.bind(that));

    that.startOrderInfoProcess.interval = setInterval(function () {
        messenger.getOrderInfo(orderID, that.showOrderInfo.bind(that));
    }, 4000);
};

StandartForm.prototype.showOrderInfo = function (OrderInfo) {
    var that = this,
        messenger = this.messenger;

    if (messenger.orderIsNew(OrderInfo)) {
        that.showOrderInfoInit(OrderInfo);
    }

    else if (messenger.orderIsDone(OrderInfo)) {
        that.showOrderInfoDone(OrderInfo);
        clearInterval(that.startOrderInfoProcess.interval);
        messenger.removeCookie(messenger.getCookieForOrder());
    }

    that.orderIsInProcess(OrderInfo);
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

StandartForm.prototype.isFirstFunctionCall = function (func) {
    var counter = this.getFunctionCounter();
    return !func.hasOwnProperty(counter);
};

StandartForm.prototype.getFunctionCounter = function () {
    return 'countCalls';
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

StandartForm.prototype.setFunctionCalled = function (func, countCalls) {
    var counter = this.getFunctionCounter();
    func[counter] = countCalls || 1;
};

StandartForm.prototype.waitSendSmsAgain = function (then) {
    var that = this;

    that.startListen('click', that.getSendSmsAgainSelector(), function (Event) {
        that.preventEvent(Event);

        var phone = that.getParam('phone');
        that.sendSms(phone, then);
    });
};

StandartForm.prototype.waitConfirmSms = function (then) {
    var that = this;

    that.startListen('click', that.getConfirmPhoneSelector(), that.confirmSms.bind(that, then));
};

StandartForm.prototype.confirmSms = function (then) {
    var
        that = this,
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

StandartForm.prototype.checkOrderExists = function () {
    var
        cookieOrderName = this.messenger.getCookieForOrder(),
        orderID = +this.messenger.getCookie(cookieOrderName);

    
    if (orderID) {
        this.restoreOrder(orderID);
    }
};

StandartForm.prototype.restoreOrder = function (orderID) {
    this.initOrderInfoProcessing(orderID);
};

StandartForm.prototype.outOrderInfoField = function (condition, fieldSelector, captionSelector, data) {
    var showValue = data ? data : condition;

    if (condition) {
        $(fieldSelector).html(showValue);
        $(fieldSelector).show();
        $(captionSelector).show();
    }
    else {
        $(fieldSelector).hide();
        $(captionSelector).hide();
    }
};