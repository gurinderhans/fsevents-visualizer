var width = window.innerWidth,
    height = window.innerHeight;
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
var node = svg.selectAll(".node"),
    link = svg.selectAll(".link");
var nodes = [],
    links = [];

var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .charge(-400)
    .linkDistance(120)
    .size([width, height])
    .on("tick", function() {
		node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; })
		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });
	});


function update() {
	link = link.data(force.links());
	link.enter().insert("line", ".node").attr("class", "link");
	link.exit().remove();

	node = node.data(force.nodes());
	node.enter().append("circle").attr("class", "node").attr("r", function(d) {
		return d.path == 'root' ? 15 : (Math.log(d.size + 1) || 3);
	});
	node.exit().remove();

	force.start();
}


/// MARK: - data parsing methods (AKA. front-end layer for the tree)
var FTree = [{
	"path": "root",
	"type": "tree",
	"size": 0,
	"parent": null,
	"filename": "root",
	"name": "root",
	"children": [],
}]

function getPathTree(path) {

	var pathHistory = getPathHistoryArray(path).map(function(d) {
		return { path: d, size: 123 };
	});

	// add additional properties
	pathHistory.forEach(function(o) {
		var indexSlash = o.path.lastIndexOf('/');
		if (indexSlash < 0) {
			o.parent = 'root';
			o.filename = o.path;
			o.name = o.path;
		} else {
			o.parent = o.path.substr(0, indexSlash);
			o.filename = o.path.substr(indexSlash + 1);
			o.name = o.path;
		}
	});

	// create a sample dict with { key == path }
	var dataMap = pathHistory.reduce(function(map, node) {
		map[node.path] = node;
		return map;
	}, {});

	var pathTree = [];
	// use `dataMap` to create the tree structure for this
	pathHistory.forEach(function(node) {
		// add to parent
		var parent = dataMap[node.parent];
		if (parent) {
			// create child array if it doesn't exist
			(parent.children || (parent.children = []))
				.push(node);
		} else {
			// parent is null or missing
			pathTree.push(node);
		}
	});
	
	return pathTree;
}

function getPathHistoryArray(path, arr = []) {
	if (path.indexOf("/") == 0) {
		path = path.slice(1, path.length);
	}
	if (path.lastIndexOf("/") == path.length - 1) {
		path = path.slice(0, path.length - 2);
	}

	var slashIndex = path.lastIndexOf("/")
	if (~slashIndex) {
		getPathHistoryArray(path.slice(0, slashIndex), arr)
	}
	arr.push(path)
	return arr
}



/// MARK:- Tests

var tree = getPathTree("/var/www/html/mysite/js");
var treeNodes = d3.layout.tree().nodes(tree[0]);
var treeLinks = d3.layout.tree().links(treeNodes);
for (var i = 0; i < treeLinks.length; i++) {
	var l = treeLinks[i];
	links.push(l)
}
for (var i = 0; i < treeNodes.length; i++) {
	var n = treeNodes[i];
	nodes.push(n)
}
update();



// var a = { name: "a", size: 123 },
// 	b = { name: "b", size: 456 },
// 	c = { name: "c", size: 789 },
// 	d = { name: "d", size: 1012 };
// nodes.push(a, b, c, d);

// links.push(
// 	{ source: a, target: b },
// 	{ source: a, target: c },
// 	{ source: b, target: c },
// 	{ source: d, target: b },
// 	{ source: a, target: d }
// );
// update();

// function test() {
// 	var e = { name: "e", size: 3456 };
// 	nodes.push(e);
// 	links.push({ source: a, target: e }, { source: e, target: b });
// 	update();
// }
// // test();