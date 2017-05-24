function TaxiOrder() {
    this.tariffs = {};
    this.from = {};
    this.to = {};
}


TaxiOrder.prototype.setParam = function (key, value) {
    if (this.hasOwnProperty(key)) {
        this[key] = value;
    }
};