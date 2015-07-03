(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports', 'module', 'lodash.isstring', 'lodash.isarray', 'lodash.lastindexof'], factory);
    } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        factory(exports, module, require('lodash.isstring'), require('lodash.isarray'), require('lodash.lastindexof'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, mod, global._isString, global._isArray, global._lastIndexOf);
        global.FuzzyTree = mod.exports;
    }
})(this, function (exports, module, _lodashIsstring, _lodashIsarray, _lodashLastindexof) {
    /* jshint esnext:true */

    'use strict';

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _isString2 = _interopRequireDefault(_lodashIsstring);

    var _isArray2 = _interopRequireDefault(_lodashIsarray);

    var _lastIndexOf2 = _interopRequireDefault(_lodashLastindexof);

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

                path = path || [];
                if ((0, _isString2['default'])(path)) path = path.split(this._separator);
                if (!(0, _isArray2['default'])(path)) throw Error('path must be an array or a string');
                if (!path.every(_isString2['default'])) throw Error('all path sections must be strings');
                if (path.some(function (s) {
                    return s.length === 0;
                })) throw Error('path section cannot be empty');
                if (path.some(function (s) {
                    return s === _this._wildcard || s === _this._greedy;
                })) throw Error('path section cannot be a wildcard');

                return this._match(path);
            }
        }, {
            key: '_match',
            value: function _match(path) {
                var _this2 = this;

                var res = [],
                    child;

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
                    if (child) {
                        var grandchilds = Object.keys(child._children);
                        if (!grandchilds.length) _push(res, child._match([]));else grandchilds.filter(function (gc) {
                            return gc !== _this2._wildcard && gc !== _this2._greedy;
                        }).forEach(function (gc) {
                            // we need to consume as much as possible from the path
                            var i = (0, _lastIndexOf2['default'])(path.slice(1), gc);
                            if (i > -1) {
                                _push(res, child._match(path.slice(i + 1)));
                            }
                        });
                    }
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
                path = path || [];
                if ((0, _isString2['default'])(path)) path = path.split(this._separator);
                if (!(0, _isArray2['default'])(path)) throw Error('path must be an array or a string');
                if (!path.every(_isString2['default'])) throw Error('all path sections must be strings');
                if (path.some(function (s) {
                    return s.length === 0;
                })) throw Error('path section cannot be empty');

                return this._find(path);
            }
        }, {
            key: '_find',
            value: function _find(path) {
                if (!path.length) return this._dummy ? null : this;
                if (!this._children[path[0]]) return null;

                return this._children[path[0]].find(path.slice(1));
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
                path = path || [];
                if ((0, _isString2['default'])(path)) path = path.split(this._separator);
                if (!(0, _isArray2['default'])(path)) throw Error('path must be an array or a string');
                if (!path.every(_isString2['default'])) throw Error('all path sections must be strings');
                if (path.some(function (s) {
                    return s.length === 0;
                })) throw Error('path section cannot be empty');

                return this._insert(path);
            }
        }, {
            key: '_insert',
            value: function _insert(path) {
                if (!path.length) return this.reset();

                if (!this._children[path[0]]) {
                    // create a dummy node along the path
                    this._children[path[0]] = new FuzzyTree();
                    this._children[path[0]]._dummy = true;
                }

                return this._children[path[0]].insert(path.slice(1));
            }
        }]);

        return FuzzyTree;
    })();

    function _push(target, elements) {
        elements.forEach(function (e) {
            return target.push(e);
        });
    }

    module.exports = FuzzyTree;
});
//# sourceMappingURL=data:application/json;base64,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LEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDOztBQUVoRCx1QkFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzdCOzs7bUJBRU0saUJBQUMsSUFBSSxFQUFDO0FBQ1Qsb0JBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUV0QyxvQkFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUM7O0FBRXpCLHdCQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7QUFDMUMsd0JBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztpQkFDekM7O0FBRUQsdUJBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3hEOzs7ZUFqS0MsU0FBUzs7O0FBb0tmLGFBQVMsS0FBSyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUM7QUFDNUIsZ0JBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO21CQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQUEsQ0FBQyxDQUFDO0tBQ3pDOztxQkFFYyxTQUFTIiwiZmlsZSI6IkZ1enp5VHJlZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuXG5pbXBvcnQgX2lzU3RyaW5nIGZyb20gJ2xvZGFzaC5pc3N0cmluZyc7XG5pbXBvcnQgX2lzQXJyYXkgZnJvbSAnbG9kYXNoLmlzYXJyYXknO1xuaW1wb3J0IF9sYXN0SW5kZXhPZiBmcm9tICdsb2Rhc2gubGFzdGluZGV4b2YnO1xuXG5jbGFzcyBGdXp6eVRyZWV7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3QgYSBuZXcgRnV6enlUcmVlIG5vZGUuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5fc2VwYXJhdG9yID0gJy4nO1xuICAgICAgICB0aGlzLl93aWxkY2FyZCA9ICcqJztcbiAgICAgICAgdGhpcy5fZ3JlZWR5ID0gJyMnO1xuICAgICAgICAvLyByZXNldCBkYXRhLCBjaGlsZHJlbiBhbmQgZHVtbXk6XG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgdGhpcyBub2RlJ3MgZGF0YSBhbmQgY2hpbGRyZW4uXG4gICAgICogQHJldHVybiB7RnV6enlUcmVlfSBUaGUgbm9kZSBpdHNlbGYuXG4gICAgICovXG4gICAgcmVzZXQoKXtcbiAgICAgICAgdGhpcy5fZGF0YSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2NoaWxkcmVuID0ge307XG4gICAgICAgIHRoaXMuX2R1bW15ID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGlzIG5vZGUncyBkYXRhLlxuICAgICAqIEBwYXJhbSB7Kn0gZGF0YSBUaGUgZGF0YSB0byBzZXQuXG4gICAgICogQHJldHVybiB7RnV6enlUcmVlfSBUaGUgbm9kZSBpdHNlbGYuXG4gICAgICovXG4gICAgc2V0RGF0YShkYXRhKXtcbiAgICAgICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGlzIG5vZGUncyBkYXRhLlxuICAgICAqIEByZXR1cm4geyp9IFRoaXMgbm9kZSdzIGRhdGEuXG4gICAgICovXG4gICAgZ2V0RGF0YSgpe1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHYXRoZXIgYWxsIHRoZSBub2RlcyBpbiB0aGlzIHRyZWUgd2hvJ3MgcGF0aCBwYXR0ZXJuIG1hdGNoZXMgdGhlIGdpdmVuXG4gICAgICogcGF0aC5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd8QXJyYXl9IHBhdGggVGhlIHBhdGggdG8gbWF0Y2ggYWdhaW5zdC5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gQW4gYXJyYXkgb2YgRnV6enlUcmVlIG5vZGVzIHdobydzIHBhdGggcGF0dGVybiBtYXRjaGVzXG4gICAgICogdGhlIGdpdmVuIHBhdGguXG4gICAgICovXG4gICAgbWF0Y2gocGF0aCl7XG4gICAgICAgIHBhdGggPSBwYXRoIHx8IFtdO1xuICAgICAgICBpZiAoX2lzU3RyaW5nKHBhdGgpKSBwYXRoID0gcGF0aC5zcGxpdCh0aGlzLl9zZXBhcmF0b3IpO1xuICAgICAgICBpZiAoIV9pc0FycmF5KHBhdGgpKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJwYXRoIG11c3QgYmUgYW4gYXJyYXkgb3IgYSBzdHJpbmdcIik7XG4gICAgICAgIGlmICghcGF0aC5ldmVyeShfaXNTdHJpbmcpKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJhbGwgcGF0aCBzZWN0aW9ucyBtdXN0IGJlIHN0cmluZ3NcIik7XG4gICAgICAgIGlmIChwYXRoLnNvbWUocyA9PiBzLmxlbmd0aCA9PT0gMCkpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcInBhdGggc2VjdGlvbiBjYW5ub3QgYmUgZW1wdHlcIik7XG4gICAgICAgIGlmIChwYXRoLnNvbWUocyA9PiBzID09PSB0aGlzLl93aWxkY2FyZCB8fCBzID09PSB0aGlzLl9ncmVlZHkpKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJwYXRoIHNlY3Rpb24gY2Fubm90IGJlIGEgd2lsZGNhcmRcIik7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX21hdGNoKHBhdGgpO1xuICAgIH1cblxuICAgIF9tYXRjaChwYXRoKXtcbiAgICAgICAgdmFyIHJlcyA9IFtdLCBjaGlsZDtcblxuICAgICAgICBpZiAoIXBhdGgubGVuZ3RoICYmICF0aGlzLl9kdW1teSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlIHBhdGggaXMgZW1wdHksIHJldHVybiB0aGUgbm9kZSBpdHNlbGYuXG4gICAgICAgICAgICByZXMucHVzaCh0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZSBwYXRoIHRvIG9uZSBvZiB0aGUgY2hpbGRyZW4gaXMgZXF1YWwgdG8gdGhlIG5leHQgc2VjdGlvblxuICAgICAgICAgICAgLy8gaW4gdGhlIHJlcXVlc3RlZCBwYXRoLCB0cmF2ZXJzZSB0aGlzIGNoaWxkLlxuICAgICAgICAgICAgY2hpbGQgPSB0aGlzLl9jaGlsZHJlbltwYXRoWzBdXTtcbiAgICAgICAgICAgIGlmIChjaGlsZClcbiAgICAgICAgICAgICAgICBfcHVzaChyZXMsIGNoaWxkLl9tYXRjaChwYXRoLnNsaWNlKDEpKSk7XG5cbiAgICAgICAgICAgIC8vIGlmIG9uZSBvZiB0aGUgY2hpbGRyZW4ncyBwYXRoIHBhdHRlcm4gaXMgYSB3aWxkY2FyZCwgaXQgYWxzb1xuICAgICAgICAgICAgLy8gbWF0Y2hlcyB0aGUgbmV4dCBzZWN0aW9uIG9mIHRoZSByZXF1ZXN0ZWQgcGF0aC4gdHJhdmVyc2UgaXQgdG9vLlxuICAgICAgICAgICAgY2hpbGQgPSB0aGlzLl9jaGlsZHJlblt0aGlzLl93aWxkY2FyZF07XG4gICAgICAgICAgICBpZiAoY2hpbGQpXG4gICAgICAgICAgICAgICAgX3B1c2gocmVzLCBjaGlsZC5fbWF0Y2gocGF0aC5zbGljZSgxKSkpO1xuXG4gICAgICAgICAgICAvLyBpZiBvbmUgb2YgdGhlIGNoaWxkcmVuJ3MgcGF0aCBwYXR0ZXJuIGlzIGEgZ3JlZWR5IHdpbGRjYXJkLFxuICAgICAgICAgICAgLy8gdHJhdmVyc2UgdGhpcyBjaGlsZCB3aXRoIGFsbCBwb3NzaWJsZSBzdWItcGF0aHMgb2YgdGhlIHJlcXVlc3RlZFxuICAgICAgICAgICAgLy8gcGF0aC5cbiAgICAgICAgICAgIGNoaWxkID0gdGhpcy5fY2hpbGRyZW5bdGhpcy5fZ3JlZWR5XTtcbiAgICAgICAgICAgIGlmIChjaGlsZCkge1xuICAgICAgICAgICAgICAgIHZhciBncmFuZGNoaWxkcyA9IE9iamVjdC5rZXlzKGNoaWxkLl9jaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgaWYgKCFncmFuZGNoaWxkcy5sZW5ndGgpIF9wdXNoKHJlcywgY2hpbGQuX21hdGNoKFtdKSk7XG4gICAgICAgICAgICAgICAgZWxzZSBncmFuZGNoaWxkcy5maWx0ZXIoZ2MgPT5cbiAgICAgICAgICAgICAgICAgICAgZ2MgIT09IHRoaXMuX3dpbGRjYXJkICYmXG4gICAgICAgICAgICAgICAgICAgIGdjICE9PSB0aGlzLl9ncmVlZHlcbiAgICAgICAgICAgICAgICApLmZvckVhY2goZ2MgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyB3ZSBuZWVkIHRvIGNvbnN1bWUgYXMgbXVjaCBhcyBwb3NzaWJsZSBmcm9tIHRoZSBwYXRoXG4gICAgICAgICAgICAgICAgICAgIHZhciBpID0gX2xhc3RJbmRleE9mKHBhdGguc2xpY2UoMSksIGdjKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPiAtMSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBfcHVzaChyZXMsIGNoaWxkLl9tYXRjaChwYXRoLnNsaWNlKGkgKyAxKSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbmQgdGhlIG5vZGUgdW5kZXIgYSBzcGVjaWZpYyBwYXRoIHBhdHRlcm4uXG4gICAgICogQHBhcmFtICB7U3RyaW5nfEFycmF5fSBwYXRoIFRoZSBwYXRoIHBhdHRlcm4gb2YgdGhlIHJlcXVpcmVkIG5vZGUuXG4gICAgICogQHJldHVybiB7RnV6enlUcmVlfE51bGx9IFRoZSBmb3VuZCBub2RlLCBvciBudWxsIGlmIG5vdCBmb3VuZC5cbiAgICAgKi9cbiAgICBmaW5kKHBhdGgpe1xuICAgICAgICBwYXRoID0gcGF0aCB8fCBbXTtcbiAgICAgICAgaWYgKF9pc1N0cmluZyhwYXRoKSkgcGF0aCA9IHBhdGguc3BsaXQodGhpcy5fc2VwYXJhdG9yKTtcbiAgICAgICAgaWYgKCFfaXNBcnJheShwYXRoKSlcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwicGF0aCBtdXN0IGJlIGFuIGFycmF5IG9yIGEgc3RyaW5nXCIpO1xuICAgICAgICBpZiAoIXBhdGguZXZlcnkoX2lzU3RyaW5nKSlcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiYWxsIHBhdGggc2VjdGlvbnMgbXVzdCBiZSBzdHJpbmdzXCIpO1xuICAgICAgICBpZiAocGF0aC5zb21lKHMgPT4gcy5sZW5ndGggPT09IDApKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJwYXRoIHNlY3Rpb24gY2Fubm90IGJlIGVtcHR5XCIpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9maW5kKHBhdGgpO1xuICAgIH1cblxuICAgIF9maW5kKHBhdGgpe1xuICAgICAgICBpZiAoIXBhdGgubGVuZ3RoKSByZXR1cm4gdGhpcy5fZHVtbXkgPyBudWxsIDogdGhpcztcbiAgICAgICAgaWYgKCF0aGlzLl9jaGlsZHJlbltwYXRoWzBdXSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2NoaWxkcmVuW3BhdGhbMF1dLmZpbmQocGF0aC5zbGljZSgxKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0IGEgbm9kZSB1bmRlciB0aGUgc3BlY2lmaWVkIHBhdGggcGF0dGVybi4gTmV3IG5vZGVzIHdpbGwgYmUgY3JlYXRlZFxuICAgICAqIGFsb25nIHRoZSB3YXkgaWYgbmVlZGVkLiBJZiBhIG5vZGUgYWxyZWFkeSBleGlzdHMgdW5kZXIgdGhpcyBwYXRoIHBhdHRlcm5cbiAgICAgKiBpdCB3aWxsIGJlIHJlc2V0dGVkLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ3xBcnJheX0gcGF0aCBUaGUgcGF0aCBwYXR0ZXJuIG9mIHRoZSBuZXcgbm9kZS5cbiAgICAgKiBAcmV0dXJuIHtGdXp6eVRyZWV9IFRoZSBuZXdseSBjcmVhdGVkIG5vZGUuXG4gICAgICovXG4gICAgaW5zZXJ0KHBhdGgpe1xuICAgICAgICBwYXRoID0gcGF0aCB8fCBbXTtcbiAgICAgICAgaWYgKF9pc1N0cmluZyhwYXRoKSkgcGF0aCA9IHBhdGguc3BsaXQodGhpcy5fc2VwYXJhdG9yKTtcbiAgICAgICAgaWYgKCFfaXNBcnJheShwYXRoKSlcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwicGF0aCBtdXN0IGJlIGFuIGFycmF5IG9yIGEgc3RyaW5nXCIpO1xuICAgICAgICBpZiAoIXBhdGguZXZlcnkoX2lzU3RyaW5nKSlcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiYWxsIHBhdGggc2VjdGlvbnMgbXVzdCBiZSBzdHJpbmdzXCIpO1xuICAgICAgICBpZiAocGF0aC5zb21lKHMgPT4gcy5sZW5ndGggPT09IDApKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJwYXRoIHNlY3Rpb24gY2Fubm90IGJlIGVtcHR5XCIpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9pbnNlcnQocGF0aCk7XG4gICAgfVxuXG4gICAgX2luc2VydChwYXRoKXtcbiAgICAgICAgaWYgKCFwYXRoLmxlbmd0aCkgcmV0dXJuIHRoaXMucmVzZXQoKTtcblxuICAgICAgICBpZiAoIXRoaXMuX2NoaWxkcmVuW3BhdGhbMF1dKXtcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIGR1bW15IG5vZGUgYWxvbmcgdGhlIHBhdGhcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkcmVuW3BhdGhbMF1dID0gbmV3IEZ1enp5VHJlZSgpO1xuICAgICAgICAgICAgdGhpcy5fY2hpbGRyZW5bcGF0aFswXV0uX2R1bW15ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9jaGlsZHJlbltwYXRoWzBdXS5pbnNlcnQocGF0aC5zbGljZSgxKSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfcHVzaCh0YXJnZXQsIGVsZW1lbnRzKXtcbiAgICBlbGVtZW50cy5mb3JFYWNoKGUgPT4gdGFyZ2V0LnB1c2goZSkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBGdXp6eVRyZWU7XG4iXX0=