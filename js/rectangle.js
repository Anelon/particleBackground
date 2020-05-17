class Rectangle {
    constructor(center, width, height) {
        console.assert(center instanceof Vec2, "Rectangle center not a Vec2");
        this.center = center;
        this.width = width;
        this.height = height;
    }
    get left() {
        return this.center.x - this.width / 2;
    }
    get right() {
        return this.center.x + this.width / 2;
    }
    get top() {
        return this.center.y - this.height / 2;
    }
    get bottom() {
        return this.center.y + this.height / 2;
    }
    contains(point) {
        console.assert(point instanceof Vec2, "Contains point not a Vec2");
        //hmm I feel like widht and height should be / 2
        return (
            point.x >= this.location.x - this.width &&
            point.x <= this.location.x + this.width &&
            point.y >= this.location.y - this.height &&
            point.y <= this.location.y + this.height
        );
    }
    intersects(range) {
        return !(
            range.location.x - range.width > this.location.x + this.width ||
            range.location.x + range.width < this.location.x - this.width ||
            range.location.y - range.height > this.location.y + this.height ||
            range.location.y + range.height < this.location.y - this.height
        );
    }
}
