const particleSpeed = 20;
class Particle {
	constructor(location, speed, radius = 5) {
		if(!(location instanceof Vec2))
			throw TypeError("Particle Location needs to be Vec2");
		if(!(speed instanceof Vec2))
			throw TypeError("Particle Speed needs to be Vec2");

		this.location = location;
		this.speed = speed.makeUnit().multiplyScalar(particleSpeed);;
		this.radius = radius;
		this.color = "#aaaaaa";
		this.updated = false;
		this.connections = 0;
	}
	//TODO use dt 
	update(dt, qt, collide = true) {
		if(!(qt instanceof QuadTree))
			throw TypeError("qt in update not a QuadTree");
		//skip if already updatded
		if(this.updated) return;
		if(collide) {
			//very lazy collisions
			const area = new Cirlce(this.location.clone(), this.radius * 2);
			const near = qt.query(area);
			for(let p of near) {
				//don't collide with self
				if(p === this) continue;
				let tempSpeed = this.speed.clone();
				this.speed = p.speed.clone();
				p.speed = tempSpeed;
				p.update(dt,qt, false);
			}
		}
		this.location.addS(this.speed.multiplyScalar(dt));
		//lazy boundries
		if(this.location.x < 0) {
			this.location.x *= -1; // put back on screen
			this.speed.x *= -1;
		}
		if(this.location.y < 0) {
			this.location.y *= -1; // put back on screen
			this.speed.y *= -1;
		}
		if(this.location.x >= canvas.width) {
			this.location.x = canvas.width - (this.location.x - canvas.width);
			this.speed.x *= -1;
		}
		if(this.location.y >= canvas.height) {
			this.location.y = canvas.height - (this.location.y - canvas.height);
			this.speed.y *= -1;
		}
		this.updated = true;
	}
	draw() {
		ctx.beginPath();
		ctx.arc(this.location.x, this.location.y, this.radius, 0, 2 * Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
		//ctx.stroke();
	}
	//figure out what get location would look like
	getLocation() {
		return this.location.clone();
	}
	get y() {
		return this.location.y;
	}
	get x() {
		return this.location.x;
	}
}
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
const canvas = document.getElementById("particles");

//TODO somehow handle resizeing?
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const particleDensity = 5000; //one particle for every x px
const numParticles = (canvas.width * canvas.height) / particleDensity;
//const numParticles = 500;
const searchRadius = 100;
const fadeRate = 10;
const maxWhite = 160;
const maxConnections = 2;
let debug = false;

/*
const wasmModule = new WebAssembly.Module(wasmCode);
const wasmInstance = new WebAssembly.Instance(wasmModule, {
});
*/

let particles = [];
let center = new Vec2(canvas.width/2, canvas.height/2);
let boundry = new Rectangle(center, canvas.width, canvas.height);
for(let i = 0; i < numParticles; i++) {
	//make random
	let pos = new Vec2(canvas.width * Math.random(), canvas.height * Math.random());
	let speed = new Vec2(Math.random() - .5,Math.random() - .5);
	let particle = new Particle(pos, speed);
	particle.draw();
	particles.push(particle);
}
var qt;
let time = performance.now();

function scale(num, outMax) {
	let y = (1/2) * num * num;
	if(y < outMax) return y;
	else return outMax;
	//return (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function animate() {
	let currTime = performance.now();
	let dt = (currTime - time) / 1000;
	time = currTime;
	//clear canvas
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	qt = new QuadTree(boundry, 5);

	//reset veriables
	for(let particle of particles) {
		particle.updated = false;
		particle.color = "#aaaaaa";
		particle.connections = 0;
		qt.push(particle);
	}

	//draw all particles should change particles to quad tree eventually
	for(let particle of particles) {
		particle.update(dt,qt);
	}

	if(debug) qt.draw();

	for(let particle of particles) {
		let area = new Cirlce(particle.location.clone(), searchRadius);
		let near = qt.query(area);
		//for(auto part : near) { in c++
		for(let part of near) {
			//skip this
			if(part === particle) continue;
			let distance = particle.location.sub(part).magnitude();
			//reverse the scale
			distance = searchRadius - distance;
			//fix the scale to be 0-255 instead of 0-searchRadius
			distance = Math.floor(scale(distance,maxWhite));

			//convert the distance to a hexColor
			let hexString = distance.toString(16);
			if(hexString.length < 2) hexString = "0" + hexString;
			let colorStr = "#" + hexString + hexString + hexString;

			//TODO sort lines by distance before drawing all of them
			//draw line from partical to other particle using color
			drawLine(particle.location, part.location, colorStr);
		}
		//might need to be it's own loop
		particle.draw();
	}
	requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

function drawCircle(x,y,r,color = "darkgray") {
	ctx.beginPath();
	ctx.arc(x,y,r,0, 2 * Math.PI);
	ctx.fillStyle = color;
	ctx.fill();
}

function drawLine(start, end, color = "#bbbbbb") {
	//if(start instanceof Vec2) 
		//throw TypeError("Line start not Vec2");
	//if(end instanceof Vec2) 
		//throw TypeError("Line end not Vec2");

	ctx.beginPath();
	ctx.lineWidth = "2";
	ctx.strokeStyle = color;
	ctx.moveTo(start.x, start.y);
	ctx.lineTo(end.x, end.y);
	ctx.stroke();
}
class Vec2 {
    constructor(x=0,y=0) {
        this.x = x;
        this.y = y;
    }
    clone() {
        return new Vec2(this.x, this.y);
    }
    //makes new Vec2 and does operation
    add(other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }
    sub(other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    }
    multiplyScalar(scalar) {
        return new Vec2(this.x * scalar, this.y * scalar);
    }
    //does operation on this
    addS(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    subS(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    multiplyScalarS(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    makeUnit() {
        let mag = this.magnitude();
        this.x /= mag;
        this.y /= mag;
        return this;
    }
}
