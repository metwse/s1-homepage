console.log('sa')

size = [5, 5]

const d = document

map = (x, imax, imin, omax, omin) => (x - imin) / (imax - imin) * (omax - omin) + omin

values = new Array(size[0] * size[1]).fill(0)

draw = () => {
	max = Math.max(...values)
	min = Math.min(...values)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	avg = 0
	ctx.font = '10px  monospace'
	for (let x = 0; x < size[0]; x++)
		for (let y = 0; y < size[1]; y++) {
			let val = values[x + y * size[0]], mapped = Math.floor(map(val, max, min, 255, 0)) 
			avg += mapped || 0
			let color = 
				val == max ? 'red' :
				val == min ? 'blue' :
				'#' + mapped.toString(16).repeat(3)
			ctx.fillStyle = color
			ctx.beginPath()
			ctx.fillRect(x * cellSize[0], y * cellSize[1], cellSize[0], cellSize[1])
			ctx.fill(), ctx.closePath()
			ctx.fillStyle = '#' + (255 - mapped).toString(16).repeat(3)
			ctx.fillText(mapped, x * cellSize[0], (y + 1) * cellSize[1])
		}
	avg = avg / (size[0] * size[1])
	ctx.fillStyle = 'green'
	ctx.font = '16px  monospace'
	ctx.fillText(`avg: ${avg}`, 0, canvas.height - 8)
}

x = y = 0
xC = yC = 0
onkeypress = ({ key }) => {
	if (key.match(/^d/g)) return
	key = parseInt(key)
	if (xC * 9 < size[0]) { xC++; x += key } else if (yC * 9 < size[1]) { yC++; y += key } else {
		values[(Math.floor(map(x, xC * 9, 0, size[0] - 1, 0)) + Math.floor(map(y, yC * 9, 0, size[1] - 1, 0)) * size[0]) || 0] += 1
		
		draw()
		x = y = xC = yC = 0
	}
}

animation = () => {
	for (let i = 0; i < 100; i++) {
		x = Math.floor(Math.random() * size[0])
		y = Math.floor(Math.random() * size[1])
		values[x + y * size[0]] += 1
	}
	draw()
	requestAnimationFrame(animation)
}

onload = () => {
	canvas = d.querySelector('canvas')
	canvas.width = canvas.height = 500
	ctx = canvas.getContext('2d')
	cellSize = [canvas.width / size[0], canvas.height / size[1]]
	draw()
	//requestAnimationFrame(animation)
}
