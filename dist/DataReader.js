'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LITTLE_ENDIAN = true;

var _class = function () {
	function _class(buffer) {
		_classCallCheck(this, _class);

		this.dataView = new DataView(buffer);
		this.position = 0;
	}

	_createClass(_class, [{
		key: 'skip',
		value: function skip(length) {

			this.position += length;
		}
	}, {
		key: 'readBytes',
		value: function readBytes(length) {

			var type = length === 4 ? 'getUint32' : length === 2 ? 'getUint16' : 'getUint8';
			var start = this.position;
			this.position += length;
			return this.dataView[type](start, LITTLE_ENDIAN);
		}
	}]);

	return _class;
}();

exports.default = _class;