
var Form = AdapterFactory().createForm(),
    adapter = AdapterFactory().createAdapter();

Form.setMessenger(adapter);
Form.findTariffs();

Form.startListen('change', '#FIELD_TARIFFS', function(Event) {
    var $target = Form.getEventTarget(Event);
    Form.changeTariff($target.val());
});

Form.startListen('keyup', '.autocomplete-field', function(Event) {
    Form.findGeoObjects(Event);
});

Form.startListen('click', '.geoobject', function(Event) {
    Form.changeAddress(Event);
});

Form.startListen('click', '#order-time', function(Event) {
    Form.changeOrderTime(Event);
});

Form.startListen('click', '.order_now button', function(Event) {
    Form.checkAddressesStep(Event);
});

Form.startListen('click', '.ofs_sms_input', function(Event) {
    Form.checkPhoneStep(Event);
});