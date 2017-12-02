var DrawPath = function(x, y) {
	this.x = this.lx = x;
	this.y = this.ly = y;
	this.comm = [];
		
	this.line = function(x, y) {
		this.put('L', x, y);
	};
	this.quad = function(cx, cy, x, y) {
		if (arguments.length < 3) this.put('T', cx, cy);
		else this.put('Q', cx, cy, x, y);
	};
	this.trig = function(x, y) {
		return [Math.hypot(x,y), Math.atan2(x,y)];
	};
	this.untrig = function(l, a) {
		return [Math.sin(a)*l, Math.cos(a)*l];
	};
	this.part = function(x, y, dist) {
		var t = this.trig(x, y);
		var l = t[0]; 
		if (dist <= 1.0) l *= dist; 
		else l -= dist;
		return this.untrig(l, t[1]);
	};
	this.repl = function(x, y) {
		var l = this.comm.pop();
		l.pop(); l.pop(); l.push(x); l.push(y);
		this.comm.push(l);
		this.x = x; this.y = y;
	};
	this.dist = function(dist) {
		var c = this.part(this.x-this.lx, this.y-this.ly, dist);
		this.repl(c[0]+this.lx, c[1]+this.ly);
	};
	this.smooth = function(rad, x, y) {
		var c1 = [this.x, this.y];
		var c2 = this.part(this.x-x, this.y-y, rad);
		this.dist(rad);
		
		this.quad(c1[0], c1[1], c2[0]+x, c2[1]+y);
		this.line(x, y);
	};
	this.curve = function(delta, x, y) {
		var cx = (x-this.x);
		var cy = (y-this.y);
		this.quad(this.x + cx * delta, this.y, this.x+cx/2, this.y+cy/2);
		this.quad(x, y);
		
	};
	this.put = function(...args) {
		this.lx = this.x; this.ly = this.y;
		this.y = args.pop(); this.x = args.pop();
		args.push(this.x); args.push(this.y);
		for(var i = 1; i < args.length; i++) args[i] = Math.round(args[i]);
		this.comm.push(args);
	};
	this.path = function() {
		var p = [];
		for(var i in this.comm) p.push(this.comm[i].join(' '));
		return p.join(',');
	};
	
	this.put('M', x, y);
};