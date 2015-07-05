import should from "should";
import FuzzyTree from "../src/FuzzyTree";

describe("find", function(){

    describe("regular path", function(){

        var node = new FuzzyTree(),
            path = "test.hello.world",
            newNode = node.insert(path),
            ret = node.find(path);

        it("should return the correct node", function(){
            ret.should.equal(newNode);
        });

    });

    describe("fuzzy path", function(){

        var node = new FuzzyTree(),
            path = "test.#.world",
            newNode = node.insert(path),
            ret = node.find(path);

        it("should return the correct node", function(){
            ret.should.equal(newNode);
        });

    });

});
