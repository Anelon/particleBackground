class Cirlce {
	constructor(center, radius) {
		console.assert(center instanceof Vec2, "Rectangle center not a Vec2");
		this.center = center;
		this.radius = radius;
	}
	contains(point) {
		if(!(point instanceof Particle))
			throw TypeError("Contains point not a Particle");
		//A^2 + B^2 <= C^2
		return (
			Math.pow((point.x - this.center.x),2) + Math.pow((point.y - this.center.y),2) <= this.radius * this.radius
		);
	}
	intersects(range) {
		let xDist = Math.abs(range.center.x - this.center.x);
		let yDist = Math.abs(range.center.y - this.center.y);


		let r = this.radius;
		let w = range.width;
		let h = range.height;

		if(xDist > (r + w) || yDist > (r + h)) return false;
		if(xDist <= w || yDist <= h) return true;

		let edges = Math.pow((xDist - w), 2) + Math.pow((yDist - h), 2);

		return edges <= this.radius * this.radius;
	}
}

class Rectangle {
	constructor(center, width, height) {
		console.assert(center instanceof Vec2, "Rectangle center not a Vec2");
		this.center = center;
		this.width = width;
		this.height = height;
	}
	get left() {
		return this.center.x - (this.width/2);
	}
	get right() {
		return this.center.x + (this.width/2);
	}
	get top() {
		return this.center.y - (this.height/2);
	}
	get bottom() {
		return this.center.y + (this.height/2);
	}
	contains(point) {
		if(!(point instanceof Particle))
			throw TypeError("Contains point not a Particle");
		//hmm I feel like widht and height should be / 2
		return (
			point.x >= this.left &&
			point.x <= this.right &&
			point.y >= this.top &&
			point.y <= this.bottom
		);
	}
	intersects(range) {
		return !(
			range.left > this.right ||
			range.right < this.left ||
			range.top > this.bottom ||
			range.bottom < this.top
		);
	}
}

class QuadTree {
	constructor(boundary, capacity = 10) {
		if(!(boundary instanceof Rectangle))
			throw TypeError("QuadTree boundary not a Rectange");

		this.boundary = boundary;
		this.capacity = capacity;
		this.particles = [];
		this.devided = false;
	}
	static create() {
		let DEFAULT_CAPACITY = 8;
		if (arguments.length === 0) {
			if (typeof width === "undefined") {
				throw new TypeError("No global width defined");
			}
			if (typeof height === "undefined") {
				throw new TypeError("No global height defined");
			}
			let bounds = new Rectangle(width / 2, height / 2, width, height);
			return new QuadTree(bounds, DEFAULT_CAPACITY);
		}
		if (arguments[0] instanceof Rectangle) {
			let capacity = arguments[1] || DEFAULT_CAPACITY;
			return new QuadTree(arguments[0], capacity);
		}
		if (typeof arguments[0] === "number" &&
			typeof arguments[1] === "number" &&
			typeof arguments[2] === "number" &&
			typeof arguments[3] === "number") {
			let capacity = arguments[4] || DEFAULT_CAPACITY;
			return new QuadTree(new Rectangle(arguments[0], arguments[1], arguments[2], arguments[3]), capacity);
		}
		throw new TypeError('Invalid parameters');
	}
	subdivide() {
		let x = this.boundary.center.x;
		let y = this.boundary.center.y;
		let w = this.boundary.width / 2;
		let h = this.boundary.height / 2;


		let ne = new Rectangle(new Vec2(x + w/2, y - h/2), w, h);
		this.northeast = new QuadTree(ne, this.capacity);
		let nw = new Rectangle(new Vec2(x - w/2, y - h/2), w, h);
		this.northwest = new QuadTree(nw, this.capacity);
		let se = new Rectangle(new Vec2(x + w/2, y + h/2), w, h);
		this.southeast = new QuadTree(se, this.capacity);
		let sw = new Rectangle(new Vec2(x - w/2, y + h/2), w, h);
		this.southwest = new QuadTree(sw, this.capacity);

		//TODO push all current particles into sub divisions
		for(let particle of this.particles) {
			if(this.northeast.push(particle)) continue;
			if(this.northwest.push(particle)) continue;
			if(this.southeast.push(particle)) continue;
			if(this.southwest.push(particle)) continue;
		}
		this.particles = []; //empty this.particles

		this.divided = true;
	}
	push(point) {
		if (!(point instanceof Particle))
			throw TypeError("Point is not a Particle");

		if (!this.boundary.contains(point)) {
			return false;
		}

		if(this.divided) {
			return (this.northeast.push(point) || this.northwest.push(point) ||
				this.southeast.push(point) || this.southwest.push(point));
		}

		if (this.particles.length < this.capacity) {
			this.particles.push(point);
			return true;
		}

		if (!this.divided) {
			this.subdivide();
		}

		return (this.northeast.push(point) || this.northwest.push(point) ||
			this.southeast.push(point) || this.southwest.push(point));
	}

	query(range, found) {
		if (!found) {
			found = [];
		}

		if (!range.intersects(this.boundary)) {
			return found;
		}

		if (this.divided) {
			this.northwest.query(range, found);
			this.northeast.query(range, found);
			this.southwest.query(range, found);
			this.southeast.query(range, found);
		} else {
			for (let p of this.particles) {
				if (range.contains(p)) {
					found.push(p);
				}
			}
		}
		return found;
	}

	draw(color = "#211A1E") {
		ctx.beginPath();
		ctx.lineWidth = "4";
		ctx.strokeStyle = color;
		ctx.fillStyle = color;
		ctx.rect(this.boundary.left, this.boundary.top, this.boundary.width, this.boundary.height);
		ctx.fill();
		ctx.stroke();
		//drawCircle(this.boundary.center.x, this.boundary.center.y, 5, "red");
		if (this.divided) {
			this.northwest.draw("#5BC0EB");
			this.northeast.draw("#FDE74C");
			this.southwest.draw("#9BC53D");
			this.southeast.draw("#C3423F");
		}
	}
}
