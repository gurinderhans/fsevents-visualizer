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

function addPathToTree(path) {

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

	// filter tree nodes and links here to prevent dups
	var treeNodes = d3.layout.tree().nodes(pathTree[0]);
	var treeLinks = d3.layout.tree().links(treeNodes);

	// all existing nodes in the tree
	var nodesArr = nodes.map(function(d) { return d.path; });
	var localNodes = treeNodes.map(function(d) { return d.path; });

	console.log("treeNodes:", nodesArr.slice(1, nodesArr.length));
	console.log("localNodes:", localNodes);

	// index of treeNodes where the branch breaks and we keep idx -> END nodes
	// in other words, the last node which already exists in the existing tree
	var localTreeBreakingIndex;

	for (var i = 2; i < nodesArr.length + 1; i++) {
		var thisIndex = localNodes.indexOf(nodesArr[i]);
		var prevIndex = localNodes.indexOf(nodesArr[i - 1]);

		if (prevIndex > 0 && thisIndex < 0) { // this here will for sure only happen once, since the path here speartes into its own unique branch
			localTreeBreakingIndex = prevIndex;
			break;
		}
	}

	if (localTreeBreakingIndex == treeNodes.length - 1) { // this whole path is a copy and it already exists
		return;
	}

	if (localTreeBreakingIndex === undefined) {
		// this is a totally new branch, add all nodes and hook first node to root and it's over
		console.log("new branch");

		// connect link back to root
		treeLinks.unshift({
			source: nodes[0],
			target: treeNodes[0]
		})
		for (var i = 0; i < treeNodes.length; i++) {
			nodes.push(treeNodes[i])
		}

		// console.log("links:", treeLinks);
		for (var i = 0; i < treeLinks.length; i++) {
			links.push(treeLinks[i])
		}
	} else {
		// this is a partial branch, only add nodes > (localTreeBreakingIndex + 1) and links carefully
		// TODO: need the index of node where this new partial branch of nodes will be attached at
		var branchingOffIndex = nodesArr.indexOf(localNodes[localTreeBreakingIndex]);
		var newNodes = treeNodes.slice(localTreeBreakingIndex + 1, treeNodes.length);
		var newLinks = d3.layout.tree().links(newNodes);
		newLinks.unshift({
			source: nodes[branchingOffIndex],
			target: newNodes[0]
		})

		for (var i = 0; i < newNodes.length; i++) {
			nodes.push(newNodes[i])
		}

		// console.log("links:", treeLinks);
		for (var i = 0; i < newLinks.length; i++) {
			links.push(newLinks[i])
		}
		// console.log("newLinks:", newLinks)
		// console.log("partial branch, branching index:", branchingOffIndex);
		// console.log(branchingOffIndex)
	}

	// for (var i = 1; i < nodesArr.length; i++) {
	// 	var nn = nodesArr[i];
	// 	var idx = localNodes.indexOf(nn);
	// 	console.log(idx)
	// 	if (idx > 0) {
	// 		localTreeBreakingIndex = idx;
	// 		return;
	// 	}
	// }
	// console.log("breaking idx:", localTreeBreakingIndex);



	update();
}



/// MARK:- Tests

// add root node
nodes.push({
	"path": "root",
	"type": "tree",
	"size": 0,
	"parent": null,
	"filename": "root",
	"name": "root"
});

addPathToTree("/var/www/html/other");
// addPathToTree("/private/var/db/local");
// addPathToTree("/var/www/html/mysite/js/jquerylib");

// var treeNodes = d3.layout.tree().nodes(tree[0]);
// var treeLinks = d3.layout.tree().links(treeNodes);
// for (var i = 0; i < treeLinks.length; i++) {
// 	var l = treeLinks[i];
// 	links.push(l)
// }
// for (var i = 0; i < treeNodes.length; i++) {
// 	var n = treeNodes[i];
// 	nodes.push(n)
// }
// update();



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