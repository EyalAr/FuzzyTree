import _ from "lodash";

class FuzzyTree(){
    constructor(){
        this._separator = '.';
        this._wildcard = '*';
        this._greedy = '#';

        this.reset();
    }

    setData(data){
        this._data = data;
    }

    getData(){
        return this._data;
    }

    match(path){
        path = path || [];
        if (_.isString(path)) path = path.split(this._separator);
        if (!_.isArray(path))
            throw Error("path must be an array or a string");
        if (!path.every(_.isString))
            throw Error("all path sections must be strings");
        if (path.some(s => s.length === 0))
            throw Error("path section cannot be empty");
        if (path.some(s => s === this._wildcard || s === this._greedy))
            throw Error("path section cannot be a wildcard");

        var res = [], child, i;
        if (!path.length) res.push(this);
        else {
            if (child = this._children[path[0]])
                _push(res, child.find(path.slice(1)));
            if (child = this._children[this._wildcard])
                _push(res, child.find(path.slice(1)));
            if (child = this._children[this._greedy])
                for(i = 1 ; i <= path.length ; i++){
                    _push(res, child.find(path.slice(i)));
                }
        }

        return res;
    }

    find(path){
        path = path || [];
        if (_.isString(path)) path = path.split(this._separator);
        if (!_.isArray(path))
            throw Error("path must be an array or a string");
        if (!path.every(_.isString))
            throw Error("all path sections must be strings");
        if (path.some(s => s.length === 0))
            throw Error("path section cannot be empty");

        if (!path.length) return this;
        if (!this._children[path[0]]) return null;

        return this._children[path[0].insert(path.slice(1));
    }

    insert(path){
        path = path || [];
        if (_.isString(path)) path = path.split(this._separator);
        if (!_.isArray(path))
            throw Error("path must be an array or a string");
        if (!path.every(_.isString))
            throw Error("all path sections must be strings");
        if (path.some(s => s.length === 0))
            throw Error("path section cannot be empty");

        if (!path.length) return this.reset();

        if (!this._children[path[0]])
            this._children[path[0]] = new FuzzyTree();

        return this._children[path[0].insert(path.slice(1));
    }

    reset(){
        this._data = null;
        this._children = {};
        return this;
    }
}

function _push(target, elements){
    elements.forEach(e => target.push(e));
}

export default FuzzyTree;
