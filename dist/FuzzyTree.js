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
                    var grandchilds = Object.keys(child._children),
                        wildcard = child._wildcard,
                        greedy = child._greedy;
                    if (!grandchilds.length) _push(res, child._match([]));else {
                        grandchilds.forEach(function (gc) {
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

//# sourceMappingURL=data:application/json;base64,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Q0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3hEOzs7ZUFoTEMsU0FBUzs7O0FBbUxmLGFBQVMsS0FBSyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUM7QUFDNUIsZ0JBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO21CQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQUEsQ0FBQyxDQUFDO0tBQ3pDOztxQkFFYyxTQUFTIiwiZmlsZSI6IkZ1enp5VHJlZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuXG5pbXBvcnQge1xuICAgIGlzU3RyaW5nIGFzIF9pc1N0cmluZyxcbiAgICBpc0FycmF5IGFzIF9pc0FycmF5LFxuICAgIGxhc3RJbmRleE9mIGFzIF9sYXN0SW5kZXhPZlxufSBmcm9tICdsb2Rhc2gnO1xuXG5jbGFzcyBGdXp6eVRyZWV7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3QgYSBuZXcgRnV6enlUcmVlIG5vZGUuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5fc2VwYXJhdG9yID0gJy4nO1xuICAgICAgICB0aGlzLl93aWxkY2FyZCA9ICcqJztcbiAgICAgICAgdGhpcy5fZ3JlZWR5ID0gJyMnO1xuICAgICAgICAvLyByZXNldCBkYXRhLCBjaGlsZHJlbiBhbmQgZHVtbXk6XG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgdGhpcyBub2RlJ3MgZGF0YSBhbmQgY2hpbGRyZW4uXG4gICAgICogQHJldHVybiB7RnV6enlUcmVlfSBUaGUgbm9kZSBpdHNlbGYuXG4gICAgICovXG4gICAgcmVzZXQoKXtcbiAgICAgICAgdGhpcy5fZGF0YSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2NoaWxkcmVuID0ge307XG4gICAgICAgIHRoaXMuX2R1bW15ID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGlzIG5vZGUncyBkYXRhLlxuICAgICAqIEBwYXJhbSB7Kn0gZGF0YSBUaGUgZGF0YSB0byBzZXQuXG4gICAgICogQHJldHVybiB7RnV6enlUcmVlfSBUaGUgbm9kZSBpdHNlbGYuXG4gICAgICovXG4gICAgc2V0RGF0YShkYXRhKXtcbiAgICAgICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGlzIG5vZGUncyBkYXRhLlxuICAgICAqIEByZXR1cm4geyp9IFRoaXMgbm9kZSdzIGRhdGEuXG4gICAgICovXG4gICAgZ2V0RGF0YSgpe1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHYXRoZXIgYWxsIHRoZSBub2RlcyBpbiB0aGlzIHRyZWUgd2hvJ3MgcGF0aCBwYXR0ZXJuIG1hdGNoZXMgdGhlIGdpdmVuXG4gICAgICogcGF0aC5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd8QXJyYXl9IHBhdGggVGhlIHBhdGggdG8gbWF0Y2ggYWdhaW5zdC5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gQW4gYXJyYXkgb2YgRnV6enlUcmVlIG5vZGVzIHdobydzIHBhdGggcGF0dGVybiBtYXRjaGVzXG4gICAgICogdGhlIGdpdmVuIHBhdGguXG4gICAgICovXG4gICAgbWF0Y2gocGF0aCl7XG4gICAgICAgIGlmIChfaXNTdHJpbmcocGF0aCkpIHBhdGggPSBwYXRoLnNwbGl0KHRoaXMuX3NlcGFyYXRvcik7XG4gICAgICAgIGlmICghX2lzQXJyYXkocGF0aCkpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcInBhdGggbXVzdCBiZSBhbiBhcnJheSBvciBhIHN0cmluZ1wiKTtcbiAgICAgICAgaWYgKCFwYXRoLmV2ZXJ5KF9pc1N0cmluZykpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcImFsbCBwYXRoIHNlY3Rpb25zIG11c3QgYmUgc3RyaW5nc1wiKTtcbiAgICAgICAgaWYgKHBhdGguc29tZShzID0+IHMubGVuZ3RoID09PSAwKSlcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwicGF0aCBzZWN0aW9uIGNhbm5vdCBiZSBlbXB0eVwiKTtcbiAgICAgICAgaWYgKHBhdGguc29tZShzID0+IHMgPT09IHRoaXMuX3dpbGRjYXJkIHx8IHMgPT09IHRoaXMuX2dyZWVkeSkpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcInBhdGggc2VjdGlvbiBjYW5ub3QgYmUgYSB3aWxkY2FyZFwiKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fbWF0Y2gocGF0aCk7XG4gICAgfVxuXG4gICAgX21hdGNoKHBhdGgpe1xuICAgICAgICB2YXIgcmVzID0gW10sIGNoaWxkLCB0aGF0ID0gdGhpcztcblxuICAgICAgICBpZiAoIXBhdGgubGVuZ3RoICYmICF0aGlzLl9kdW1teSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlIHBhdGggaXMgZW1wdHksIHJldHVybiB0aGUgbm9kZSBpdHNlbGYuXG4gICAgICAgICAgICByZXMucHVzaCh0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZSBwYXRoIHRvIG9uZSBvZiB0aGUgY2hpbGRyZW4gaXMgZXF1YWwgdG8gdGhlIG5leHQgc2VjdGlvblxuICAgICAgICAgICAgLy8gaW4gdGhlIHJlcXVlc3RlZCBwYXRoLCB0cmF2ZXJzZSB0aGlzIGNoaWxkLlxuICAgICAgICAgICAgY2hpbGQgPSB0aGlzLl9jaGlsZHJlbltwYXRoWzBdXTtcbiAgICAgICAgICAgIGlmIChjaGlsZClcbiAgICAgICAgICAgICAgICBfcHVzaChyZXMsIGNoaWxkLl9tYXRjaChwYXRoLnNsaWNlKDEpKSk7XG5cbiAgICAgICAgICAgIC8vIGlmIG9uZSBvZiB0aGUgY2hpbGRyZW4ncyBwYXRoIHBhdHRlcm4gaXMgYSB3aWxkY2FyZCwgaXQgYWxzb1xuICAgICAgICAgICAgLy8gbWF0Y2hlcyB0aGUgbmV4dCBzZWN0aW9uIG9mIHRoZSByZXF1ZXN0ZWQgcGF0aC4gdHJhdmVyc2UgaXQgdG9vLlxuICAgICAgICAgICAgY2hpbGQgPSB0aGlzLl9jaGlsZHJlblt0aGlzLl93aWxkY2FyZF07XG4gICAgICAgICAgICBpZiAoY2hpbGQpXG4gICAgICAgICAgICAgICAgX3B1c2gocmVzLCBjaGlsZC5fbWF0Y2gocGF0aC5zbGljZSgxKSkpO1xuXG4gICAgICAgICAgICAvLyBpZiBvbmUgb2YgdGhlIGNoaWxkcmVuJ3MgcGF0aCBwYXR0ZXJuIGlzIGEgZ3JlZWR5IHdpbGRjYXJkLFxuICAgICAgICAgICAgLy8gdHJhdmVyc2UgdGhpcyBjaGlsZCB3aXRoIGFsbCBwb3NzaWJsZSBzdWItcGF0aHMgb2YgdGhlIHJlcXVlc3RlZFxuICAgICAgICAgICAgLy8gcGF0aC5cbiAgICAgICAgICAgIGNoaWxkID0gdGhpcy5fY2hpbGRyZW5bdGhpcy5fZ3JlZWR5XTtcbiAgICAgICAgICAgIGlmIChjaGlsZClcbiAgICAgICAgICAgICAgICB0cmF2ZXJzZUdyZWVkeShjaGlsZCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB0cmF2ZXJzZUdyZWVkeShjaGlsZCl7XG4gICAgICAgICAgICB2YXIgZ3JhbmRjaGlsZHMgPSBPYmplY3Qua2V5cyhjaGlsZC5fY2hpbGRyZW4pLFxuICAgICAgICAgICAgICAgIHdpbGRjYXJkID0gY2hpbGQuX3dpbGRjYXJkLFxuICAgICAgICAgICAgICAgIGdyZWVkeSA9IGNoaWxkLl9ncmVlZHk7XG4gICAgICAgICAgICBpZiAoIWdyYW5kY2hpbGRzLmxlbmd0aCkgX3B1c2gocmVzLCBjaGlsZC5fbWF0Y2goW10pKTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGdyYW5kY2hpbGRzLmZvckVhY2goZ2MgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ2MgPT09IHdpbGRjYXJkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zdW1lIGFzIG11Y2ggYXMgcG9zc2libGUsIG9ubHkgaWYgYXQgbGVhc3QgdHdvIGxlZnRcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYXZlcnNlR3JlZWR5KGNoaWxkLl9jaGlsZHJlblt3aWxkY2FyZF0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGdjID09PSBncmVlZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN1bWUgb25lIGFuZCBtb3ZlIG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBfcHVzaChyZXMsIGNoaWxkLl9tYXRjaChwYXRoLnNsaWNlKDEpKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBuZWVkIHRvIGNvbnN1bWUgYXMgbXVjaCBhcyBwb3NzaWJsZSBmcm9tIHRoZSBwYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSA9IF9sYXN0SW5kZXhPZihwYXRoLnNsaWNlKDEpLCBnYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaSA+IC0xKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcHVzaChyZXMsIGNoaWxkLl9tYXRjaChwYXRoLnNsaWNlKGkgKyAxKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbmQgdGhlIG5vZGUgdW5kZXIgYSBzcGVjaWZpYyBwYXRoIHBhdHRlcm4uXG4gICAgICogQHBhcmFtICB7U3RyaW5nfEFycmF5fSBwYXRoIFRoZSBwYXRoIHBhdHRlcm4gb2YgdGhlIHJlcXVpcmVkIG5vZGUuXG4gICAgICogQHJldHVybiB7RnV6enlUcmVlfE51bGx9IFRoZSBmb3VuZCBub2RlLCBvciBudWxsIGlmIG5vdCBmb3VuZC5cbiAgICAgKi9cbiAgICBmaW5kKHBhdGgpe1xuICAgICAgICBpZiAoX2lzU3RyaW5nKHBhdGgpKSBwYXRoID0gcGF0aC5zcGxpdCh0aGlzLl9zZXBhcmF0b3IpO1xuICAgICAgICBpZiAoIV9pc0FycmF5KHBhdGgpKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJwYXRoIG11c3QgYmUgYW4gYXJyYXkgb3IgYSBzdHJpbmdcIik7XG4gICAgICAgIGlmICghcGF0aC5ldmVyeShfaXNTdHJpbmcpKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJhbGwgcGF0aCBzZWN0aW9ucyBtdXN0IGJlIHN0cmluZ3NcIik7XG4gICAgICAgIGlmIChwYXRoLnNvbWUocyA9PiBzLmxlbmd0aCA9PT0gMCkpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcInBhdGggc2VjdGlvbiBjYW5ub3QgYmUgZW1wdHlcIik7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmQocGF0aCk7XG4gICAgfVxuXG4gICAgX2ZpbmQocGF0aCl7XG4gICAgICAgIGlmICghcGF0aC5sZW5ndGgpIHJldHVybiB0aGlzLl9kdW1teSA/IG51bGwgOiB0aGlzO1xuICAgICAgICBpZiAoIXRoaXMuX2NoaWxkcmVuW3BhdGhbMF1dKSByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4gdGhpcy5fY2hpbGRyZW5bcGF0aFswXV0uZmluZChwYXRoLnNsaWNlKDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnNlcnQgYSBub2RlIHVuZGVyIHRoZSBzcGVjaWZpZWQgcGF0aCBwYXR0ZXJuLiBOZXcgbm9kZXMgd2lsbCBiZSBjcmVhdGVkXG4gICAgICogYWxvbmcgdGhlIHdheSBpZiBuZWVkZWQuIElmIGEgbm9kZSBhbHJlYWR5IGV4aXN0cyB1bmRlciB0aGlzIHBhdGggcGF0dGVyblxuICAgICAqIGl0IHdpbGwgYmUgcmVzZXR0ZWQuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfEFycmF5fSBwYXRoIFRoZSBwYXRoIHBhdHRlcm4gb2YgdGhlIG5ldyBub2RlLlxuICAgICAqIEByZXR1cm4ge0Z1enp5VHJlZX0gVGhlIG5ld2x5IGNyZWF0ZWQgbm9kZS5cbiAgICAgKi9cbiAgICBpbnNlcnQocGF0aCl7XG4gICAgICAgIGlmIChfaXNTdHJpbmcocGF0aCkpIHBhdGggPSBwYXRoLnNwbGl0KHRoaXMuX3NlcGFyYXRvcik7XG4gICAgICAgIGlmICghX2lzQXJyYXkocGF0aCkpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcInBhdGggbXVzdCBiZSBhbiBhcnJheSBvciBhIHN0cmluZ1wiKTtcbiAgICAgICAgaWYgKCFwYXRoLmV2ZXJ5KF9pc1N0cmluZykpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcImFsbCBwYXRoIHNlY3Rpb25zIG11c3QgYmUgc3RyaW5nc1wiKTtcbiAgICAgICAgaWYgKHBhdGguc29tZShzID0+IHMubGVuZ3RoID09PSAwKSlcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwicGF0aCBzZWN0aW9uIGNhbm5vdCBiZSBlbXB0eVwiKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5faW5zZXJ0KHBhdGgpO1xuICAgIH1cblxuICAgIF9pbnNlcnQocGF0aCl7XG4gICAgICAgIGlmICghcGF0aC5sZW5ndGgpe1xuICAgICAgICAgICAgaWYgKHRoaXMuX2R1bW15KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZHVtbXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlc2V0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2NoaWxkcmVuW3BhdGhbMF1dKXtcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIGR1bW15IG5vZGUgYWxvbmcgdGhlIHBhdGhcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkcmVuW3BhdGhbMF1dID0gbmV3IEZ1enp5VHJlZSgpO1xuICAgICAgICAgICAgdGhpcy5fY2hpbGRyZW5bcGF0aFswXV0uX2R1bW15ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9jaGlsZHJlbltwYXRoWzBdXS5pbnNlcnQocGF0aC5zbGljZSgxKSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfcHVzaCh0YXJnZXQsIGVsZW1lbnRzKXtcbiAgICBlbGVtZW50cy5mb3JFYWNoKGUgPT4gdGFyZ2V0LnB1c2goZSkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBGdXp6eVRyZWU7XG4iXX0=