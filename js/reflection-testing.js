console.log('sa')

const d = document, w = window
size = [800, 800]

intersection = ([A, B], [C, D]) => [
	((A.x - C.x) * (C.y - D.y) - (A.y - C.y) * (C.x - D.x)) / ((A.x - B.x) * (C.y - D.y) - (A.y - B.y) * (C.x - D.x)),
	((A.x - C.x) * (A.y - B.y) - (A.y - C.y) * (A.x - B.x)) / ((A.x - B.x) * (C.y - D.y) - (A.y - B.y) * (C.x - D.x))
]
distance = (A, B) => Math.sqrt((A[0] - B[0]) ** 2 + (A[1] - B[1]) ** 2)
lerp = (A, B, t) => A + (B - A) * t
resultant = (a, b) => [Math.sqrt(a ** 2 + b ** 2), Math.atan(b / a) + (Math.sign(a || 1) == -1 ? Math.PI : 0)]
toRadians = n => n * Math.PI / 180
toDegrees = n => n * 180 / Math.PI

class Engine {
	constructor(ctx) {
		this.ctx = ctx, this.canvas = canvas
		this.vectors = []
		this.lines = []
	}

	createVector(x, y, opt) {
		var vector = new Vector(x, y, opt, this)
		this.vectors.push(vector); return vector
	}

	createLine(A, B, opt) {
		var line = new Line(A, B, opt, this)
		this.lines.push(line); return line
	}

	draw() {
		this.vectors.forEach(vector => vector.draw())
		this.lines.forEach(line => line.draw())
	}

	update(dt) {
		this.vectors.forEach(vector => vector.update(dt))
		this.lines.forEach(line => line.update(dt))
	}
}

class Vector {
	constructor(x, y, opt, eg) {
		this.x = x, this.y = y, this.eg = eg, this.ctx = eg.ctx
		Object.assign(this, opt)
	}

	static distance(A, B) { return distance([A.x, A.y], [B.x, B.y]) }

	get pos() { return [this.x, this.y] }
	set pos(arr) { this.x = arr[0], this.y = arr[1]  } 	
	get ["0"]() { return this.x }
	get ["1"]() { return this.y }
	
	draw(opt) {
		this.ctx.fillStyle = opt?.fill || 'white'
		this.ctx.beginPath()
		this.ctx.arc(this.x, this.y, opt?.radius || 3, 0, Math.PI * 2)
		this.ctx.fill(), this.ctx.closePath()
		this.ctx.fillText(this.name || '', this.x, this.y)
	}

	*[Symbol.iterator]() { yield this.x; yield this.y }
}

class Line { 
	constructor(A, B, opt, eg) {
		this.A = A instanceof Vector ? A : new Vector(A[0], A[1], A[2] || opt, eg)
		this.B = B instanceof Vector ? B : new Vector(B[0], B[1], B[2] || opt, eg)
		Object.assign(this, opt), this.eg = eg, this.ctx = eg.ctx
	}
	
	get ["0"]() { return this.A }
	get ["1"]() { return this.B }
	get slope() { return (this.A.y - this.B.y) / (this.A.x - this.B.x) }
	get angle() { return Math.PI * 2 + Math.atan2(this.A.y - this.B.y, this.A.x - this.B.x) - (Math.sign(this.A.y - this.B.y) == 1 ? Math.PI * 2 : 0) }

	update(dt) {
		if (this.frozen) return
		this.eg.lines.forEach(line => {
			if (line == this) return
			let i = this.intersect(line)
			if (!i) return
			
			// intersection point
			this.ctx.beginPath()
			this.ctx.arc(...i, 4, 0, Math.PI * 2)
			this.ctx.fill(), this.ctx.closePath()
			
			let thisAngle = Math.PI * 1 - this.angle
			let reflection = Math.matrix.mult(
				Math.matrix.rotation(Math.atan(line.slope)),
				[[Math.cos(thisAngle)], [Math.sin(thisAngle)]])
			
			this.ctx.beginPath()
			this.ctx.strokeStyle = 'green'
			this.ctx.moveTo(i[0], i[1])
			this.ctx.lineTo(i[0] + reflection[0][0] * 100, i[1] + reflection[1][0] * 100)
			this.ctx.stroke(), this.ctx.closePath()
		})
	}

	draw(opt) {
		this.ctx.strokeStyle = opt?.stroke || 'white'
		this.ctx.lineWidth = opt?.width || 3
		this.ctx.beginPath()
		this.ctx.moveTo(...this.A)
		this.ctx.lineTo(...this.B)
		this.ctx.stroke(), this.ctx.closePath()
		this.A.draw(opt), this.B.draw(opt)
	}

	intersect(line) {
		var i = intersection([this.A, this.B], [line.A, line.B]), is = []
		if (i.every(t => t >= 0 && t <= 1)) return [lerp(this.A.x, this.B.x, i[0]), lerp(line.A.y, line.B.y, i[1])]
		else return null
	}
}

Math.matrix = {
	scalarMult(M, t) {
		return M.map(row => row.map(v => v * t))
	},
	rotation(angle) {
		return [[Math.cos(angle * -2), Math.sin(angle * -2)], [-Math.sin(angle * -2), Math.cos(angle * -2)]]
	},
	add(M, N) {
		if (M.length != N.length || M[0].length != N[0].length) return null
		return M.map((row, ri) => row.map((v, ci) => v + N[ri][ci]))
	},
	mult(M, N) {
		if (M[0].length != N.length) return null
		var matrix = []
		for (let Mrow = 0; Mrow < M.length; Mrow++) {
			matrix[Mrow] = new Array(N[0].length).fill(0)
			for (let Ncol = 0; Ncol < N[0].length; Ncol++) 
				for (let Mcol = 0; Mcol < M[0].length; Mcol++) 
					matrix[Mrow][Ncol] += M[Mrow][Mcol] * N[Mcol][Ncol]
		}
		return matrix
	}
}

function draw() {
	dt = (performance.now() - oldT) / 1000
	t += dt

	ctx.clearRect(0, 0, canvas.width, canvas.height)
	eg.draw(); eg.update(dt) 

	requestAnimationFrame(draw)
}

mouse = { x: 0, y: 0 }

onload = function onload() {
	canvas = d.querySelector('canvas')
	ctx = canvas.getContext('2d')
	canvas.width = size[0], canvas.height = size[1]
	var calcMouse = ({ offsetX, offsetY, targetTouches}) => (mouse.x = (offsetX || targetTouches?.[0]?.clientX) * size[0] / canvas.offsetWidth, mouse.y = (offsetY || targetTouches?.[0]?.clientY) * size[1] / canvas.offsetHeight)
	!['mousemove', 'touchmove'].forEach(e => canvas.addEventListener(e, calcMouse))

	eg = new Engine(ctx)
	
	let rand = () => Math.random() * 800
	for (let i = 0; i < 10; i++)
		eg.createLine([rand(), rand()], [rand(), rand()]).frozen = true

	line = eg.createLine([0, 0], [0, 0])
	line.A.name = 'A'
	line.B.name = 'B'
	canvas.onmousemove = ({ ctrlKey: ctrl }) => {
		if (ctrl) line.A.pos = [mouse.x, mouse.y]
		else line.B.pos = [mouse.x, mouse.y]
	}

	oldT = performance.now(), t = 0
	draw()
}
