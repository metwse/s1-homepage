const d = document

scale = 695_700_000

grid = {
	start: [-150 * scale, -150 * scale],
	end: [150 * scale, 150 * scale],
	cellSize: [7.5 * scale, 7.5 * scale]
}
grid.size = [0, 0].map((_, i) => Math.floor(Math.abs(grid.start[i] - grid.end[i]) / grid.cellSize[i] + 1))

R = [Math.PI / -4, 0, 0]
P = [0, 0, 0]
G = 1

class Vector {
	constructor(x, y, m, r) {
		this.x = x, this.y = y, this.m = m
		this.v = [0, 0], this.F = [], this.a = [0, 0]
		this.F.temp = []
		this.r = r
		if (!r) this.r = (m * 3 / ( 4 * Math.PI)) ** (1 / 3)
	}
	get ['0']() { return this.x }
	get ['1']() { return this.y }

	update(dt) {
		this.a = [0, 0]
		this.F.concat(this.F.temp || []).forEach(F => (this.a[0] += F[0] / this.m, this.a[1] += F[1] / this.m))
		this.F.temp = []
		this.x += this.v[0] * dt + this.a[0] * dt ** 2 / 2
		this.y += this.v[1] * dt + this.a[1] * dt ** 2 / 2
		this.v[0] += this.a[0], this.v[1] += this.a[1]
	}

	applyGravity(vectors) {
		for (let v of vectors) {
			if (v == this) continue
			this.F.temp.push(matrixFromResultant(-G * v.m * this.m / distance(v, this) ** 2, Math.atan2(this.y - v.y, this.x - v.x)))
		}
	}
}

vectors = [new Vector(1.4721e+11 * 0.7, 0, 5.972e+24, scale), new Vector(0, scale, 1.989e+30, scale * 10)]
vectors[0].v[1] = 29.78 * scale

fps = 0, _fps = 0
setInterval(() => (fps = _fps, _fps = 0), 1000)

points = []
!(() => {
	let size = grid.size[0] * grid.size[1]
	for (let i = 0; i < 3; i++) points.push(new Array(size))
	points[2].fill(0)
})()

for (let i = 0; i < grid.size[0] * grid.size[1]; i++) {
	x = i % grid.size[0]
	y = Math.floor(i / grid.size[0])
	points[0][i] = x * grid.cellSize[0] + grid.start[0]
	points[1][i] = y * grid.cellSize[1] + grid.start[0]
	points[2][i] = 0
}


distance = (A, B) => Math.sqrt((A[0] - B[0]) ** 2 + (A[1] - B[1]) ** 2)

matrixFromResultant = (mag, angle) => [mag * Math.cos(angle), mag * Math.sin(angle)]

mainMeasure = angle => ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
drawPoint = (x, y, r) => {
	c.beginPath()
	c.arc(x, y, r || 1, 0, Math.PI * 2)
	c.fill(); c.closePath()
}
drawVector = (x, y) => {
	c.beginPath()
	c.moveTo(0, 0)
	c.lineTo(x, y)
	c.stroke(); c.closePath()
}
drawLine = (x, y, x2, y2) => {
	c.beginPath()
	c.moveTo(x2, y2)
	c.lineTo(x, y)
	c.stroke(); c.closePath()
}

draw = (t) => {
	let dt = (t - oldTime) / 1000
	vectors.forEach(v => (v.applyGravity(vectors), v.update(dt)))

	oldTime = performance.now()
	c.clearRect(0, 0, canvas.width, canvas.height)
	
	for (let y = 0; y < grid.size[1]; y++) { 
		let off = grid.size[0] * y
		for (let x = 0; x < grid.size[0]; x++) {
			let cell = off + x, _x = points[0][cell], _y = points[1][cell], mT = 0
			for (let v of vectors) {
				let z = v.m * 10 / (distance(v, [_x, _y])) ** 2
				if (isFinite(z)) mT += z
				else if (!isNaN(z)) mT = 9999999
			}
			points[2][cell] = mT
		}
	}

	if (_.R.auto.checked) {	 
		R = [Math.sin(t / -9000) * Math.PI / -5 - Math.PI / 3, 0, Math.PI / 4]
		_.R.x.value = mainMeasure(R[0]) * 100, _.R.y.value = mainMeasure(R[1]) * 100, _.R.z.value = mainMeasure(R[2]) * 100
	} else R = [_.R.x.value / 100, _.R.y.value / 100, _.R.z.value / 100]

	var projM = Math.matrix.mult(Math.matrix.mult(
			[[1, 0, 0], [0, Math.cos(R[0]), -Math.sin(R[0])], [0, Math.sin(R[0]), Math.cos(R[0])]], 
			[[Math.cos(R[1]), 0, -Math.sin(R[1])], [0, 1, 0], [Math.sin(R[1]), 0, Math.cos(R[1])]]),
			[[Math.cos(R[2]), -Math.sin(R[2]), 0], [Math.sin(R[2]), Math.cos(R[2]), 0], [0, 0, 1]])

	c.setTransform(1 / scale, 0, 0, 1 / scale, canvas.width / 2, canvas.height / 2)
	var _points = Math.matrix.mult(projM, points)
	c.strokeStyle = 'gray', c.lineWidth = scale
	for (let i = 0; i < _points[0].length; i++) { 
		if ((i + 1) % grid.size[0]) drawLine(_points[0][i], _points[1][i], _points[0][i + 1], _points[1][i + 1])
		if (Math.ceil(i / grid.size[0]) != grid.size[1]) drawLine(_points[0][i], _points[1][i], _points[0][i + grid.size[0]], _points[1][i + grid.size[0]]) 
	}

	var _vectors = [[], [], [0, 0]]
	for (let v of vectors) _vectors[0].push(v[0]), _vectors[1].push(v[1])
	_vectors = Math.matrix.mult(projM, _vectors)
	for (let i = 0; i < _vectors[0].length; i++) drawPoint(_vectors[0][i], _vectors[1][i], vectors[i].r * 2)


	c.setTransform(1, 0, 0, 1, canvas.width / 2, canvas.height / 2)
	//axises
	var _axises = Math.matrix.mult(projM, [[1, 0, 0], [0, 1, 0], [0, 0, 1]])
	c.font = '16px monospace', c.lineWidth = 1
	for (let i = 0; i < 3; i++) {
		c.strokeStyle = c.fillStyle = ['red', 'blue', 'green'][i]
		drawVector(_axises[0][i] * 50, _axises[1][i] * 50)
		c.fillText(['x', 'y', 'z'][i], projM[0][i] * 50, projM[1][i] * 50)
	}

	c.setTransform(1, 0, 0, 1, 0, 0)
	c.fillStyle = 'white'
	_fps++; c.fillText(fps, 10, 20)
	requestAnimationFrame(draw)	
}

onload = () => {
	canvas = d.querySelector('canvas')
	c = canvas.getContext('2d')
	
	_ = {
		R: { 
			auto: d.querySelector('.rotations .auto'),
			x: d.querySelector('.rotations .x'),
			y: d.querySelector('.rotations .y'),
			z: d.querySelector('.rotations .z'),
		}
	}
	_.R.auto.oninput = ({ target: { checked } }) => _.R.x.disabled = _.R.y.disabled = _.R.z.disabled = _.R.auto.checked
	let controls = d.querySelector('.controls')
	controls.onclick = controls.onmouseenter = () => controls.querySelector('main > span > span').style.display = 'none'
	controls.onmouseover
	oldTime = performance.now()
	draw(oldTime)
}


Math.matrix = {
	scalarMult(M, t) {
		return M.map(row => row.map(v => v * t))
	},
	rotation(angle) {
		return [[Math.cos(angle), Math.sin(angle)], [-Math.sin(angle), Math.cos(angle)]]
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
	},
}
