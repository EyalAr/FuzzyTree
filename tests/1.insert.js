import should from "should";
import FuzzyTree from "../src/FuzzyTree";

describe("insert", function(){

    describe("return value", function(){

        var node = new FuzzyTree(),
            path = "test.hello.world",
            newNode = node.insert(path);

        it("should be a FuzzyTree instance", function(){
            newNode.should.be.instanceOf(FuzzyTree);
        });

        it("should be an empty node", function(){
            should(newNode.getData()).be.null();
        });

    });

    describe("existing path", function(){

        var node = new FuzzyTree(),
            path = "test.hello.world",
            data = {};

        var newNode = node.insert(path);
        newNode.setData(data);

        var newNode2 = node.insert(path);

        it("should return a FuzzyTree instance", function(){
            newNode.should.be.instanceOf(FuzzyTree);
        });

        it("should be an empty node", function(){
            should(newNode.getData()).be.null();
        });

        it("should not create a new node", function(){
            newNode2.should.equal(newNode);
        });

    });

});
