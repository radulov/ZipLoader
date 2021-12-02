'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isPromiseSuppoted = typeof Promise === 'function';
exports.default = isPromiseSuppoted ? Promise : function PromiseLike(executor) {
		_classCallCheck(this, PromiseLike);

		var callback = function callback() {};
		var resolve = function resolve() {

				callback();
		};

		executor(resolve);

		return {
				then: function then(_callback) {

						callback = _callback;
				}
		};
};