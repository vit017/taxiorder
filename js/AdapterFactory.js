var AdapterFactory = function () {

    var createAdapter = function () {
        return new Adapter();
    };

    return {
        createAdapter: createAdapter
    }

};
