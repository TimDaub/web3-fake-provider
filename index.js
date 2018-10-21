// From: https://github.com/ethereum/web3.js/blob/1.0/test/helpers/FakeHttpProvider.js

var chai = require('chai');
var assert = require('assert');

countId = 1;

/**
 * Returns true if object is Objet, otherwise false
 *
 * @method isObject
 * @param {Object}
 * @return {Boolean}
 */
var isObject = function (object) {
    return object !== null && !(Array.isArray(object)) && typeof object === 'object';
};

/**
 * Returns true if object is array, otherwise false
 *
 * @method isArray
 * @param {Object}
 * @return {Boolean}
 */
var isArray = function (object) {
    return Array.isArray(object);
};

/**
 * Returns true if object is function, otherwise false
 *
 * @method isFunction
 * @param {Object}
 * @return {Boolean}
 */
var isFunction = function (object) {
    return typeof object === 'function';
};


var getResponseStub = function () {
    return {
        jsonrpc: '2.0',
        id: countId++,
        result: null
    };
};

var getErrorStub = function () {
    return {
        jsonrpc: '2.0',
        countId: countId++,
        error: {
            code: 1234,
            message: 'Stub error'
        }
    };
};

var FakeHttpProvider = function () {
    this.response = getResponseStub();
    this.error = null;
    this.validation = null;
};

FakeHttpProvider.prototype.send = function (payload) {
    assert.equal(isArray(payload) || isObject(payload), true);
    // TODO: validate jsonrpc request
    if (this.error) {
        throw this.error;
    } 
    if (this.validation) {
        // imitate plain json object
        this.validation(JSON.parse(JSON.stringify(payload)));
    }

    return this.getResponse(payload);
};

FakeHttpProvider.prototype.sendAsync = function (payload, callback) {
    assert.equal(isArray(payload) || isObject(payload), true);
    assert.equal(isFunction(callback), true);
    if (this.validation) {
        // imitate plain json object
        this.validation(JSON.parse(JSON.stringify(payload)), callback);
    }

    var response = this.getResponse(payload);
    var error = this.error;
    setTimeout(function(){
        callback(error, response);
    }, 1);
};

FakeHttpProvider.prototype.injectResponse = function (response) {
    this.response = response;
};

FakeHttpProvider.prototype.injectResult = function (result) {
    this.response = getResponseStub();
    this.response.result = result;
};

FakeHttpProvider.prototype.injectBatchResults = function (results, error) {
    this.response = results.map(function (r) {
        if(error) {
            var response = getErrorStub();
            response.error.message = r;
        } else {
            var response = getResponseStub();
            response.result = r;
        }
        return response;
    }); 
};

FakeHttpProvider.prototype.getResponse = function (payload) {

    if(this.response) {
        if(isArray(this.response)) {
            this.response = this.response.map(function(response, index) {
                response.id = payload[index] ? payload[index].id : countId++;
                return response;
            });
        } else
            this.response.id = payload.id;
    }

    return this.response;
};

FakeHttpProvider.prototype.injectError = function (error) {
    this.error = error;
};

FakeHttpProvider.prototype.injectValidation = function (callback) {
    this.validation = callback;
};

module.exports = FakeHttpProvider;

