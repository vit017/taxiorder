function DemoNewForm() {
    this.params = {};
    this.messenger = {};
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
        tariffs: '#FIELD_TARIFFS',
        cost: '#RESULT_COST_SUM'
    }
}

DemoNewForm.prototype = Object.create(AbstractForm.prototype);
DemoNewForm.constructor = DemoNewForm;

DemoNewForm.prototype.waitFieldsEvents = function () {
    var
        that = this,
        fields = this.getFields(),
        addressFields = [
            'streetFrom',
            'houseFrom',
            'porchFrom',
            'streetTo',
            'houseTo',
            'phone',
            'comment'
        ];

    addressFields.forEach(function (field) {
        if (fields.hasOwnProperty(field)) {
            that.startListen('blur', fields[field], that.fieldChanged.bind(that, field));
        }
    });
};

DemoNewForm.prototype.fieldChanged = function (field, Event) {
    var
        that = this,
        $target = this.getEventTarget(Event);

    this.setParam(field, that.getFieldValue($target));
    this.calculateCost(Event);
};

DemoNewForm.prototype.findTariffs = function () {
    var
        $target = $(this.getField('tariffs'));

    this.messenger.findTariffs(function (tariffs) {
        this.setTariffs($target, tariffs);
        this.showTariffs($target);
        this.waitTariffChange();
    }.bind(this));
};

DemoNewForm.prototype.setTariffs = function ($target, tariffs) {
    var
        $documentFragment = $(document.createDocumentFragment()),
        option = {};

    tariffs.forEach(function (tariff) {
        option = document.createElement('option');
        option.value = tariff.id;
        option.text = tariff.label;
        $documentFragment.append(option);
    });

    $target.append($documentFragment);
};

DemoNewForm.prototype.showTariffs = function ($target) {
    $target.show();
};

DemoNewForm.prototype.waitTariffChange = function () {
    this.startListen('change', this.getField('tariffs'), function (Event) {
        this.calculateCost();
    }.bind(this));
};

DemoNewForm.prototype.calculateCost = function (Event) {
    var
        that = this,
        $target = $(this.getField('cost'));

    setTimeout(function() {
        that.messenger.calculateCost(that.params, function (cost) {
            that.setCost($target, cost);
            that.showCost($target);
        }.bind(that), function(e) {
            console.error(e)
        });
    }, 200);
};

DemoNewForm.prototype.setCost = function ($target, cost) {
    console.log(cost);
};

DemoNewForm.prototype.showCost = function ($target) {

};

DemoNewForm.prototype.waitGeoObjects = function () {
    var
        streetFrom = this.getField('streetFrom'),
        streetTo = this.getField('streetTo');

    this.startListen('keyup', streetFrom + ',' + streetTo, this.findGeoObjects.bind(this));
};

DemoNewForm.prototype.findGeoObjects = function (Event) {
    var
        $target = this.getEventTarget(Event),
        text = this.getFieldValue($target),
        $autocomplete = $(this.getFieldAttr($target, 'data-autocomplete'));

    this.messenger.findGeoObjects({text: text}, function (objects) {
        this.setGeoObjects($autocomplete, objects);
        this.showGeoObjects($autocomplete);
        this.waitGeoObjectClick();
    }.bind(this));
};

DemoNewForm.prototype.setGeoObjects = function ($target, objects) {
    var
        $fragment = $(document.createDocumentFragment());

    objects.forEach(function (object) {
        $fragment.append("<li class='geoobject' data-res='" + JSON.stringify(object) + "'>" + object.label + "</li>");
    });

    $target.append($fragment);
};

DemoNewForm.prototype.showGeoObjects = function ($target) {
    $target.addClass('active_autocomplete');
    $target.parents('.di_invisible').find('.dii_step').hide();
    $target.parents('.di_invisible').find('.ds_1').show();
};

DemoNewForm.prototype.waitGeoObjectClick = function () {
    this.startListen('click', '.geoobject', this.geoObjectChoosen.bind(this));
};

DemoNewForm.prototype.geoObjectChoosen = function (Event) {
    var
        $object = this.getEventTarget(Event),
        objectAddress = JSON.parse(this.getFieldAttr($object, 'data-res')),
        direction = this.defineDirection($object),
        field = 'from' === direction ? 'streetFrom' : 'streetTo',
        $street = $(this.getField(field)),
        $autocomplete = $(this.getFieldAttr($street, 'data-autocomplete'));

    this.setFieldValue($street, $object.text());
    this.setParam(field, objectAddress.address.street);
    
    this.hideGeoObjects($autocomplete);
};

DemoNewForm.prototype.hideGeoObjects = function ($target) {
    $target.parents('.direction_input').find('.dii_step').hide();
    $target.parents('.direction_input').find('.ds_2').show();
};

DemoNewForm.prototype.defineDirection = function ($target) {
    return $target.closest('.direction_input').attr('data-direction');
};

