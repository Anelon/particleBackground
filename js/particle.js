const particleSpeed = 20;
class Particle {
	constructor(location, speed, radius = 2) {
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
