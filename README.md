# FuzzyTree

A tree inplementation in which nodes' paths can be non-deterministic.
In other words, nodes can be placed in a path which can match more than one
search query.

Using this kind of tree structure, one can, very efficiently, match specific
queries to generic pre-defined patterns.

**Example:**

```
var node = new FuzzyTree();

// insert a new node under a fuzzy path:
node.insert("usa.#.main-street.99");

// query the tree two times:
node.match("usa.new-york.main-street.99") // has a match!
node.match("usa.texas.houston.main-street.99") // has a match!
```

## API

### Constructor

`var node = new FuzzyTree()`

Construct a new tree node. Every node in the tree is an instance of `FuzzyTree`.

### Reset

`node.reset()`

Resets the node by removing its data and children.

### Set data

`node.setData(data)`

- `data {*}`: The data to be stored in the node.

**Returns** the node itself.

### Get data

`node.getData()`

**Returns** the data stored in the node, or null if no data.

### Match / query nodes in the tree

`node.match(query)`

- `query {String|Array}`: The path to match nodes' path patterns.

**Returns** an array of matching nodes.

**Example:**

```
var child1 = node.insert("hello.#.world");
var child2 = node.insert("hello.*.world");
var child3 = node.insert("hello.foo.bar.world");

node.match("hello.foo.bar.world");
// returned array will contain child1 and child3, but not child3.
```

### Find a specific node

`node.find(path)`

- `query {String|Array}`: The path of the requested node.

**Returns** the found node, or null if not found.

**Example:**

```
// the following expression is true:
node.insert("hello.#.world") === node.find("hello.#.world");
```

### Insert a new node under a path

`node.insert(path)`

Insert a node under the specified path. If a node already exists under this path
it will be resetted.

- `path {String|Array}`: The path of the new node.

**Returns** the newly created node.

## Paths structure

A path is simply a string with one or more sections. Sections are separated
by a `'.'`. Sections in a path form the nodes hirarchy in the tree.  
For example, the path `'country.city.street'` has three sections `'country'`,
`'city'` and `'street'`. The node under `'country.city.street'` is a child of
the node under `'country.city'`, etc.

```
        country
          / \
         /   \
        /     \
      city    ...
      / \
     /   \
    /     \
 street   ...
```

### Fuzzy paths & wildcards

Any section of a path can be a wildcard; in which case the path is termed a
"fuzzy path". When querying the tree for matches of a specific path, any node
under a fuzzy path with a matching structure will be returned as well.

There are two types of wildcards:

- `'*'`: Matches exactly one section.
- `'#'`: Matches one or more sections.

For example, let's say we have two nodes in the tree under the following fuzzy
paths:

`'country.*.street'`
`'country.#.street'`

```
        country
          / \
         /   \
        /     \
       *       #
      /         \
     /           \
    /             \
 street         street
```

When we query for matches against `'country.city.street'` both nodes will be
returend. But when querying against `'country.state.city.street'`, only the
second node will be returned.
