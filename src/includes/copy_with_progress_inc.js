const getSizeCallback = require('get-folder-size');

async function getSize(dir) {
	return new Promise((resolve, reject) => {
		getSizeCallback(dir, (err, size) => {
			if (err)
				reject(err)
			resolve(size)
		});
	})
}

const bToMB = val => (val / 1024 / 1024)
const bToGB = val => (val / 1024 / 1024) * 0.001
const millisToSecs = val => val * 0.001
const lerp = (a, b, t) => a + (b - a) * t

function formatTime(secs) {
	if (secs > 60) {
		const mins = (secs / 60).toFixed(0)
		const suffix = mins === '1' ? "" : "s"
		return `${mins} minute${suffix}`
	} else {
		secs = secs.toFixed(0)
		const suffix = secs == '1' ? "" : "s"
		return `${secs} second${suffix}`
	}
}

const defaultProgressCallback = data => {
	const { elapsedBytes, totalBytes, progress, speed, remainingSecs } = data
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	const elapsedGB = bToGB(elapsedBytes).toFixed(2)
	const totalGB = bToGB(totalBytes).toFixed(2)
	process.stdout.write(`copying... ${elapsedGB} / ${totalGB} GB\t\t${(progress * 100).toFixed(2)}%\t\tspeed: ${speed.toFixed(2)} MB/s\t\tETA: ${formatTime(remainingSecs)}`)
}

async function copyWithProgress(
	src,
	dest, {
		onProgress = defaultProgressCallback,
		interval = 1000,
		smoothing = 0.1
	} = {}) {

	const sizeSrc = await getSize(src)
	const initialSizeDest = await getSize(dest)
	const startTime = Date.now()
	let lastSize = 0
	let lastTime = startTime
	let speed = 0

	const intervalId = setInterval(async () => {
		const sizeDest = (await getSize(dest)) - initialSizeDest
		const deltaBytes = sizeDest - lastSize
		if (deltaBytes == 0)
			return;
		const now = Date.now()
		const deltaTime = now - lastTime

		const newSpeed = bToMB(deltaBytes) / millisToSecs(deltaTime)//MB/s
		speed = lerp(speed, newSpeed, smoothing)
		const secsPerMB = 1 / speed
		const remainingMB = bToMB(sizeSrc - sizeDest)
		const remainingSecs = secsPerMB * remainingMB

		const progress = sizeDest / sizeSrc

		lastSize = sizeDest
		lastTime = now

		onProgress({
			elapsedBytes: sizeDest,
			totalBytes: sizeSrc,
			progress,
			speed,
			remainingSecs
		})
	}, interval)

	await fs.copy(src, dest)
	clearInterval(intervalId)
	console.log(`\ncopy completed in ${millisToSecs(Date.now() - startTime).toFixed(0)} seconds`);
};