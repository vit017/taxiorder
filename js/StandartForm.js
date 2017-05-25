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
    var
        params = this.getParams(),
        $target = $(this.getField('cost'));

    clearTimeout(this.calculateCost.timeout);
    this.calculateCost.timeout = setTimeout(function () {
        this.messenger.calculateCost(params, function (cost) {
            this.setCost($target, cost);
            this.showCost($target);
        }.bind(this), function (e) {
            console.error(e)
        });
    }.bind(this), 200);
};

StandartForm.prototype.waitCreateOrder = function () {
    var that = this,
        $createOrderButton = that.getCreateOrderButton();

    that.startListen('click', $createOrderButton, function (Event) {
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

            that.tryAuthorize(phone, function () {
                that.createOrder();
            });

        });

    });
};

StandartForm.prototype.validateParams = function (then) {
    this.messenger.validateParams(this.getParams(), then);
};

StandartForm.prototype.tryAuthorize = function (phone, then) {
    if (!phone.length) {
        throw new Error('Phone is required');
    }

    var that = this;
    that.isAuthorizedPhone(phone, then, function () {
        that.sendSms(phone, function () {
            that.toggleAuthorizationStep();
            that.waitConfirmSms(then);
            that.waitSendSmsAgain();
        });
    });
};

StandartForm.prototype.isAuthorizedPhone = function (phone, yes, no) {
    this.messenger.isAuthorizedPhone(phone, yes, no);
};

StandartForm.prototype.sendSms = function (phone, then) {
    var that = this;

    that.messenger.sendSms(phone, function (sendResult) {
        if (!sendResult.success) {
            that.showPopup(sendResult.text);
            return;
        }

        if (TypeHelper.isFunction(then)) {
            then();
        }
    });
};

StandartForm.prototype.waitConfirmSms = function (then) {
    var that = this;

    that.startListen('click', that.getConfirmPhoneButton(), function (Event) {
        that.preventEvent(Event);

        var $smsCode = that.getSmsCodeField(),
            smsCode = that.getFieldValue($smsCode).trim(),
            phone = that.getParam('phone');

        if (!smsCode.length) {
            $smsCode.addClass('error');
            return;
        }

        that.confirmSms(phone, smsCode, then);
    });
};

StandartForm.prototype.confirmSms = function (phone, smsCode, then) {
    var that = this,
        params = {
            phone: phone,
            smsCode: smsCode
        };

    that.messenger.confirmSms(params, function (confirmResult) {
        if (!confirmResult.success) {
            that.showPopup(confirmResult.text);
            return;
        }

        that.messenger.setAuthorizedPhone(confirmResult, then);
    });
};

StandartForm.prototype.waitSendSmsAgain = function () {
    var that = this;

    this.startListen('click', this.getSendSmsAgainButton(), function (Event) {
        that.preventEvent(Event);
        var
            phone = that.getParam('phone');

        if (!phone) {
            throw new Error('phone is required');
        }

        that.sendSms(phone);
    });
};

StandartForm.prototype.createOrder = function () {
    var that = this,
        params = this.getParams();

    that.messenger.createOrder(params, function (orderResult) {
        var orderID = +orderResult;

        if (orderID > 0) {
            that.startOrderInfo(orderID);
            that.toggleOrderInfoStep();
        }
    });
};

StandartForm.prototype.rejectOrder = function (orderID) {
    var that = this;

    that.messenger.rejectOrder(orderID, function (rejected) {

        that.showPopup(rejected);

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