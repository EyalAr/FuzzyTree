(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("lodash"));
	else if(typeof define === 'function' && define.amd)
		define(["lodash"], factory);
	else if(typeof exports === 'object')
		exports["FuzzyTree"] = factory(require("lodash"));
	else
		root["FuzzyTree"] = factory(root["_"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* jshint esnext:true */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	var _lodash = __webpack_require__(1);
	
	var FuzzyTree = (function () {
	
	    /**
	     * Construct a new FuzzyTree node.
	     */
	
	    function FuzzyTree() {
	        _classCallCheck(this, FuzzyTree);
	
	        this._separator = '.';
	        this._wildcard = '*';
	        this._greedy = '#';
	        // reset data, children and dummy:
	        this.reset();
	    }
	
	    _createClass(FuzzyTree, [{
	        key: 'reset',
	
	        /**
	         * Remove this node's data and children.
	         * @return {FuzzyTree} The node itself.
	         */
	        value: function reset() {
	            this._data = null;
	            this._children = {};
	            this._dummy = false;
	            return this;
	        }
	    }, {
	        key: 'setData',
	
	        /**
	         * Set this node's data.
	         * @param {*} data The data to set.
	         * @return {FuzzyTree} The node itself.
	         */
	        value: function setData(data) {
	            this._data = data;
	            return this;
	        }
	    }, {
	        key: 'getData',
	
	        /**
	         * Get this node's data.
	         * @return {*} This node's data.
	         */
	        value: function getData() {
	            return this._data;
	        }
	    }, {
	        key: 'match',
	
	        /**
	         * Gather all the nodes in this tree who's path pattern matches the given
	         * path.
	         * @param  {String|Array} path The path to match against.
	         * @return {Array} An array of FuzzyTree nodes who's path pattern matches
	         * the given path.
	         */
	        value: function match(path) {
	            var _this = this;
	
	            if ((0, _lodash.isString)(path)) path = path.split(this._separator);
	            if (!(0, _lodash.isArray)(path)) throw Error('path must be an array or a string');
	            if (!(0, _lodash.every)(path, _lodash.isString)) throw Error('all path sections must be strings');
	            if ((0, _lodash.some)(path, function (s) {
	                return s.length === 0;
	            })) throw Error('path section cannot be empty');
	            if ((0, _lodash.some)(path, function (s) {
	                return s === _this._wildcard || s === _this._greedy;
	            })) throw Error('path section cannot be a wildcard');
	
	            return this._match(path);
	        }
	    }, {
	        key: '_match',
	        value: function _match(path) {
	            var res = [],
	                child,
	                that = this;
	
	            if (!path.length && !this._dummy) {
	                // if the path is empty, return the node itself.
	                res.push(this);
	            } else {
	                // if the path to one of the children is equal to the next section
	                // in the requested path, traverse this child.
	                child = this._children[path[0]];
	                if (child) _push(res, child._match(path.slice(1)));
	
	                // if one of the children's path pattern is a wildcard, it also
	                // matches the next section of the requested path. traverse it too.
	                child = this._children[this._wildcard];
	                if (child) _push(res, child._match(path.slice(1)));
	
	                // if one of the children's path pattern is a greedy wildcard,
	                // traverse this child with all possible sub-paths of the requested
	                // path.
	                child = this._children[this._greedy];
	                if (child) traverseGreedy(child);
	            }
	
	            function traverseGreedy(child) {
	                var grandchilds = (0, _lodash.keys)(child._children),
	                    wildcard = child._wildcard,
	                    greedy = child._greedy;
	                _push(res, child._match([]));
	                (0, _lodash.forEach)(grandchilds, function (gc) {
	                    if (gc === wildcard) {
	                        // consume as much as possible, only if at least two left
	                        traverseGreedy(child._children[wildcard]);
	                    } else if (gc === greedy) {
	                        // consume one and move on
	                        _push(res, child._match(path.slice(1)));
	                    } else {
	                        // we need to consume as much as possible from the path
	                        var i = (0, _lodash.lastIndexOf)(path.slice(1), gc);
	                        if (i > -1) {
	                            _push(res, child._match(path.slice(i + 1)));
	                        }
	                    }
	                });
	            }
	
	            return res;
	        }
	    }, {
	        key: 'find',
	
	        /**
	         * Find the node under a specific path pattern.
	         * @param  {String|Array} path The path pattern of the required node.
	         * @return {FuzzyTree|Null} The found node, or null if not found.
	         */
	        value: function find(path) {
	            if ((0, _lodash.isString)(path)) path = path.split(this._separator);
	            if (!(0, _lodash.isArray)(path)) throw Error('path must be an array or a string');
	            if (!(0, _lodash.every)(path, _lodash.isString)) throw Error('all path sections must be strings');
	            if ((0, _lodash.some)(path, function (s) {
	                return s.length === 0;
	            })) throw Error('path section cannot be empty');
	
	            return this._find(path);
	        }
	    }, {
	        key: '_find',
	        value: function _find(path) {
	            if (!path.length) return this._dummy ? null : this;
	            if (!this._children[path[0]]) return null;
	
	            return this._children[path[0]]._find(path.slice(1));
	        }
	    }, {
	        key: 'insert',
	
	        /**
	         * Insert a node under the specified path pattern. New nodes will be created
	         * along the way if needed. If a node already exists under this path pattern
	         * it will be resetted.
	         * @param  {String|Array} path The path pattern of the new node.
	         * @return {FuzzyTree} The newly created node.
	         */
	        value: function insert(path) {
	            if ((0, _lodash.isString)(path)) path = path.split(this._separator);
	            if (!(0, _lodash.isArray)(path)) throw Error('path must be an array or a string');
	            if (!(0, _lodash.every)(path, _lodash.isString)) throw Error('all path sections must be strings');
	            if ((0, _lodash.some)(path, function (s) {
	                return s.length === 0;
	            })) throw Error('path section cannot be empty');
	
	            return this._insert(path);
	        }
	    }, {
	        key: '_insert',
	        value: function _insert(path) {
	            if (!path.length) {
	                if (this._dummy) {
	                    this._dummy = false;
	                    return this;
	                }
	                return this.reset();
	            }
	
	            if (!this._children[path[0]]) {
	                // create a dummy node along the path
	                this._children[path[0]] = new FuzzyTree();
	                this._children[path[0]]._dummy = true;
	            }
	
	            return this._children[path[0]]._insert(path.slice(1));
	        }
	    }]);
	
	    return FuzzyTree;
	})();
	
	function _push(target, elements) {
	    (0, _lodash.forEach)(elements, function (e) {
	        return target.push(e);
	    });
	}
	
	exports['default'] = FuzzyTree;
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=FuzzyTree.js.map