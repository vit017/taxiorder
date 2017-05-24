var AdapterFactory = function () {

    var createAdapter = function () {
        return new AdapterTaxiMaster();
    };

    var createForm = function () {
        return new Form();
    };

    return {
        createAdapter: createAdapter,
        createForm: createForm
    }

};
