console.log('sa')

const d = document

draw = () => {
	c.reset()
	frame.draw()
	lines.forEach((line, i) => {
		line.A.x = mouse.x, line.A.y = mouse.y
		var deg = lerp(0, Math.PI * 2, i / 180)
		line.B.x = Math.cos(deg) * innerWidth + mouse.x, line.B.y = Math.sin(deg) * innerHeight + mouse.y
		var i = frame.intersect(line)
		if (i) new Line(i, [mouse.x, mouse.y]).draw()
	})
	requestAnimationFrame(draw)
}

mouse = {}
onmousemove = ({ pageX, pageY }) => (mouse.x = pageX, mouse.y = pageY)

onload = () => {
	canvas = d.querySelector('canvas')
	c = canvas.getContext('2d')
	onresize = () => canvas.width = innerWidth, canvas.height = innerHeight; onresize()

	frame = new Polygon([[100, 100], [100, 300], [600, 300], [600, 100]], c)
	lines = []
	for (let i = 0; i < 180; i++) lines.push(new Line([0, 0], [0, 0], c))

	draw()
}
