var $body = $('body');

function Form() {

}

Form.prototype.setMessenger = function (messenger) {
    this.messenger = messenger;
};

Form.prototype.getEventTarget = function (Event) {
    return $(Event.target);
};

Form.prototype.startListen = function (eventType, selector, handler) {
    $body.on(eventType, selector, handler);
};

Form.prototype.stopListen = function (eventType, selector, handler) {
    $body.off(eventType, selector, handler);
};

Form.prototype.defineDirection = function (Event) {
    var $target = this.getEventTarget(Event);
    return $target.closest('.direction_input').attr('data-direction');
};

Form.prototype.findTariffs = function () {
    var that = this;
    this.messenger.findTariffs(function (tariffs) {
        that.tariffs = tariffs;
        that.setTariff(tariffs[0].id);
        that.showTariffs(tariffs);
    }, function (e) {
        console.log(e);
    });
};

Form.prototype.setTariff = function (tariffID) {
    var
        that = this,
        paramsTariff = +tariffID,
        tariffs = this.tariffs;

    tariffs.forEach(function (tariff, i) {
        if (+tariff.id === paramsTariff) {
            that.tariff = tariffs[i];
        }
    });
};

Form.prototype.showTariffs = function (tariffs) {
    var $tariffsField = $('#FIELD_TARIFFS'),
        $documentFragment = $(document.createDocumentFragment()),
        option = {};

    tariffs.forEach(function (tariff) {
        option = document.createElement('option');
        option.value = tariff.id;
        option.text = tariff.label;
        $documentFragment.append(option);
    });

    $tariffsField.append($documentFragment);
    $tariffsField.show();
};

Form.prototype.changeTariff = function (tariffID) {
    this.setTariff(tariffID);
};

Form.prototype.findGeoObjects = function (Event) {
    var
        that = this,
        $target = this.getEventTarget(Event),
        fieldSelector = 'from' === this.defineDirection(Event) ? '#FIELD_FROM_AUTOCOMPLETE_STREET' : '#FIELD_TO_AUTOCOMPLETE_STREET';

    this.messenger.findGeoObjects({text: $target.val()}, function (geoObjects) {
        that.showGeoObjects(geoObjects, fieldSelector);
    }, function () {

    });
};

Form.prototype.showGeoObjects = function (objects, selector) {
    var
        $documentFragment = $(document.createDocumentFragment()),
        li = {},
        $target = $(document.querySelector(selector));

    objects.forEach(function (object) {
        li = document.createElement('li');
        $documentFragment.append("<li class='geoobject' data-res='" + JSON.stringify(object) + "'>" + object.label + "</li>");
    });

    $target.append($documentFragment);
    $target.show();
    $target.addClass('active_autocomplete');
    $target.parents('.di_invisible').find('.dii_step').hide();
    $target.parents('.di_invisible').find('.ds_1').show();
};

Form.prototype.changeAddress = function(Event) {
    var $target = this.getEventTarget(Event),
        objectGeoInfo = JSON.parse($target.attr('data-res')),
        direction = this.defineDirection(Event);

    this.setAddress(direction, objectGeoInfo.address);
    console.log(this)
};

Form.prototype.setAddress = function(direction, address) {
    if (!this[direction]) {
        this[direction] = {};
    }
    this[direction] = address;
};