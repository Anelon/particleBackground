const particleSpeed = 2;
class Particle {
    constructor(location, speed, radius = 2) {
        if(!(location instanceof Vec2))
            throw TypeError("Particle Location needs to be Vec2");
        if(!(speed instanceof Vec2))
            throw TypeError("Particle Speed needs to be Vec2");

        this.location = location;
        this.speed = speed.makeUnit().multiplyScalar(particleSpeed);;
        this.radius = radius;
    }
    update(dt) {
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
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.location.x, this.location.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "darkgray";
        ctx.fill();
        //ctx.stroke();
    }
    //figure out what get location would look like
    getLocation() {
        return this.location;
    }
}
