// This file will contain all the JavaScript code for UI animations.

function startBreathingGlow(element) {
    if (element) {
        element.classList.add('breathing-glow');
    }
}

function stopBreathingGlow(element) {
    if (element) {
        element.classList.remove('breathing-glow');
    }
}

function manageGlowEffect(state, elements, langData) {
    // Stop all glows first
    stopBreathingGlow(elements.instructionBox);
    stopBreathingGlow(elements.passwordDisplay);
    stopBreathingGlow(elements.generateBtn);
    stopBreathingGlow(elements.copyBtn);
    stopBreathingGlow(elements.saveBtn);

    switch (state) {
        case 'initial':
            startBreathingGlow(elements.instructionBox);
            break;
        case 'entropy-ready':
            startBreathingGlow(elements.passwordDisplay);
            startBreathingGlow(elements.generateBtn);
            break;
        case 'generated':
            startBreathingGlow(elements.passwordDisplay);
            startBreathingGlow(elements.copyBtn);
            startBreathingGlow(elements.saveBtn);
            break;
        case 'copied_or_exported':
            // All glows are stopped
            break;
    }
}

const animationConfig = {
    FLASH_DURATION: 500,
    MATRIX_FONT_SIZE: 14,
    MATRIX_FPS: 20,
    MATRIX_RESET_CHANCE: 0.975,
    TYPEWRITER_DEFAULT_SPEED: 50
};

function flashElement(element) {
    if (element) {
        element.classList.add('generated');
        setTimeout(() => element.classList.remove('generated'), animationConfig.FLASH_DURATION);
    }
}

// Matrix Rain Animation
let matrixAnimationId;

function startMatrixAnimation(canvas, charsets) {
    if (matrixAnimationId) {
        cancelAnimationFrame(matrixAnimationId);
    }

    const ctx = canvas.getContext('2d');
    canvas.style.display = 'block';

    let letters = (charsets.uppercase + charsets.lowercase + charsets.numbers + charsets.special).split('');
    if (letters.length === 0) {
        letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?~`'.split('');
    }

    const fontSize = animationConfig.MATRIX_FONT_SIZE;
    let columns = Math.floor(canvas.width / fontSize);
    let drops = [];

    const initializeDrops = () => {
        columns = Math.floor(canvas.width / fontSize);
        drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }
    };

    const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        initializeDrops();
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let lastTime = 0;
    const interval = 1000 / animationConfig.MATRIX_FPS;

    function draw(timestamp) {
        if (timestamp - lastTime < interval) {
            matrixAnimationId = requestAnimationFrame(draw);
            return;
        }
        lastTime = timestamp;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fcd106';
        ctx.font = `${fontSize}px VT323`;

        for (let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > animationConfig.MATRIX_RESET_CHANCE) {
                drops[i] = 0;
            }
            drops[i]++;
        }
        matrixAnimationId = requestAnimationFrame(draw);
    }

    matrixAnimationId = requestAnimationFrame(draw);
}

function stopMatrixAnimation(canvas) {
    if (matrixAnimationId) {
        cancelAnimationFrame(matrixAnimationId);
        matrixAnimationId = null;
    }
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function typewriterEffect(element, text, speed = animationConfig.TYPEWRITER_DEFAULT_SPEED, callback) {
    if (element.typewriterInterval) {
        clearInterval(element.typewriterInterval);
    }
    
    let i = 0;
    element.innerHTML = ''; // Clear previous text
    
    element.typewriterInterval = setInterval(() => {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
        } else {
            clearInterval(element.typewriterInterval);
            element.typewriterInterval = null;
            if (callback) {
                callback();
            }
        }
    }, speed);
}
