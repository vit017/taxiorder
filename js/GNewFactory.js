function GNewFactory() {

}

GNewFactory.prototype.createMessenger = function() {
    return new GootaxAdapter();
};

GNewFactory.prototype.createForm = function() {
    return new GNewForm();
};

GNewFactory.prototype.createMap = function() {
    return new GNewMap();
};

GNewFactory.prototype.createTemplate = function() {
    return new GNewTemplate();
};