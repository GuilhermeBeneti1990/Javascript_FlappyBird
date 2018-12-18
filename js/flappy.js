function newElement (tagName, className) {

    const element = document.createElement(tagName);
    element.className = className;
    return element;

}

function Barrier (reverse = false) {

    this.element = newElement('div', 'barrier');
    const border = newElement('div', 'border');
    const body = newElement('div', 'body');
    this.element.appendChild(reverse ? body : border);
    this.element.appendChild(reverse ? border : body);
    this.setHeight = height => body.style.height = `${height}px`;

}

function CoupleBarriers (height, gap, x) {
    
    this.element = newElement('div', 'couple-barriers');
    this.upper = new Barrier (true);
    this.lower = new Barrier (false);
    this.element.appendChild(this.upper.element);
    this.element.appendChild(this.lower.element);

    this.gapRandom = () => {
        const heightUpper = Math.random() * (height - gap);
        const heightLower = height - gap - heightUpper;
        this.upper.setHeight(heightUpper);
        this.lower.setHeight(heightLower);
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0]);
    this.setX = x => this.element.style.left = `${x}px`;
    this.getWidth = () => this.element.clientWidth;

    this.gapRandom();
    this.setX(x);

}

function Barriers (height, width, gap, spaceBetweenBarriers, midNotification) {

    this.couples = [
        new CoupleBarriers(height, gap, width),
        new CoupleBarriers(height, gap, width + spaceBetweenBarriers),
        new CoupleBarriers(height, gap, width + spaceBetweenBarriers * 2),
        new CoupleBarriers(height, gap, width + spaceBetweenBarriers * 3)
    ]

    const displacement = 3;

    this.animate = () => {
        this.couples.forEach(couple => {
            couple.setX(couple.getX() - displacement);

            // when the element get out of game area
            if (couple.getX() < -couple.getWidth()) {
                couple.setX(couple.getX() + spaceBetweenBarriers * this.couples.length);
                couple.gapRandom();
            }

            const middle = width / 2;
            const middleCross = couple.getX() + displacement >= middle && couple.getX() < middle;
            if (middleCross) midNotification();
        });
    }

}

function Bird (gameHeight) {
    
    let isFlying = false;

    this.element = newElement('img', 'bird');
    this.element.src = 'imgs/passaro.png';

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0]);
    this.setY = y => this.element.style.bottom = `${y}px`;

    window.onkeydown = e => isFlying = true;
    window.onkeyup = e => isFlying = false;

    this.animate = () => {
        const newY = this.getY() + (isFlying ? 8 : -5);
        const maxHeight = gameHeight - this.element.clientHeight;

        if (newY <= 0) {
            this.setY(0);
        } else if (newY >= maxHeight) {
            this.setY(maxHeight);
        } else {
            this.setY(newY);
        }
    }

    this.setY(gameHeight / 2);

}

function Progress () {

    this.element = newElement('span', 'progress');

    this.scoreUpdate = score => {
        this.element.innerHTML = score;
    }
    this.scoreUpdate(0);

}

function areOverlapping (elementA, elementB) {

    const a = elementA.getBoundingClientRect();
    const b = elementB.getBoundingClientRect();

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;

    return horizontal && vertical;

}

function crashed (bird, barriers) {

    let crashed = false;

    barriers.couples.forEach( couple => {
        if (!crashed) {
            const upper = couple.upper.element;
            const lower = couple.lower.element;
            crashed = areOverlapping(bird.element, upper) || areOverlapping(bird.element, lower);
        }
    });

    return crashed;

}

function FlappyBird () {

    let score = 0;

    const gameArea = document.querySelector('[wm-flappy]');
    const height = gameArea.clientHeight;
    const width = gameArea.clientWidth;

    const progress = new Progress();
    const barriers = new Barriers(height, width, 200, 400, () => progress.scoreUpdate(++score));
    const bird = new Bird(height);

    gameArea.appendChild(progress.element);
    gameArea.appendChild(bird.element);
    barriers.couples.forEach( couple => gameArea.appendChild(couple.element));

    this.start = () => {

        // game's loop
        const timer = setInterval( () => {
            barriers.animate();
            bird.animate();

            if (crashed(bird, barriers)) {
                alert("You Lose :/");
                clearInterval(timer);
            }
        }, 20);

    }

}

new FlappyBird().start();