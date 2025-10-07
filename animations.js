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
            elements.passwordDisplay.textContent = langData.readyForGeneration || "[ PRONTO PER LA GENERAZIONE ]";
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

function flashElement(element) {
    if (element) {
        element.classList.add('generated');
        setTimeout(() => element.classList.remove('generated'), 500);
    }
}
