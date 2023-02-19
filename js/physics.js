intersection = ([A, B], [C, D]) => [
	((A.x - C.x) * (C.y - D.y) - (A.y - C.y) * (C.x - D.x)) / ((A.x - B.x) * (C.y - D.y) - (A.y - B.y) * (C.x - D.x)),
	((A.x - C.x) * (A.y - B.y) - (A.y - C.y) * (A.x - B.x)) / ((A.x - B.x) * (C.y - D.y) - (A.y - B.y) * (C.x - D.x))
]
distance = (A, B) => Math.sqrt((A.x - B.x) ** 2 + (A.y - B.y) ** 2)
lerp = (A, B, t) => A + (B - A) * t

class Vector {
	constructor(x, y, ctx) {
		this.x = x, this.y = y, this.ctx = ctx
	}
	draw(ctx, options) {
		var c = ctx || this.ctx
		c.fillStyle = options?.fill || 'black'
		c.beginPath()
		c.arc(this.x, this.y, options?.radius || 1.5, 0, 360)
		c.fill(), c.closePath()
	}
	*[Symbol.iterator]() { yield this.x; yield this.y }
}

class Line{
	constructor(A, B, ctx) {
		this.A = Array.isArray(A) ? new Vector(...A, ctx) : A
		this.B = Array.isArray(B) ? new Vector(...B, ctx) : B
		this.ctx = ctx || this?.A?.ctx || this?.B?.ctx
	}
	draw(ctx, options) {
		var c = ctx || this.ctx
		c.strokeStyle = options?.stroke || 'gray', c.lineWidth = options?.width || 1.5
		c.beginPath()
		c.moveTo(...this.A); c.lineTo(...this.B)
		c.stroke(); c.closePath()
		this.A.draw(c, options)
		if (options?.B !== false) this.B.draw(c, options)
	}
	intersect(line) {
		var i = intersection([this.A, this.B], [line.A, line.B]), is = []
		if (i.every(t => t >= 0 && t <= 1)) return new Vector(lerp(this.A.x, this.B.x, i[0]), lerp(line.A.y, line.B.y, i[1]), c)
		else return null
	}
	*[Symbol.iterator]() { yield this.A; yield this.B }
}

class Polygon{
	constructor(corners, ctx) {
		this.corners = corners.map(corner => Array.isArray(corner) ? new Vector(...corner) : corner)
		this.sides = []
		for (let i = 0; i < corners.length; i++) this.sides.push(new Line(this.corners[i], this.corners[(i + 1) % corners.length], ctx))
	}
	draw(ctx, options) {
		var c = ctx || this.ctx
		if (!options) var options = {}
		options.B = false
		this.sides.forEach(line => line.draw(c, options))
	}
	intersect(line) {
		var is = []
		for (let side of this.sides) {
			var i = line.intersect(side)
			if (i) is.push([i, distance(line.A, i)])
		}
		if (is.length) {
			var min = [0, Infinity]
			for (let i = 0; i < is.length; i++) if (is[i][1] < min[1]) min = is[i]
			return min[0]
		}
		else return null
	}
}
