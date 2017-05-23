var OrderAdapter = AdapterFactory().createAdapter(),
    Form = new OrderForm(),
    Order = new TaxiOrder();

console.log(OrderAdapter);
console.log(OrderForm);


OrderAdapter.findTariffs(function (tariffs) {
    console.log('success');
    console.log(tariffs);
}, function (error) {
    console.log('error');
    console.log(error);
});


Form.addEvent('keyup', '#FIELD_FROM_STREET, #FIELD_TO_STREET', function (Event) {
    var $targetStreet = Form.getEventTarget(Event);

    OrderAdapter.findGeoObjects({
            text: $targetStreet.val()
        },
        function (foundedObjects) {
            var autocompleteSelector = $targetStreet.attr('data-autocomplete');

            var OrderAutocomplete = new Autocomplete({
                selector: autocompleteSelector
            });

            OrderAutocomplete.createContent(foundedObjects);
            OrderAutocomplete.show();

            Form.addEvent('click', autocompleteSelector, function (Event) {
                var $autocompleteItem = Form.getEventTarget(Event);

                Form.setFieldValue($targetStreet, $autocompleteItem.text());
                OrderAutocomplete.hide();

                Order.setParam($targetStreet.attr('data-order-param'), JSON.parse($autocompleteItem.attr('data-res')));
                console.log(Order);
            });

        }, function (error) {
            console.log('error');
            console.log(error);
        });
});