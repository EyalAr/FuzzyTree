import should from "should";
import FuzzyTree from "../src/FuzzyTree";

describe("match", function(){

    describe("one node inserted with specific path", function(){

        var node = new FuzzyTree(),
            path = "test.hello.world",
            newNode = node.insert(path);;

        it("should match one node", function(){
            var nodes = node.match(path);

            nodes.should.have.length(1);
            nodes[0].should.be.instanceOf(FuzzyTree);
            nodes[0].should.equal(newNode);
        });

    });

    describe("one node inserted with pattern path", function(){

        describe("non greedy token at the start", function(){

            var node = new FuzzyTree(),
                pattern = "*.hello.world",
                newNode = node.insert(pattern);

            it("should match one node", function(){
                var path = "test.hello.world",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

            it("should match one node", function(){
                var path = "foo.hello.world",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

        });


        describe("non greedy token at the middle", function(){

            var node = new FuzzyTree(),
                pattern = "test.*.world",
                newNode = node.insert(pattern);

            it("should match one node", function(){
                var path = "test.hello.world",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

            it("should match one node", function(){
                var path = "test.foo.world",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

        });

        describe("non greedy token at the end", function(){

            var node = new FuzzyTree(),
                pattern = "test.hello.*",
                newNode = node.insert(pattern);

            it("should match one node", function(){
                var path = "test.hello.world",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

            it("should match one node", function(){
                var path = "test.hello.foo",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

        });

        describe("non greedy tokens at multiple locations", function(){

            var node = new FuzzyTree(),
                pattern = "test.*.hello.*",
                newNode = node.insert(pattern);

            it("should match one node", function(){
                var path = "test.foo.hello.world",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

            it("should match one node", function(){
                var path = "test.bar.hello.foo",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

            it("should match zero nodes", function(){
                var path = "test.hello.foo",
                    nodes = node.match(path);

                nodes.should.have.length(0);
            });

        });

        describe("greedy token at the start", function(){

            var node = new FuzzyTree(),
                pattern = "#.hello.world",
                newNode = node.insert(pattern);

            it("should match one node", function(){
                var path = "test.hello.world",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

            it("should match one node", function(){
                var path = "test.foo.bar.hello.world",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

        });

        describe("greedy token at the middle", function(){

            var node = new FuzzyTree(),
                pattern = "test.#.world",
                newNode = node.insert(pattern);

            it("should match one node", function(){
                var path = "test.hello.world",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

            it("should match one node", function(){
                var path = "test.hello.foo.world",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

        });

        describe("greedy token at the end", function(){

            var node = new FuzzyTree(),
                pattern = "test.hello.#",
                newNode = node.insert(pattern);

            it("should match one node", function(){
                var path = "test.hello.world",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

            it("should match one node", function(){
                var path = "test.hello.world.foo.bar",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

            it("should match zero nodes", function(){
                var path = "test.world.foo.bar",
                    nodes = node.match(path);

                nodes.should.have.length(0);
            });

        });

        describe("greedy tokens at multiple locations", function(){

            var node = new FuzzyTree(),
                pattern = "test.hello.#.foo.#.bar",
                newNode = node.insert(pattern);

            it("should match one node", function(){
                var path = "test.hello.world.nice.to.meet.you.foo.hi.bar",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

            it("should match one node", function(){
                var path = "test.hello.moon.glad.to.see.you.all.foo.hi.there.bar",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

            it("should match zero nodes", function(){
                var path = "test.hello.moon.glad.to.see.you.all.foo.bar",
                    nodes = node.match(path);

                nodes.should.have.length(0);
            });

        });

        describe("greedy tokens and non greedy tokens at multiple locations", function(){

            var node = new FuzzyTree(),
                pattern = "test.hello.#.foo.*.#.bar.*",
                newNode = node.insert(pattern);

            it("should match one node", function(){
                var path = "test.hello.world.nice.to.meet.you.foo.hi.bar.baz.bar.woo",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

            it("should match one node", function(){
                var path = "test.hello.moon.glad.to.see.you.all.foo.hi.there.bar.baz",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode);
            });

            it("should match zero nodes", function(){
                var path = "test.hello.moon.glad.to.see.you.all.foo.hi.there.bar.baz.kaz",
                    nodes = node.match(path);

                nodes.should.have.length(0);
            });

        });

    });

    describe("two nodes inserted with pattern path", function(){

        describe("greedy tokens and non greedy tokens at multiple locations", function(){

            var node = new FuzzyTree(),
                pattern1 = "test.hello.#.foo.*.#.bar.*",
                pattern2 = "test.hello.*.foo.#.bar.#",
                newNode1 = node.insert(pattern1),
                newNode2 = node.insert(pattern2);

            it("should match one node", function(){
                var path = "test.hello.world.nice.to.meet.you.foo.hi.bar.baz.bar.woo",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode1);
            });

            it("should match two nodes", function(){
                var path = "test.hello.world.foo.hi.bar.baz.bar.woo",
                    nodes = node.match(path);

                nodes.should.have.length(2);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[1].should.be.instanceOf(FuzzyTree);
                nodes.should.containEql(newNode1);
                nodes.should.containEql(newNode2);
            });

            it("should match one node", function(){
                var path = "test.hello.moon.glad.to.see.you.all.foo.hi.there.bar.baz",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode1);
            });

            it("should match one node", function(){
                var path = "test.hello.moon.foo.hi.there.bar.baz.paz",
                    nodes = node.match(path);

                nodes.should.have.length(1);
                nodes[0].should.be.instanceOf(FuzzyTree);
                nodes[0].should.equal(newNode2);
            });

            it("should match zero nodes", function(){
                var path = "test.hello.moon.glad.to.see.you.all.foo.hi.there.bar.baz.kaz",
                    nodes = node.match(path);

                nodes.should.have.length(0);
            });

        });

    });

});
