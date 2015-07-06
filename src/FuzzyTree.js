/* jshint esnext:true */

import {
    isString as _isString,
    isArray as _isArray,
    lastIndexOf as _lastIndexOf,
    keys as _keys,
    forEach as _forEach,
    every as _every,
    some as _some
} from 'lodash';

class FuzzyTree{

    /**
     * Construct a new FuzzyTree node.
     */
    constructor(){
        this._separator = '.';
        this._wildcard = '*';
        this._greedy = '#';
        // reset data, children and dummy:
        this.reset();
    }

    /**
     * Remove this node's data and children.
     * @return {FuzzyTree} The node itself.
     */
    reset(){
        this._data = null;
        this._children = {};
        this._dummy = false;
        return this;
    }

    /**
     * Set this node's data.
     * @param {*} data The data to set.
     * @return {FuzzyTree} The node itself.
     */
    setData(data){
        this._data = data;
        return this;
    }

    /**
     * Get this node's data.
     * @return {*} This node's data.
     */
    getData(){
        return this._data;
    }

    /**
     * Gather all the nodes in this tree who's path pattern matches the given
     * path.
     * @param  {String|Array} path The path to match against.
     * @return {Array} An array of FuzzyTree nodes who's path pattern matches
     * the given path.
     */
    match(path){
        if (_isString(path)) path = path.split(this._separator);
        if (!_isArray(path))
            throw Error("path must be an array or a string");
        if (!_every(path, _isString))
            throw Error("all path sections must be strings");
        if (_some(path, s => s.length === 0))
            throw Error("path section cannot be empty");
        if (_some(path, s => s === this._wildcard || s === this._greedy))
            throw Error("path section cannot be a wildcard");

        return this._match(path);
    }

    _match(path){
        var res = [], child, that = this;

        if (!path.length) {
            // if the path is empty, return the node itself.
            if (!this._dummy) res.push(this);
        } else {
            // if the path to one of the children is equal to the next section
            // in the requested path, traverse this child.
            child = this._children[path[0]];
            if (child)
                _push(res, child._match(path.slice(1)));

            // if one of the children's path pattern is a wildcard, it also
            // matches the next section of the requested path. traverse it too.
            child = this._children[this._wildcard];
            if (child)
                _push(res, child._match(path.slice(1)));

            // if one of the children's path pattern is a greedy wildcard,
            // traverse this child with all possible sub-paths of the requested
            // path.
            child = this._children[this._greedy];
            if (child)
                traverseGreedy(child);
        }

        function traverseGreedy(child){
            var grandchilds = _keys(child._children),
                wildcard = child._wildcard,
                greedy = child._greedy;
            _push(res, child._match([]));
            _forEach(grandchilds, gc => {
                if (gc === wildcard) {
                    // consume as much as possible, only if at least two left
                    traverseGreedy(child._children[wildcard]);
                } else if (gc === greedy) {
                    // consume one and move on
                    _push(res, child._match(path.slice(1)));
                } else {
                    // we need to consume as much as possible from the path
                    var i = _lastIndexOf(path.slice(1), gc);
                    if (i > -1){
                        _push(res, child._match(path.slice(i + 1)));
                    }
                }
            });
        }

        return res;
    }

    /**
     * Find the node under a specific path pattern.
     * @param  {String|Array} path The path pattern of the required node.
     * @return {FuzzyTree|Null} The found node, or null if not found.
     */
    find(path){
        if (_isString(path)) path = path.split(this._separator);
        if (!_isArray(path))
            throw Error("path must be an array or a string");
        if (!_every(path, _isString))
            throw Error("all path sections must be strings");
        if (_some(path, s => s.length === 0))
            throw Error("path section cannot be empty");

        return this._find(path);
    }

    _find(path){
        if (!path.length) return this._dummy ? null : this;
        if (!this._children[path[0]]) return null;

        return this._children[path[0]]._find(path.slice(1));
    }

    /**
     * Insert a node under the specified path pattern. New nodes will be created
     * along the way if needed. If a node already exists under this path pattern
     * it will be resetted.
     * @param  {String|Array} path The path pattern of the new node.
     * @return {FuzzyTree} The newly created node.
     */
    insert(path){
        if (_isString(path)) path = path.split(this._separator);
        if (!_isArray(path))
            throw Error("path must be an array or a string");
        if (!_every(path, _isString))
            throw Error("all path sections must be strings");
        if (_some(path, s => s.length === 0))
            throw Error("path section cannot be empty");

        return this._insert(path);
    }

    _insert(path){
        if (!path.length){
            if (this._dummy) {
                this._dummy = false;
                return this;
            }
            return this.reset();
        }

        if (!this._children[path[0]]){
            // create a dummy node along the path
            this._children[path[0]] = new FuzzyTree();
            this._children[path[0]]._dummy = true;
        }

        return this._children[path[0]]._insert(path.slice(1));
    }
}

function _push(target, elements){
    _forEach(elements, e => target.push(e));
}

export default FuzzyTree;
