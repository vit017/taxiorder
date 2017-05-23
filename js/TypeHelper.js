var TypeHelper = (function () {

    var gettype = function (mix) {
        return Object.prototype.toString.call(mix).slice(8, -1).toLowerCase();
    };

    var checkType = function(mix, expected) {
        return gettype(mix) === gettype(expected);
    };

    var isArray = function(mix) {
        return checkType(mix, []);
    };

    var isObject = function(mix) {
        return checkType(mix, {});
    };

    var isFunction = function(mix) {
        return checkType(mix, function(){});
    };

    var toArray = function (list) {
        var ar = (list.length === 1 ? [list[0]] : Array.apply(null, list));
        return [].concat.apply([], ar);
    };

    return {
        gettype: gettype,
        toArray: toArray,
        checkType: checkType,
        isArray: isArray,
        isObject: isObject,
        isFunction: isFunction,
    }

}());