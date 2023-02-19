console.log('sa')

const d = document
s = [4, 4]
speed = 1

resultant = v => Math.sqrt(v[0] ** 2 + v[1] ** 2) //* s[0]
toRadians = n => Math.PI * n / 180
toDegrees = r => r * 180 / Math.PI

distance = (K, L) => {
	c.strokeStyle = 'white'
	c.lineWidth = .3
	c.beginPath()
	c.moveTo(K.x, K.y - 5); c.lineTo(L.x, L.y - 5)
	c.stroke()
	c.font = '2px  monospace'
	c.fillStyle = 'red'
	c.fillText(`${(L.x - K.x).toFixed(2)}m`, (K.x + L.x) / 2, L.y - 6)
}

class Car {
	constructor(x, y, m, n) {
		this.x = x, this.y = y, this.m = m
		this.forces = [], this.acc = [0, 0], this.vel = [0, 0]
		this.n = n
	}
	draw(details) {
		c.fillStyle = 'white'
		c.fillRect(this.x, this.y - 10, 1, 10)
		c.font = '4px  monospace'
		c.fillText(this.n, this.x, this.y + 4)
		if (!details) return
		c.font = '3px  monospace'
		c.fillText(`v=${resultant(this.vel).toFixed(2)}`, this.x, this.y + 7)
		c.fillText(`a=${resultant(this.acc).toFixed(2)}`, this.x, this.y + 10)
		c.fillText(`x=${this.x.toFixed(2)}`, this.x, this.y + 13)
	}
	update(dt) {
		this.acc = [0, 0]
		this.forces.forEach(f => {
			this.acc[0] += f[0] * Math.cos(toRadians(f[1])) / this.m
			this.acc[1] += f[0] * Math.sin(toRadians(f[1])) / this.m
		})
		this.x += this.vel[0] * dt + (this.acc[0] * dt ** 2) / 2
		this.y += this.vel[1] * dt + (this.acc[1] * dt ** 2) / 2
		this.vel[0] += this.acc[0] * dt
		this.vel[1] += this.acc[1] * dt
	}
}


update = (first) => {
	dt = (performance.now() - oldTime) / 1000 * speed, oldTime = performance.now()
	t = ((performance.now() - startTime) / 1000 * speed).toFixed(2)
	timeBar.innerHTML = 't=' + (t <= 20 ? t : '20.00')
	if (t > 20.5 || dimessions != [innerWidth, innerHeight].toString()) return start()
	else if (t > 20) return requestAnimationFrame(update)
	c.clearRect(0, 0, canvas.width, canvas.height);
	K.draw(true), L.draw()
	M.draw(true), N.draw()
	distance(K, L); distance(M, N)
	if (t >= 5) K.forces = [], K.vel = [8, 0]
	if (t >= 15) M.forces = [], M.vel = [0, 0], N.vel = [0, 0]
	if (t > 17.5) N.vel = [8, 0]
	K.update(dt), L.update(dt)
	M.update(dt), N.update(dt)
	if (first === true) setTimeout(() => { startTime = oldTime = performance.now(); update() }, 500)
	else requestAnimationFrame(update)
}

start = () => {
	canvas = d.querySelector('canvas')
	canvas.style = `width: ${innerWidth}px; height: ${innerHeight}px`
	canvas.width = innerWidth * 2, canvas.height = innerHeight * 2
	s = new Array(2).fill(innerWidth / 90)
	c = canvas.getContext('2d'); c.scale(...s)
	timeBar = d.getElementById('t')
	startTime = oldTime = performance.now()
	dimessions = [innerWidth, innerHeight].toString()

	K = new Car(5, innerHeight * .75 / s[1], 1, 'K'), L = new Car(35, innerHeight * .75 / s[1], 1, 'L')
	K.vel = [20, 0], L.vel = [8, 0]
	K.forces = [[2.4, 180]]
	
	M = new Car(5, innerHeight * 1.5 / s[1], 1, 'M'), N = new Car(35, innerHeight * 1.5 / s[1], 1, 'N')
	M.vel = [20, 0], N.vel = [8, 0]
	M.forces = [[4 / 3, 180]]

	update(true)
}

onload = start
