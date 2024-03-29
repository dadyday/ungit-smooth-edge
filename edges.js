const components = require('ungit-components');
const moment = require('moment');

function addMarker(html) {
	var defs = document.querySelector('svg.graphLog defs');
	var mark = document.createElement('marker');
	defs.appendChild(mark);
	mark.outerHTML = html;
};

var isInit = false;
function doInit() {
	if (isInit) return;
	addMarker(
		'<marker id="edgeRevArrowEnd" viewBox="-5 -5 10 10" refX="0" refY="0" markerUnits="strokeWidth" markerWidth="4" markerHeight="3" orient="auto">'+
		'<path d="M -5 -3 L 5 0 L -5 3 z" fill="rgb(74, 74, 74)"></path>'+
		'</marker>');
	addMarker(
		'<marker id="edgeArrowEnd" viewBox="-5 -5 15 15" refX="0" refY="2" markerUnits="strokeWidth" markerWidth="4" markerHeight="3" orient="auto">'+
		'<path d="M 0 -3 L 10 2 L 0 7 z" fill="rgb(74, 74, 74)"></path>'+
		'</marker>');
	isInit = true;
};

var type = 'smooth'; //direct detour smooth curvy
function setGraphAttr(val) {
	var x2 = val[0], y2 = val[1];
	var x1 = val[4], y1 = val[5];
	var rev = y2 > y1 ? (x2 > x1) : (x2 < x1);

	var dir = x2 < x1 ? -1 : (x2 > x1 ? 1 : 0);
	var main = x2 < 650;
	var rad = main ? 50 : 35;

	var d = new DrawPath(x1, y1);

	switch (!dir ? 'direct' : type) {
		case 'direct':
			d.line(x2, y2);
			d.dist(rad);
			break;
		case 'detour':
			if (dir < 0) d.line(x1, y2);
			else d.line(x2, y1);

			d.line(x2, y2);
			d.dist(rad);
			break;
		case 'smooth':
			if (dir < 0) {
				y2 += main ? 10 : 5;
				d.line(x1, y2);
				d.dist(30);
			}
			else d.line(x2, y1);
			d.smooth(20, x2, y2);
			d.dist(rad);
			break;
		case 'curvy':
			d.curve(0.4, x2, y2);

			break;
	};
	this.element().setAttribute('d', d.path());
	this.element().setAttribute('fill', 'none');

	this.element().setAttribute('marker-end', dir < 0 ? 'url(#edgeRevArrowEnd)' : 'url(#edgeArrowEnd)');
};

function computeNode(nodes) {
	nodes = this.__parent.computeNode(nodes);

	/*var lastOrder = -1;
	nodes.forEach((oNode) => {
		var oBranch = oNode.ideologicalBranch();
		var aParent = oNode.parents();
		if (aParent.length > 1 && oBranch.branchOrder == lastOrder) {
			oNode.branchOrder(oBranch.branchOrder+1);
		}
		lastOrder = oBranch.branchOrder;
	});//*/

	// reset branchOrder
	nodes.forEach((oNode) => oNode.flag = -1);

	const setBranchOrder = (oNode, order) => {
		const aParent = oNode.parents();
		const isMerge = aParent.length > 1;
		const oFirstParent = this.nodesById[aParent[0]];
		const hasOrder = oFirstParent ? oFirstParent.flag <= order : false;
		const isBranch = !isMerge && hasOrder && oFirstParent.flag < order;

		console.log(oNode.sha1, order,isMerge,hasOrder,isBranch);

		if (oNode.flag > order) return;
		oNode.branchOrder(order);
		oNode.flag = order;

		aParent.forEach((parent) => {
			var oParent = this.nodesById[parent];
			if (oParent) {
				setBranchOrder(oParent, order++);
			}
		});
	};

	nodes.forEach((oNode) => {
		setBranchOrder(oNode, 1);
	});//*/

	//setBranchOrder(nodes[0], 0);
	console.log(nodes[2]);
    return nodes;
};


var GraphViewFactory = components.registered.graph;

components.register('graph', function(args) {
	var gv = GraphViewFactory(args);
	isInit = false;
	gv.__parent = {
		getEdge: gv.getEdge.bind(gv),
		updateNode: gv.updateNode.bind(gv),
		computeNode: gv.computeNode.bind(gv)
	};
	gv.getEdge = function(nodeAsha1, nodeBsha1) {
		doInit();
		var edge = this.__parent.getEdge(nodeAsha1, nodeBsha1);
		edge.setGraphAttr = setGraphAttr;
		return edge;
	};
	gv.updateNode = function(parentElement) {
		this.__parent.updateNode(parentElement);
	};
	gv.computeNode = computeNode;
	return gv;
});
