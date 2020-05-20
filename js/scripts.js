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
