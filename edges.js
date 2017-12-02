


var addMarker = function(html) {
	var defs  = $('svg.graphLog defs')[0];
	var mark = document.createElement('marker');
	defs.appendChild(mark);
	mark.outerHTML = html;
};

var isInit = false;
var doInit = function() {
	if (isInit) return;
	addMarker(
		'<marker id="edgeRevArrowEnd" viewBox="-5 -5 10 10" refX="0" refY="0" markerUnits="strokeWidth" markerWidth="4" markerHeight="3" orient="auto">'+
		'<path d="M -5 -3 L 5 0 L -5 3 z" fill="rgb(74, 74, 74)"></path>'+
		'</marker>');
	addMarker(
		'<marker id="edgeArrowEnd" viewBox="0 0 10 10" refX="0" refY="2" markerUnits="strokeWidth" markerWidth="4" markerHeight="3" orient="auto">'+
		'<path d="M 0 0 L 6 2 L 0 4 z" fill="rgb(74, 74, 74)"></path>'+
		'</marker>');
	isInit = true;
};

var type = 'smooth'; //direct detour smooth curvy
var setGraphAttr = function(val) {
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

//var ko = require('knockout');
var components = require('ungit-components');
var GraphViewFactory = components.registered.graph;

components.register('graph', function(args) {
	var gv = GraphViewFactory(args);
	gv.__parent = {
		getEdge: gv.getEdge.bind(gv),
		updateNode: gv.updateNode.bind(gv)
	};
	gv.getEdge = function(nodeAsha1, nodeBsha1) {
		doInit();
		var edge = this.__parent.getEdge(nodeAsha1, nodeBsha1);
		edge.setGraphAttr = setGraphAttr;
		return edge;
	};
	gv.updateNode = function(parentElement) {
		//ko.renderTemplate('edges', this, {}, parentElement);
		this.__parent.updateNode(parentElement);
	}
	return gv;
});




/*
var ko = require('knockout');

class EdgesViewModel {
	getEdge(nodeAsha1, nodeBsha1) {
		console.log('edges get', this);
		doInit();
		var edge = super.getEdge(nodeAsha1, nodeBsha1);
		edge.setGraphAttr = setGraphAttr;
		return edge;
	};
	
	updateNode(parentElement) {
		ko.renderTemplate('edges', this, {}, parentElement);
	};
	
	onProgramEvent(event) {
		console.log('edgesevent', event.event);
	};
};

components.register('edges', function(args) {
	return new EdgesViewModel(args);
});
//*/
