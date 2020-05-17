const canvas = document.getElementById("particles");

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let particles = [];
for(let i = 0; i < 100; i++) {
    //make random
    let pos = new Vec2(canvas.width * Math.random(), canvas.height * Math.random());
    let speed = new Vec2(Math.random() - .5,Math.random() - .5);
    speed.makeUnit();
    let particle = new Particle(pos, speed);
    particle.draw();
    particles.push(particle);
}

function animate() {
    //clear canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //draw all particles should change particles to quad tree eventually
    for(let particle of particles) {
        particle.update(1);
        particle.draw();
    }
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
