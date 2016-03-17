var width = window.innerWidth,
    height = window.innerHeight;

var outer = d3.select("div#graph").append("svg")
	.call(d3.behavior.zoom().on("zoom", rescale))
	.on("dblclick.zoom", null)
	.attr("width", width)
	.attr("height", height)
	.attr("pointer-events", "all");

var svg = outer.append("svg:g")
    .attr("width", width)
    .attr("height", height);

var node = svg.selectAll(".node"),
    link = svg.selectAll(".link");
var nodes = [],
    links = [];

var color = d3.scale.category20b();

// Add ROOT node
nodes.push({
	"path": "root",
	"type": "tree",
	"size": 0,
	"parent": null,
	"filename": "root",
	"name": "root"
});

var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .charge(-400)
    .linkDistance(10)
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
	node.enter().append("circle").attr("class", "node")
		.attr("r", function(d) {
			return d.path == 'root' ? 15 : (Math.log(d.size + 1) || 3);
		})
		.style("fill", function(d) {
			return d.name === "root" ? '#f00' : color(d.path.length);
		});
	node.exit().remove();

	force.start();
}

// Rescale function, called on zoom event
function rescale() {
	trans = d3.event.translate;
	scale = d3.event.scale;
	svg.attr("transform",
		"translate(" + trans + ")" + " scale(" + scale + ")");
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

function addPathToTree(path, size) {

	var pathHistory = getPathHistoryArray(path).map(function(d) {
		return { path: d, size: size };
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

	// calculate the initial nodes and links
	var treeNodes = d3.layout.tree().nodes(pathTree[0]);
	var treeLinks = d3.layout.tree().links(treeNodes);

	// all existing nodes in the tree
	var nodesArr = nodes.map(function(d) { return d.path; });
	var localNodes = treeNodes.map(function(d) { return d.path; });

	// index of treeNodes where the branch breaks and we keep idx -> END nodes
	// in other words, the last node which already exists in the existing tree
	var localTreeBreakingIndex;

	for (var i = 2; i < nodesArr.length + 1; i++) {
		var thisIndex = localNodes.indexOf(nodesArr[i]);
		var prevIndex = localNodes.indexOf(nodesArr[i - 1]);

		// this here will for sure only happen once, since the path here speartes into its own unique branch
		if (prevIndex > 0 && thisIndex < 0) {
			localTreeBreakingIndex = prevIndex;
			break;
		}
	}

	if (localTreeBreakingIndex == treeNodes.length - 1) { // this whole path is a copy and it already exists
		return;
	}

	if (localTreeBreakingIndex === undefined) {
		// this is a totally new branch, add all nodes and hook first node to root and it's over

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
		// this is a partial branch, only add nodes > (localTreeBreakingIndex + 1) and connect the proper links

		var newNodes = treeNodes.slice(localTreeBreakingIndex + 1, treeNodes.length);

		var branchingOffIndex = nodesArr.indexOf(localNodes[localTreeBreakingIndex]);
		var newLinks = d3.layout.tree().links(newNodes);
		newLinks.unshift({
			source: nodes[branchingOffIndex],
			target: newNodes[0]
		})

		for (var i = 0; i < newNodes.length; i++) {
			nodes.push(newNodes[i]);
		}
		for (var i = 0; i < newLinks.length; i++) {
			links.push(newLinks[i]);
		}
	}

	update();
}



/// MARK:- Tests
// addPathToTree("/var/www/html/other", 123);
// addPathToTree("/private/var/db/local", 456);
// addPathToTree("/var/www/html/mysite/js/jquerylib", 789);