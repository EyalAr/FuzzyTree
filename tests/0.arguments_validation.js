import should from "should";
import FuzzyTree from "../src/FuzzyTree";

describe("arguments validation", function(){

    describe("insert", function(){

        var node = new FuzzyTree();

        it("should not throw an exception if path is string or array", function(){
            node.insert.bind(node, "topic").should.not.throw();
            node.insert.bind(node, ["topic", "hello"]).should.not.throw();
        });

        it("should throw an exception if topic is not a string or an array", function(){
            node.insert.bind(node, 123).should.throw();
            node.insert.bind(node, undefined).should.throw();
            node.insert.bind(node, null).should.throw();
            node.insert.bind(node, true).should.throw();
            node.insert.bind(node, {}).should.throw();
            node.insert.bind(node, function(){}).should.throw();
            node.insert.bind(node, /topic/).should.throw();
        });

    });

    describe("find", function(){

        var node = new FuzzyTree();

        it("should not throw an exception if path is string or array", function(){
            node.find.bind(node, "topic").should.not.throw();
            node.find.bind(node, ["topic", "hello"]).should.not.throw();
        });

        it("should throw an exception if topic is not a string or an array", function(){
            node.find.bind(node, 123).should.throw();
            node.find.bind(node, undefined).should.throw();
            node.find.bind(node, null).should.throw();
            node.find.bind(node, true).should.throw();
            node.find.bind(node, {}).should.throw();
            node.find.bind(node, function(){}).should.throw();
            node.find.bind(node, /topic/).should.throw();
        });

    });

    describe("match", function(){

        var node = new FuzzyTree();

        it("should not throw an exception if topic is string or array", function(){
            node.match.bind(node, "topic.hello").should.not.throw();
            node.match.bind(node, ["topic", "hello"]).should.not.throw();
        });

        it("should throw an exception if topic is not a string or an array", function(){
            node.match.bind(node, 123).should.throw();
            node.match.bind(node, undefined).should.throw();
            node.match.bind(node, null).should.throw();
            node.match.bind(node, true).should.throw();
            node.match.bind(node, {}).should.throw();
            node.match.bind(node, function(){}).should.throw();
        });

        it("should throw an exception if topic contains wildcards", function(){
            node.match.bind(node, "*.hello").should.throw();
            node.match.bind(node, "hello.#").should.throw();
        });

    });

});
