'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _parseZip = require('./parseZip.js');

var _parseZip2 = _interopRequireDefault(_parseZip);

var _PromiseLike = require('./PromiseLike.js');

var _PromiseLike2 = _interopRequireDefault(_PromiseLike);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var count = 0;
var THREE = void 0;

var ZipLoader = function () {
		_createClass(ZipLoader, null, [{
				key: 'unzip',
				value: function unzip(blobOrFile) {

						return new _PromiseLike2.default(function (resolve) {

								var instance = new ZipLoader();
								var fileReader = new FileReader();

								fileReader.onload = function (event) {

										var arrayBuffer = event.target.result;
										instance.files = (0, _parseZip2.default)(arrayBuffer);
										resolve(instance);
								};

								if (blobOrFile instanceof Blob) {

										fileReader.readAsArrayBuffer(blobOrFile);
								}
						});
				}
		}]);

		function ZipLoader(url) {
				_classCallCheck(this, ZipLoader);

				this._id = count;
				this._listeners = {};
				this.url = url;
				this.files = null;
				count++;
		}

		_createClass(ZipLoader, [{
				key: 'load',
				value: function load() {
						var _this = this;

						return new _PromiseLike2.default(function (resolve) {

								var startTime = Date.now();
								var xhr = new XMLHttpRequest();
								xhr.open('GET', _this.url, true);
								xhr.responseType = 'arraybuffer';

								xhr.onprogress = function (e) {

										_this.dispatch({
												type: 'progress',
												loaded: e.loaded,
												total: e.total,
												elapsedTime: Date.now() - startTime
										});
								};

								xhr.onload = function () {

										_this.files = (0, _parseZip2.default)(xhr.response);
										_this.dispatch({
												type: 'load',
												elapsedTime: Date.now() - startTime
										});
										resolve();
								};

								xhr.onerror = function (event) {

										_this.dispatch({
												type: 'error',
												error: event
										});
								};

								xhr.send();
						});
				}
		}, {
				key: 'extractAsBlobUrl',
				value: function extractAsBlobUrl(filename, type) {

						if (this.files[filename].url) {

								return this.files[filename].url;
						}

						var blob = new Blob([this.files[filename].buffer], { type: type });
						this.files[filename].url = URL.createObjectURL(blob);
						return this.files[filename].url;
				}
		}, {
				key: 'extractAsText',
				value: function extractAsText(filename) {

						var buffer = this.files[filename].buffer;

						if (typeof TextDecoder !== 'undefined') {

								return new TextDecoder().decode(buffer);
						}

						var str = '';

						for (var i = 0, l = buffer.length; i < l; i++) {

								str += String.fromCharCode(buffer[i]);
						}

						return decodeURIComponent(escape(str));
				}
		}, {
				key: 'extractAsJSON',
				value: function extractAsJSON(filename) {

						return JSON.parse(this.extractAsText(filename));
				}
		}, {
				key: 'loadThreeJSON',
				value: function loadThreeJSON(filename) {
						var _this2 = this;

						var json = this.extractAsJSON(filename);
						var dirName = filename.replace(/\/.+\.json$/, '/');
						var pattern = '__ziploader_' + this._id + '__';
						var regex = new RegExp(pattern);

						if (!THREE.Loader.Handlers.handlers.indexOf(regex) !== -1) {

								THREE.Loader.Handlers.add(regex, {
										load: function load(filename) {

												return _this2.loadThreeTexture(filename.replace(regex, ''));
										}
								});
						}

						return THREE.JSONLoader.prototype.parse(json, pattern + dirName);
				}
		}, {
				key: 'loadThreeTexture',
				value: function loadThreeTexture(filename) {

						var texture = new THREE.Texture();
						var type = /\.jpg$/.test(filename) ? 'image/jpeg' : /\.png$/.test(filename) ? 'image/png' : /\.gif$/.test(filename) ? 'image/gif' : undefined;
						var blob = new Blob([this.files[filename].buffer], { type: type });

						var onload = function onload() {

								texture.needsUpdate = true;
								texture.image.removeEventListener('load', onload);
								URL.revokeObjectURL(texture.image.src);
						};

						texture.image = new Image();
						texture.image.addEventListener('load', onload);
						texture.image.src = URL.createObjectURL(blob);
						return texture;
				}
		}, {
				key: 'on',
				value: function on(type, listener) {

						if (!this._listeners[type]) {

								this._listeners[type] = [];
						}

						if (this._listeners[type].indexOf(listener) === -1) {

								this._listeners[type].push(listener);
						}
				}
		}, {
				key: 'off',
				value: function off(type, listener) {

						var listenerArray = this._listeners[type];

						if (!!listenerArray) {

								var index = listenerArray.indexOf(listener);

								if (index !== -1) {

										listenerArray.splice(index, 1);
								}
						}
				}
		}, {
				key: 'dispatch',
				value: function dispatch(event) {

						var listenerArray = this._listeners[event.type];

						if (!!listenerArray) {

								event.target = this;
								var length = listenerArray.length;

								for (var i = 0; i < length; i++) {

										listenerArray[i].call(this, event);
								}
						}
				}
		}, {
				key: 'clear',
				value: function clear(filename) {

						if (!!filename) {

								URL.revokeObjectURL(this.files[filename].url);
								delete this.files[filename];
								return;
						}

						for (var key in this.files) {

								URL.revokeObjectURL(this.files[key].url);
						}

						delete this.files;

						if (!!THREE) {

								var pattern = '__ziploader_' + this._id + '__';

								THREE.Loader.Handlers.handlers.some(function (el, i) {

										if (el instanceof RegExp && el.source === pattern) {

												THREE.Loader.Handlers.handlers.splice(i, 2);
												return true;
										}
								});
						}
				}
		}], [{
				key: 'install',
				value: function install(option) {

						if (!!option.THREE) {

								THREE = option.THREE;
						}
				}
		}]);

		return ZipLoader;
}();

exports.default = ZipLoader;