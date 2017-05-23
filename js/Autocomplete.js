function Autocomplete(args) {
    this.selector = args.selector;
    this.content = args.content;
}

Autocomplete.prototype.getSelector = function () {
    return '' + this.selector;
};

Autocomplete.prototype.getContent = function () {
    return '' + this.content;
};

Autocomplete.prototype.setParam = function (key, value) {
    if (this.hasOwnProperty(key)) {
        this[key] = value;
    }
};

Autocomplete.prototype.setContent = function (content) {
    this.content = content;
};

Autocomplete.prototype.createContent = function (objects) {
    var li = document.createElement('li'),
        $ul = $(document.createElement('ul'));

    objects.forEach(function (object) {
        $ul.append("<li data-res='" + JSON.stringify(object) + "'>" + object.label + "</li>");
    });

    this.setContent($ul.html());
};

Autocomplete.prototype.show = function () {
    var $autocompleteTarget = $(this.getSelector()),
        content = this.getContent();

    $autocompleteTarget.html(content);

    $autocompleteTarget.addClass('active_autocomplete');
    $autocompleteTarget.parents('.di_invisible').find('.dii_step').hide();
    $autocompleteTarget.parents('.di_invisible').find('.ds_1').show();

};

Autocomplete.prototype.hide = function () {
    var $autocompleteTarget = $(this.getSelector());

    $autocompleteTarget.parents('.direction_input').find('.dii_step').hide();
    $autocompleteTarget.parents('.direction_input').find('.ds_2').show();
};