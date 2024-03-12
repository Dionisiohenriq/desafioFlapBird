function newElement(tagName, className) {
	const elem = document.createElement(tagName);
	elem.className = className;
	return elem;
}

function Barrier(reverse = false) {
	this.element = newElement("div", "barrier");

	const border = newElement("div", "border");
	const body = newElement("div", "body");
	this.element.appendChild(reverse ? body : border);
	this.element.appendChild(reverse ? border : body);

	this.setHeight = (hght) => (body.style.height = `${hght}px`);
}
function BarrierPair(hght, openess, x) {
	this.element = newElement("div", "pair-of-barriers");

	this.upper = new Barrier(true);
	this.lower = new Barrier(false);

	this.element.appendChild(this.upper.element);
	this.element.appendChild(this.lower.element);

	this.openessChoise = () => {
		const upperHeight = Math.random() * (hght - openess);
		const lowerHeight = hght - openess - upperHeight;
		this.upper.setHeight(upperHeight);
		this.lower.setHeight(lowerHeight);
	};

	this.getX = () => parseInt(this.element.style.left.split("px")[0]);
	this.setX = (x) => (this.element.style.left = `${x}px`);
	this.getWidth = () => this.element.clientWidth;

	this.openessChoise();
	this.setX(x);
}

// const b = new BarrierPair(700, 200, 800);
// document.querySelector('[wm-flappy]').appendChild(b.element);

function Barriers(hght, wdth, openess, space, notifyPoint) {
	this.pairs = [
		new BarrierPair(hght, openess, wdth),
		new BarrierPair(hght, openess, wdth + space),
		new BarrierPair(hght, openess, wdth + space * 2),
		new BarrierPair(hght, openess, wdth + space * 3),
	];

	const displacement = 3;
	this.animate = () => {
		this.pairs.forEach((pair) => {
			pair.setX(pair.getX() - displacement);

			// quando o elemento sair da área do jgo
			if (pair.getX() < -pair.getWidth()) {
				pair.setX(pair.getX() + space * this.pairs.length);
				pair.openessChoise();
			}

			const middle = wdth / 2;
			const crossedMiddle =
				pair.getX() + displacement >= middle && pair.getX() < middle;
			if (crossedMiddle) notifyPoint();
		});
	};
}

function Bird(gameHeight) {
	let flying = false;

	this.element = newElement("img", "bird");
	this.element.src = "imgs/flappy.png";

	this.getY = () => parseInt(this.element.style.bottom.split("px")[0]);
	this.setY = (y) => (this.element.style.bottom = `${y}px`);

	window.onkeydown = (e) => (flying = true);
	window.onkeyup = (e) => (flying = false);

	this.animate = () => {
		const newY = this.getY() + (flying ? 8 : -5);
		const maxHeight = gameHeight - this.element.clientHeight;

		if (newY <= 0) {
			this.setY(0);
		} else if (newY >= maxHeight) {
			this.setY(maxHeight);
		} else {
			this.setY(newY);
		}
	};
	this.setY(gameHeight / 2);
}

function Progress() {
	this.element = newElement("span", "progress");
	this.atualizePoints = (points) => {
		this.element.innerHTML = points;
	};
	this.atualizePoints(0);
}

function areOverlapping(elementA, elementB) {
	const a = elementA.getBoundingClientRect();
	const b = elementB.getBoundingClientRect();

	const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;

	const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;

	return horizontal && vertical;
}

function colided(bird, barriers) {
	let colide = false;

	barriers.pairs.forEach((pairOfBarriers) => {
		if (!colide) {
			const upper = pairOfBarriers.upper.element;
			const lower = pairOfBarriers.lower.element;
			colide =
				areOverlapping(bird.element, upper) ||
				areOverlapping(bird.element, lower);
		}
	});
	return colide;
}

function FlappyBird() {
	let points = 0;

	const areaOfGame = document.querySelector("[wm-flappy]");
	const hght = areaOfGame.clientHeight;
	const wdth = areaOfGame.clientWidth;

	const progress = new Progress();
	const barriers = new Barriers(hght, wdth, 200, 400, () =>
		progress.atualizePoints(++points)
	);
	const bird = new Bird(hght);

	areaOfGame.appendChild(bird.element);
	areaOfGame.appendChild(progress.element);
	barriers.pairs.forEach((pair) => areaOfGame.appendChild(pair.element));

	// animation, start, pause, restart

	let startTime, pauseTime, temporizer, isRunning;

	this.start = () => {
		if (!isRunning) {
			temporizer = setInterval(() => {
				isRunning = true;

				startTime = new Date();

				barriers.animate();
				bird.animate();

				if (colided(bird, barriers)) {
					clearInterval(temporizer);
					isRunning = false;
				}
			}, 20);
		}
	};

	this.pauseInterval = () => {
		console.log(temporizer);

		if (temporizer != undefined) {
			clearInterval(temporizer);
			pauseTime = new Date();
			isRunning = false;
		}
	};

	this.resumeInterval = () => {
		const elapsedTime = pauseTime - startTime;

		if (!isRunning) {
			setTimeout(() => {
				this.start();
				isRunning = true;
			}, elapsedTime);
		}
	};
}

let flappyBird = new FlappyBird();

this.onKeyDown = (e) => {
	console.log(e);
	if (e.key == "space") {
		flappyBird.start();
	} else if (e.key == "p") {
		flappyBird.pauseInterval();
	} else if (e.key == "r") {
		flappyBird.resumeInterval();
	}
};

this.resetGame = () => {};

window.addEventListener("keydown", onKeyDown);
