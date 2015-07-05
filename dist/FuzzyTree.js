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

                path = path || [];
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
                path = path || [];
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
                path = path || [];
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

//# sourceMappingURL=data:application/json;base64,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QyxtQ0FBbUMsQ0FBQyxDQUFDO0FBQ3JELG9CQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDOzJCQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQztpQkFBQSxDQUFDLEVBQzlCLE1BQU0sS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7O0FBRWhELHVCQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDN0I7OzttQkFFTSxpQkFBQyxJQUFJLEVBQUM7QUFDVCxvQkFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRXRDLG9CQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQzs7QUFFekIsd0JBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMxQyx3QkFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2lCQUN6Qzs7QUFFRCx1QkFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDeEQ7OztlQWpLQyxTQUFTOzs7QUFvS2YsYUFBUyxLQUFLLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQztBQUM1QixnQkFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7bUJBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FBQSxDQUFDLENBQUM7S0FDekM7O3FCQUVjLFNBQVMiLCJmaWxlIjoiRnV6enlUcmVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG5cbmltcG9ydCB7XG4gICAgaXNTdHJpbmcgYXMgX2lzU3RyaW5nLFxuICAgIGlzQXJyYXkgYXMgX2lzQXJyYXksXG4gICAgbGFzdEluZGV4T2YgYXMgX2xhc3RJbmRleE9mXG59IGZyb20gJ2xvZGFzaCc7XG5cbmNsYXNzIEZ1enp5VHJlZXtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdCBhIG5ldyBGdXp6eVRyZWUgbm9kZS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLl9zZXBhcmF0b3IgPSAnLic7XG4gICAgICAgIHRoaXMuX3dpbGRjYXJkID0gJyonO1xuICAgICAgICB0aGlzLl9ncmVlZHkgPSAnIyc7XG4gICAgICAgIC8vIHJlc2V0IGRhdGEsIGNoaWxkcmVuIGFuZCBkdW1teTpcbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSB0aGlzIG5vZGUncyBkYXRhIGFuZCBjaGlsZHJlbi5cbiAgICAgKiBAcmV0dXJuIHtGdXp6eVRyZWV9IFRoZSBub2RlIGl0c2VsZi5cbiAgICAgKi9cbiAgICByZXNldCgpe1xuICAgICAgICB0aGlzLl9kYXRhID0gbnVsbDtcbiAgICAgICAgdGhpcy5fY2hpbGRyZW4gPSB7fTtcbiAgICAgICAgdGhpcy5fZHVtbXkgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoaXMgbm9kZSdzIGRhdGEuXG4gICAgICogQHBhcmFtIHsqfSBkYXRhIFRoZSBkYXRhIHRvIHNldC5cbiAgICAgKiBAcmV0dXJuIHtGdXp6eVRyZWV9IFRoZSBub2RlIGl0c2VsZi5cbiAgICAgKi9cbiAgICBzZXREYXRhKGRhdGEpe1xuICAgICAgICB0aGlzLl9kYXRhID0gZGF0YTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoaXMgbm9kZSdzIGRhdGEuXG4gICAgICogQHJldHVybiB7Kn0gVGhpcyBub2RlJ3MgZGF0YS5cbiAgICAgKi9cbiAgICBnZXREYXRhKCl7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdhdGhlciBhbGwgdGhlIG5vZGVzIGluIHRoaXMgdHJlZSB3aG8ncyBwYXRoIHBhdHRlcm4gbWF0Y2hlcyB0aGUgZ2l2ZW5cbiAgICAgKiBwYXRoLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ3xBcnJheX0gcGF0aCBUaGUgcGF0aCB0byBtYXRjaCBhZ2FpbnN0LlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBBbiBhcnJheSBvZiBGdXp6eVRyZWUgbm9kZXMgd2hvJ3MgcGF0aCBwYXR0ZXJuIG1hdGNoZXNcbiAgICAgKiB0aGUgZ2l2ZW4gcGF0aC5cbiAgICAgKi9cbiAgICBtYXRjaChwYXRoKXtcbiAgICAgICAgcGF0aCA9IHBhdGggfHwgW107XG4gICAgICAgIGlmIChfaXNTdHJpbmcocGF0aCkpIHBhdGggPSBwYXRoLnNwbGl0KHRoaXMuX3NlcGFyYXRvcik7XG4gICAgICAgIGlmICghX2lzQXJyYXkocGF0aCkpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcInBhdGggbXVzdCBiZSBhbiBhcnJheSBvciBhIHN0cmluZ1wiKTtcbiAgICAgICAgaWYgKCFwYXRoLmV2ZXJ5KF9pc1N0cmluZykpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcImFsbCBwYXRoIHNlY3Rpb25zIG11c3QgYmUgc3RyaW5nc1wiKTtcbiAgICAgICAgaWYgKHBhdGguc29tZShzID0+IHMubGVuZ3RoID09PSAwKSlcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwicGF0aCBzZWN0aW9uIGNhbm5vdCBiZSBlbXB0eVwiKTtcbiAgICAgICAgaWYgKHBhdGguc29tZShzID0+IHMgPT09IHRoaXMuX3dpbGRjYXJkIHx8IHMgPT09IHRoaXMuX2dyZWVkeSkpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcInBhdGggc2VjdGlvbiBjYW5ub3QgYmUgYSB3aWxkY2FyZFwiKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fbWF0Y2gocGF0aCk7XG4gICAgfVxuXG4gICAgX21hdGNoKHBhdGgpe1xuICAgICAgICB2YXIgcmVzID0gW10sIGNoaWxkO1xuXG4gICAgICAgIGlmICghcGF0aC5sZW5ndGggJiYgIXRoaXMuX2R1bW15KSB7XG4gICAgICAgICAgICAvLyBpZiB0aGUgcGF0aCBpcyBlbXB0eSwgcmV0dXJuIHRoZSBub2RlIGl0c2VsZi5cbiAgICAgICAgICAgIHJlcy5wdXNoKHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgdGhlIHBhdGggdG8gb25lIG9mIHRoZSBjaGlsZHJlbiBpcyBlcXVhbCB0byB0aGUgbmV4dCBzZWN0aW9uXG4gICAgICAgICAgICAvLyBpbiB0aGUgcmVxdWVzdGVkIHBhdGgsIHRyYXZlcnNlIHRoaXMgY2hpbGQuXG4gICAgICAgICAgICBjaGlsZCA9IHRoaXMuX2NoaWxkcmVuW3BhdGhbMF1dO1xuICAgICAgICAgICAgaWYgKGNoaWxkKVxuICAgICAgICAgICAgICAgIF9wdXNoKHJlcywgY2hpbGQuX21hdGNoKHBhdGguc2xpY2UoMSkpKTtcblxuICAgICAgICAgICAgLy8gaWYgb25lIG9mIHRoZSBjaGlsZHJlbidzIHBhdGggcGF0dGVybiBpcyBhIHdpbGRjYXJkLCBpdCBhbHNvXG4gICAgICAgICAgICAvLyBtYXRjaGVzIHRoZSBuZXh0IHNlY3Rpb24gb2YgdGhlIHJlcXVlc3RlZCBwYXRoLiB0cmF2ZXJzZSBpdCB0b28uXG4gICAgICAgICAgICBjaGlsZCA9IHRoaXMuX2NoaWxkcmVuW3RoaXMuX3dpbGRjYXJkXTtcbiAgICAgICAgICAgIGlmIChjaGlsZClcbiAgICAgICAgICAgICAgICBfcHVzaChyZXMsIGNoaWxkLl9tYXRjaChwYXRoLnNsaWNlKDEpKSk7XG5cbiAgICAgICAgICAgIC8vIGlmIG9uZSBvZiB0aGUgY2hpbGRyZW4ncyBwYXRoIHBhdHRlcm4gaXMgYSBncmVlZHkgd2lsZGNhcmQsXG4gICAgICAgICAgICAvLyB0cmF2ZXJzZSB0aGlzIGNoaWxkIHdpdGggYWxsIHBvc3NpYmxlIHN1Yi1wYXRocyBvZiB0aGUgcmVxdWVzdGVkXG4gICAgICAgICAgICAvLyBwYXRoLlxuICAgICAgICAgICAgY2hpbGQgPSB0aGlzLl9jaGlsZHJlblt0aGlzLl9ncmVlZHldO1xuICAgICAgICAgICAgaWYgKGNoaWxkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGdyYW5kY2hpbGRzID0gT2JqZWN0LmtleXMoY2hpbGQuX2NoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICBpZiAoIWdyYW5kY2hpbGRzLmxlbmd0aCkgX3B1c2gocmVzLCBjaGlsZC5fbWF0Y2goW10pKTtcbiAgICAgICAgICAgICAgICBlbHNlIGdyYW5kY2hpbGRzLmZpbHRlcihnYyA9PlxuICAgICAgICAgICAgICAgICAgICBnYyAhPT0gdGhpcy5fd2lsZGNhcmQgJiZcbiAgICAgICAgICAgICAgICAgICAgZ2MgIT09IHRoaXMuX2dyZWVkeVxuICAgICAgICAgICAgICAgICkuZm9yRWFjaChnYyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdlIG5lZWQgdG8gY29uc3VtZSBhcyBtdWNoIGFzIHBvc3NpYmxlIGZyb20gdGhlIHBhdGhcbiAgICAgICAgICAgICAgICAgICAgdmFyIGkgPSBfbGFzdEluZGV4T2YocGF0aC5zbGljZSgxKSwgZ2MpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA+IC0xKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9wdXNoKHJlcywgY2hpbGQuX21hdGNoKHBhdGguc2xpY2UoaSArIDEpKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZCB0aGUgbm9kZSB1bmRlciBhIHNwZWNpZmljIHBhdGggcGF0dGVybi5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd8QXJyYXl9IHBhdGggVGhlIHBhdGggcGF0dGVybiBvZiB0aGUgcmVxdWlyZWQgbm9kZS5cbiAgICAgKiBAcmV0dXJuIHtGdXp6eVRyZWV8TnVsbH0gVGhlIGZvdW5kIG5vZGUsIG9yIG51bGwgaWYgbm90IGZvdW5kLlxuICAgICAqL1xuICAgIGZpbmQocGF0aCl7XG4gICAgICAgIHBhdGggPSBwYXRoIHx8IFtdO1xuICAgICAgICBpZiAoX2lzU3RyaW5nKHBhdGgpKSBwYXRoID0gcGF0aC5zcGxpdCh0aGlzLl9zZXBhcmF0b3IpO1xuICAgICAgICBpZiAoIV9pc0FycmF5KHBhdGgpKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJwYXRoIG11c3QgYmUgYW4gYXJyYXkgb3IgYSBzdHJpbmdcIik7XG4gICAgICAgIGlmICghcGF0aC5ldmVyeShfaXNTdHJpbmcpKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJhbGwgcGF0aCBzZWN0aW9ucyBtdXN0IGJlIHN0cmluZ3NcIik7XG4gICAgICAgIGlmIChwYXRoLnNvbWUocyA9PiBzLmxlbmd0aCA9PT0gMCkpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcInBhdGggc2VjdGlvbiBjYW5ub3QgYmUgZW1wdHlcIik7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmQocGF0aCk7XG4gICAgfVxuXG4gICAgX2ZpbmQocGF0aCl7XG4gICAgICAgIGlmICghcGF0aC5sZW5ndGgpIHJldHVybiB0aGlzLl9kdW1teSA/IG51bGwgOiB0aGlzO1xuICAgICAgICBpZiAoIXRoaXMuX2NoaWxkcmVuW3BhdGhbMF1dKSByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4gdGhpcy5fY2hpbGRyZW5bcGF0aFswXV0uZmluZChwYXRoLnNsaWNlKDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnNlcnQgYSBub2RlIHVuZGVyIHRoZSBzcGVjaWZpZWQgcGF0aCBwYXR0ZXJuLiBOZXcgbm9kZXMgd2lsbCBiZSBjcmVhdGVkXG4gICAgICogYWxvbmcgdGhlIHdheSBpZiBuZWVkZWQuIElmIGEgbm9kZSBhbHJlYWR5IGV4aXN0cyB1bmRlciB0aGlzIHBhdGggcGF0dGVyblxuICAgICAqIGl0IHdpbGwgYmUgcmVzZXR0ZWQuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfEFycmF5fSBwYXRoIFRoZSBwYXRoIHBhdHRlcm4gb2YgdGhlIG5ldyBub2RlLlxuICAgICAqIEByZXR1cm4ge0Z1enp5VHJlZX0gVGhlIG5ld2x5IGNyZWF0ZWQgbm9kZS5cbiAgICAgKi9cbiAgICBpbnNlcnQocGF0aCl7XG4gICAgICAgIHBhdGggPSBwYXRoIHx8IFtdO1xuICAgICAgICBpZiAoX2lzU3RyaW5nKHBhdGgpKSBwYXRoID0gcGF0aC5zcGxpdCh0aGlzLl9zZXBhcmF0b3IpO1xuICAgICAgICBpZiAoIV9pc0FycmF5KHBhdGgpKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJwYXRoIG11c3QgYmUgYW4gYXJyYXkgb3IgYSBzdHJpbmdcIik7XG4gICAgICAgIGlmICghcGF0aC5ldmVyeShfaXNTdHJpbmcpKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJhbGwgcGF0aCBzZWN0aW9ucyBtdXN0IGJlIHN0cmluZ3NcIik7XG4gICAgICAgIGlmIChwYXRoLnNvbWUocyA9PiBzLmxlbmd0aCA9PT0gMCkpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcInBhdGggc2VjdGlvbiBjYW5ub3QgYmUgZW1wdHlcIik7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2luc2VydChwYXRoKTtcbiAgICB9XG5cbiAgICBfaW5zZXJ0KHBhdGgpe1xuICAgICAgICBpZiAoIXBhdGgubGVuZ3RoKSByZXR1cm4gdGhpcy5yZXNldCgpO1xuXG4gICAgICAgIGlmICghdGhpcy5fY2hpbGRyZW5bcGF0aFswXV0pe1xuICAgICAgICAgICAgLy8gY3JlYXRlIGEgZHVtbXkgbm9kZSBhbG9uZyB0aGUgcGF0aFxuICAgICAgICAgICAgdGhpcy5fY2hpbGRyZW5bcGF0aFswXV0gPSBuZXcgRnV6enlUcmVlKCk7XG4gICAgICAgICAgICB0aGlzLl9jaGlsZHJlbltwYXRoWzBdXS5fZHVtbXkgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2NoaWxkcmVuW3BhdGhbMF1dLmluc2VydChwYXRoLnNsaWNlKDEpKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIF9wdXNoKHRhcmdldCwgZWxlbWVudHMpe1xuICAgIGVsZW1lbnRzLmZvckVhY2goZSA9PiB0YXJnZXQucHVzaChlKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZ1enp5VHJlZTtcbiJdfQ==