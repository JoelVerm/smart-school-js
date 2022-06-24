/**
 * @param {Number} n
 * @returns {Number}
 */
Number.prototype.nearest = function (n) {
	return Math.round(this / n) * n
}

const MAX_DOUBLE_DELAY = 1000

export class MouseListener {
	constructor(element) {
		this.element = element
		this.clientX = 0
		this.clientY = 0
		this.offsetX = 0
		this.offsetY = 0
		this.movementX = 0
		this.movementY = 0
		this.target = null
		this.down = false
		this.type = ''
		this.startTime = 0
		this._lastStartTime = 0

		this._eventListeners = {}
		this._holdInterval = null

		this.element.addEventListener('mousedown', ev => {
			this.clientX = ev.clientX
			this.clientY = ev.clientY
			this.offsetX = ev.offsetX
			this.offsetY = ev.offsetY
			this.movementX = 0
			this.movementY = 0
			this.target = ev.target
			this.down = true
			this.type = 'down'
			this._lastStartTime = this.startTime
			this.startTime = Date.now()

			if (this._eventListeners.down)
				this._eventListeners.down.forEach(handler => handler(this))
			this._holdInterval = setInterval(() => {
				let delay = (Date.now() - this.startTime).nearest(50)
				if (this._eventListeners[`hold${delay}`])
					this._eventListeners[`hold${delay}`].forEach(handler =>
						handler(this)
					)
			}, 50)
			let delay = (this.startTime - this._lastStartTime).nearest(50)
			for (let i = delay; i < MAX_DOUBLE_DELAY; i += 50) {
				if (this._eventListeners[`double${i}`])
					this._eventListeners[`double${i}`].forEach(handler =>
						handler(this)
					)
			}
		})
		this.element.addEventListener('mousemove', ev => {
			this.movementX = ev.movementX
			this.movementY = ev.movementY
			this.clientX = ev.clientX
			this.clientY = ev.clientY
			this.offsetX = ev.offsetX
			this.offsetY = ev.offsetY
			this.target = ev.target
			this.type = 'move'

			if (this._eventListeners.move)
				this._eventListeners.move.forEach(handler => handler(this))
		})
		this.element.addEventListener('mouseup', ev => {
			this.down = false
			this.type = 'up'

			if (this._eventListeners.up)
				this._eventListeners.up.forEach(handler => handler(this))
			clearInterval(this._holdInterval)
		})
		this.element.addEventListener('touchstart', ev => {
			this.clientX = ev.touches[0].clientX
			this.clientY = ev.touches[0].clientY
			this.target = document.elementFromPoint(this.clientX, this.clientY)
			let bcr = this.target.getBoundingClientRect()
			this.offsetX = this.clientX - bcr.left
			this.offsetY = this.clientY - bcr.top
			this.down = true
			this.type = 'down'
			this._lastStartTime = this.startTime
			this.startTime = Date.now()

			if (this._eventListeners.down)
				this._eventListeners.down.forEach(handler => handler(this))
			this._holdInterval = setInterval(() => {
				let delay = (Date.now() - this.startTime).nearest(50)
				if (this._eventListeners[`hold${delay}`])
					this._eventListeners[`hold${delay}`].forEach(handler =>
						handler(this)
					)
			}, 50)
			let delay = (this.startTime - this._lastStartTime).nearest(50)
			for (let i = delay; i < MAX_DOUBLE_DELAY; i += 50) {
				if (this._eventListeners[`double${i}`])
					this._eventListeners[`double${i}`].forEach(handler =>
						handler(this)
					)
			}
		})
		this.element.addEventListener('touchmove', ev => {
			this.movementX = ev.touches[0].clientX - this.clientX
			this.movementY = ev.touches[0].clientY - this.clientY
			this.clientX = ev.touches[0].clientX
			this.clientY = ev.touches[0].clientY
			this.target = document.elementFromPoint(this.clientX, this.clientY)
			let bcr = this.target.getBoundingClientRect()
			this.offsetX = this.clientX - bcr.left
			this.offsetY = this.clientY - bcr.top
			this.type = 'move'

			if (this._eventListeners.move)
				this._eventListeners.move.forEach(handler => handler(this))
		})
		this.element.addEventListener('touchend', ev => {
			this.down = false
			this.type = 'up'

			if (this._eventListeners.up)
				this._eventListeners.up.forEach(handler => handler(this))
			clearInterval(this._holdInterval)
		})
	}
	/**
	 * @param {Function} handler callback function
	 */
	onDown(handler) {
		if (!this._eventListeners.down) this._eventListeners.down = []
		this._eventListeners.down.push(handler)
	}
	/**
	 * @param {Function} handler callback function
	 */
	onUp(handler) {
		if (!this._eventListeners.up) this._eventListeners.up = []
		this._eventListeners.up.push(handler)
	}
	/**
	 * @param {Function} handler callback function
	 */
	onMove(handler) {
		if (!this._eventListeners.move) this._eventListeners.move = []
		this._eventListeners.move.push(handler)
	}
	/**
	 * @param {number} delay in milliseconds with steps of 50ms (smaller than MAX_DOUBLE_DELAY)
	 * @param {Function} handler callback function
	 */
	onHold(delay, handler) {
		if (!this._eventListeners[`hold${delay}`])
			this._eventListeners[`hold${delay}`] = []
		this._eventListeners[`hold${delay}`].push(handler)
	}
	/**
	 * @param {number} delay in milliseconds with steps of 50ms
	 * @param {Function} handler callback function
	 */
	onDouble(delay, handler) {
		if (!this._eventListeners[`double${delay}`])
			this._eventListeners[`double${delay}`] = []
		this._eventListeners[`double${delay}`].push(handler)
	}
}
