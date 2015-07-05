(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports', 'module', 'lodash'], factory);
    } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        factory(exports, module, require('lodash'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, mod, global.lodash);
        global.FuzzyTree = mod.exports;
    }
})(this, function (exports, module, _lodash) {
    /* jshint esnext:true */

    'use strict';

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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
                if (!path.every(_lodash.isString)) throw Error('all path sections must be strings');
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
                            var i = (0, _lodash.lastIndexOf)(path.slice(1), gc);
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
                if ((0, _lodash.isString)(path)) path = path.split(this._separator);
                if (!(0, _lodash.isArray)(path)) throw Error('path must be an array or a string');
                if (!path.every(_lodash.isString)) throw Error('all path sections must be strings');
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
                if ((0, _lodash.isString)(path)) path = path.split(this._separator);
                if (!(0, _lodash.isArray)(path)) throw Error('path must be an array or a string');
                if (!path.every(_lodash.isString)) throw Error('all path sections must be strings');
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

//# sourceMappingURL=data:application/json;base64,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QU0sS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7O0FBRWhELHVCQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDN0I7OzttQkFFTSxpQkFBQyxJQUFJLEVBQUM7QUFDVCxvQkFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRXRDLG9CQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQzs7QUFFekIsd0JBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMxQyx3QkFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2lCQUN6Qzs7QUFFRCx1QkFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDeEQ7OztlQTlKQyxTQUFTOzs7QUFpS2YsYUFBUyxLQUFLLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQztBQUM1QixnQkFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7bUJBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FBQSxDQUFDLENBQUM7S0FDekM7O3FCQUVjLFNBQVMiLCJmaWxlIjoiRnV6enlUcmVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG5cbmltcG9ydCB7XG4gICAgaXNTdHJpbmcgYXMgX2lzU3RyaW5nLFxuICAgIGlzQXJyYXkgYXMgX2lzQXJyYXksXG4gICAgbGFzdEluZGV4T2YgYXMgX2xhc3RJbmRleE9mXG59IGZyb20gJ2xvZGFzaCc7XG5cbmNsYXNzIEZ1enp5VHJlZXtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdCBhIG5ldyBGdXp6eVRyZWUgbm9kZS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLl9zZXBhcmF0b3IgPSAnLic7XG4gICAgICAgIHRoaXMuX3dpbGRjYXJkID0gJyonO1xuICAgICAgICB0aGlzLl9ncmVlZHkgPSAnIyc7XG4gICAgICAgIC8vIHJlc2V0IGRhdGEsIGNoaWxkcmVuIGFuZCBkdW1teTpcbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSB0aGlzIG5vZGUncyBkYXRhIGFuZCBjaGlsZHJlbi5cbiAgICAgKiBAcmV0dXJuIHtGdXp6eVRyZWV9IFRoZSBub2RlIGl0c2VsZi5cbiAgICAgKi9cbiAgICByZXNldCgpe1xuICAgICAgICB0aGlzLl9kYXRhID0gbnVsbDtcbiAgICAgICAgdGhpcy5fY2hpbGRyZW4gPSB7fTtcbiAgICAgICAgdGhpcy5fZHVtbXkgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoaXMgbm9kZSdzIGRhdGEuXG4gICAgICogQHBhcmFtIHsqfSBkYXRhIFRoZSBkYXRhIHRvIHNldC5cbiAgICAgKiBAcmV0dXJuIHtGdXp6eVRyZWV9IFRoZSBub2RlIGl0c2VsZi5cbiAgICAgKi9cbiAgICBzZXREYXRhKGRhdGEpe1xuICAgICAgICB0aGlzLl9kYXRhID0gZGF0YTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoaXMgbm9kZSdzIGRhdGEuXG4gICAgICogQHJldHVybiB7Kn0gVGhpcyBub2RlJ3MgZGF0YS5cbiAgICAgKi9cbiAgICBnZXREYXRhKCl7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdhdGhlciBhbGwgdGhlIG5vZGVzIGluIHRoaXMgdHJlZSB3aG8ncyBwYXRoIHBhdHRlcm4gbWF0Y2hlcyB0aGUgZ2l2ZW5cbiAgICAgKiBwYXRoLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ3xBcnJheX0gcGF0aCBUaGUgcGF0aCB0byBtYXRjaCBhZ2FpbnN0LlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBBbiBhcnJheSBvZiBGdXp6eVRyZWUgbm9kZXMgd2hvJ3MgcGF0aCBwYXR0ZXJuIG1hdGNoZXNcbiAgICAgKiB0aGUgZ2l2ZW4gcGF0aC5cbiAgICAgKi9cbiAgICBtYXRjaChwYXRoKXtcbiAgICAgICAgaWYgKF9pc1N0cmluZyhwYXRoKSkgcGF0aCA9IHBhdGguc3BsaXQodGhpcy5fc2VwYXJhdG9yKTtcbiAgICAgICAgaWYgKCFfaXNBcnJheShwYXRoKSlcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwicGF0aCBtdXN0IGJlIGFuIGFycmF5IG9yIGEgc3RyaW5nXCIpO1xuICAgICAgICBpZiAoIXBhdGguZXZlcnkoX2lzU3RyaW5nKSlcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiYWxsIHBhdGggc2VjdGlvbnMgbXVzdCBiZSBzdHJpbmdzXCIpO1xuICAgICAgICBpZiAocGF0aC5zb21lKHMgPT4gcy5sZW5ndGggPT09IDApKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJwYXRoIHNlY3Rpb24gY2Fubm90IGJlIGVtcHR5XCIpO1xuICAgICAgICBpZiAocGF0aC5zb21lKHMgPT4gcyA9PT0gdGhpcy5fd2lsZGNhcmQgfHwgcyA9PT0gdGhpcy5fZ3JlZWR5KSlcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwicGF0aCBzZWN0aW9uIGNhbm5vdCBiZSBhIHdpbGRjYXJkXCIpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9tYXRjaChwYXRoKTtcbiAgICB9XG5cbiAgICBfbWF0Y2gocGF0aCl7XG4gICAgICAgIHZhciByZXMgPSBbXSwgY2hpbGQ7XG5cbiAgICAgICAgaWYgKCFwYXRoLmxlbmd0aCAmJiAhdGhpcy5fZHVtbXkpIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZSBwYXRoIGlzIGVtcHR5LCByZXR1cm4gdGhlIG5vZGUgaXRzZWxmLlxuICAgICAgICAgICAgcmVzLnB1c2godGhpcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiB0aGUgcGF0aCB0byBvbmUgb2YgdGhlIGNoaWxkcmVuIGlzIGVxdWFsIHRvIHRoZSBuZXh0IHNlY3Rpb25cbiAgICAgICAgICAgIC8vIGluIHRoZSByZXF1ZXN0ZWQgcGF0aCwgdHJhdmVyc2UgdGhpcyBjaGlsZC5cbiAgICAgICAgICAgIGNoaWxkID0gdGhpcy5fY2hpbGRyZW5bcGF0aFswXV07XG4gICAgICAgICAgICBpZiAoY2hpbGQpXG4gICAgICAgICAgICAgICAgX3B1c2gocmVzLCBjaGlsZC5fbWF0Y2gocGF0aC5zbGljZSgxKSkpO1xuXG4gICAgICAgICAgICAvLyBpZiBvbmUgb2YgdGhlIGNoaWxkcmVuJ3MgcGF0aCBwYXR0ZXJuIGlzIGEgd2lsZGNhcmQsIGl0IGFsc29cbiAgICAgICAgICAgIC8vIG1hdGNoZXMgdGhlIG5leHQgc2VjdGlvbiBvZiB0aGUgcmVxdWVzdGVkIHBhdGguIHRyYXZlcnNlIGl0IHRvby5cbiAgICAgICAgICAgIGNoaWxkID0gdGhpcy5fY2hpbGRyZW5bdGhpcy5fd2lsZGNhcmRdO1xuICAgICAgICAgICAgaWYgKGNoaWxkKVxuICAgICAgICAgICAgICAgIF9wdXNoKHJlcywgY2hpbGQuX21hdGNoKHBhdGguc2xpY2UoMSkpKTtcblxuICAgICAgICAgICAgLy8gaWYgb25lIG9mIHRoZSBjaGlsZHJlbidzIHBhdGggcGF0dGVybiBpcyBhIGdyZWVkeSB3aWxkY2FyZCxcbiAgICAgICAgICAgIC8vIHRyYXZlcnNlIHRoaXMgY2hpbGQgd2l0aCBhbGwgcG9zc2libGUgc3ViLXBhdGhzIG9mIHRoZSByZXF1ZXN0ZWRcbiAgICAgICAgICAgIC8vIHBhdGguXG4gICAgICAgICAgICBjaGlsZCA9IHRoaXMuX2NoaWxkcmVuW3RoaXMuX2dyZWVkeV07XG4gICAgICAgICAgICBpZiAoY2hpbGQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZ3JhbmRjaGlsZHMgPSBPYmplY3Qua2V5cyhjaGlsZC5fY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIGlmICghZ3JhbmRjaGlsZHMubGVuZ3RoKSBfcHVzaChyZXMsIGNoaWxkLl9tYXRjaChbXSkpO1xuICAgICAgICAgICAgICAgIGVsc2UgZ3JhbmRjaGlsZHMuZmlsdGVyKGdjID0+XG4gICAgICAgICAgICAgICAgICAgIGdjICE9PSB0aGlzLl93aWxkY2FyZCAmJlxuICAgICAgICAgICAgICAgICAgICBnYyAhPT0gdGhpcy5fZ3JlZWR5XG4gICAgICAgICAgICAgICAgKS5mb3JFYWNoKGdjID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0byBjb25zdW1lIGFzIG11Y2ggYXMgcG9zc2libGUgZnJvbSB0aGUgcGF0aFxuICAgICAgICAgICAgICAgICAgICB2YXIgaSA9IF9sYXN0SW5kZXhPZihwYXRoLnNsaWNlKDEpLCBnYyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpID4gLTEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgX3B1c2gocmVzLCBjaGlsZC5fbWF0Y2gocGF0aC5zbGljZShpICsgMSkpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaW5kIHRoZSBub2RlIHVuZGVyIGEgc3BlY2lmaWMgcGF0aCBwYXR0ZXJuLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ3xBcnJheX0gcGF0aCBUaGUgcGF0aCBwYXR0ZXJuIG9mIHRoZSByZXF1aXJlZCBub2RlLlxuICAgICAqIEByZXR1cm4ge0Z1enp5VHJlZXxOdWxsfSBUaGUgZm91bmQgbm9kZSwgb3IgbnVsbCBpZiBub3QgZm91bmQuXG4gICAgICovXG4gICAgZmluZChwYXRoKXtcbiAgICAgICAgaWYgKF9pc1N0cmluZyhwYXRoKSkgcGF0aCA9IHBhdGguc3BsaXQodGhpcy5fc2VwYXJhdG9yKTtcbiAgICAgICAgaWYgKCFfaXNBcnJheShwYXRoKSlcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwicGF0aCBtdXN0IGJlIGFuIGFycmF5IG9yIGEgc3RyaW5nXCIpO1xuICAgICAgICBpZiAoIXBhdGguZXZlcnkoX2lzU3RyaW5nKSlcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiYWxsIHBhdGggc2VjdGlvbnMgbXVzdCBiZSBzdHJpbmdzXCIpO1xuICAgICAgICBpZiAocGF0aC5zb21lKHMgPT4gcy5sZW5ndGggPT09IDApKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJwYXRoIHNlY3Rpb24gY2Fubm90IGJlIGVtcHR5XCIpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9maW5kKHBhdGgpO1xuICAgIH1cblxuICAgIF9maW5kKHBhdGgpe1xuICAgICAgICBpZiAoIXBhdGgubGVuZ3RoKSByZXR1cm4gdGhpcy5fZHVtbXkgPyBudWxsIDogdGhpcztcbiAgICAgICAgaWYgKCF0aGlzLl9jaGlsZHJlbltwYXRoWzBdXSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2NoaWxkcmVuW3BhdGhbMF1dLmZpbmQocGF0aC5zbGljZSgxKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0IGEgbm9kZSB1bmRlciB0aGUgc3BlY2lmaWVkIHBhdGggcGF0dGVybi4gTmV3IG5vZGVzIHdpbGwgYmUgY3JlYXRlZFxuICAgICAqIGFsb25nIHRoZSB3YXkgaWYgbmVlZGVkLiBJZiBhIG5vZGUgYWxyZWFkeSBleGlzdHMgdW5kZXIgdGhpcyBwYXRoIHBhdHRlcm5cbiAgICAgKiBpdCB3aWxsIGJlIHJlc2V0dGVkLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ3xBcnJheX0gcGF0aCBUaGUgcGF0aCBwYXR0ZXJuIG9mIHRoZSBuZXcgbm9kZS5cbiAgICAgKiBAcmV0dXJuIHtGdXp6eVRyZWV9IFRoZSBuZXdseSBjcmVhdGVkIG5vZGUuXG4gICAgICovXG4gICAgaW5zZXJ0KHBhdGgpe1xuICAgICAgICBpZiAoX2lzU3RyaW5nKHBhdGgpKSBwYXRoID0gcGF0aC5zcGxpdCh0aGlzLl9zZXBhcmF0b3IpO1xuICAgICAgICBpZiAoIV9pc0FycmF5KHBhdGgpKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJwYXRoIG11c3QgYmUgYW4gYXJyYXkgb3IgYSBzdHJpbmdcIik7XG4gICAgICAgIGlmICghcGF0aC5ldmVyeShfaXNTdHJpbmcpKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJhbGwgcGF0aCBzZWN0aW9ucyBtdXN0IGJlIHN0cmluZ3NcIik7XG4gICAgICAgIGlmIChwYXRoLnNvbWUocyA9PiBzLmxlbmd0aCA9PT0gMCkpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcInBhdGggc2VjdGlvbiBjYW5ub3QgYmUgZW1wdHlcIik7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2luc2VydChwYXRoKTtcbiAgICB9XG5cbiAgICBfaW5zZXJ0KHBhdGgpe1xuICAgICAgICBpZiAoIXBhdGgubGVuZ3RoKSByZXR1cm4gdGhpcy5yZXNldCgpO1xuXG4gICAgICAgIGlmICghdGhpcy5fY2hpbGRyZW5bcGF0aFswXV0pe1xuICAgICAgICAgICAgLy8gY3JlYXRlIGEgZHVtbXkgbm9kZSBhbG9uZyB0aGUgcGF0aFxuICAgICAgICAgICAgdGhpcy5fY2hpbGRyZW5bcGF0aFswXV0gPSBuZXcgRnV6enlUcmVlKCk7XG4gICAgICAgICAgICB0aGlzLl9jaGlsZHJlbltwYXRoWzBdXS5fZHVtbXkgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2NoaWxkcmVuW3BhdGhbMF1dLmluc2VydChwYXRoLnNsaWNlKDEpKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIF9wdXNoKHRhcmdldCwgZWxlbWVudHMpe1xuICAgIGVsZW1lbnRzLmZvckVhY2goZSA9PiB0YXJnZXQucHVzaChlKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZ1enp5VHJlZTtcbiJdfQ==