var AdapterFactory = function () {

    var createAdapter = function () {
        return new Adapter();
    };

    var createForm = function () {
        return new Form();
    };

    return {
        createAdapter: createAdapter,
        createForm: createForm
    }

};
