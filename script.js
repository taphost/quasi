document.addEventListener('DOMContentLoaded', () => {
    const config = {
        MAX_ENTROPY_POINTS: 1000,
        HASH_ROUNDS: 10000,
        MIN_TIME_DELTA: 10,
        NOTIFICATION_DURATION: 3000,
        TYPEWRITER_SPEED: 50
    };

    const state = {
        userEntropyData: [],
        lastEventTime: 0,
        currentSeed: null,
        pageLoadTime: performance.now(),
        currentLang: 'it',
        passwordGenerated: false,
        isReadyForGeneration: false
    };

    async function sha512(str) {
        const buf = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    const charsets = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        special: '!@#$%^&*()_+-=[]{}|;:,.<>?~`'
    };

    const translations = {
        it: {
            securityWarningHeader: "⚠ AVVISO DI SICUREZZA",
            securityWarningText: "I browser non sono ambienti a prova di manomissione. Estensioni malevoli o attacchi XSS potrebbero compromettere la sicurezza. Usa questo strumento con cautela, preferibilmente in un browser con un profilo pulito.",
            title: "Generatore di Password Sicure",
            subtitle: "SECURE PASSWORD GENERATOR",
            instruction: "> MOUVI IL CURSORE / TOCCA LO SCHERMO => RACCOGLI ENTROPIA => GENERA",
            awaitingGeneration: "> IN ATTESA DI GENERAZIONE...",
            readyForGeneration: "> PRONTO PER LA GENERAZIONE...",
            entropyHeader: "[ ENTROPIA ]",
            collected: "RACCOLTI",
            seedNoData: "SEED: NESSUN DATO GENERATO",
            length: "LUNGHEZZA",
            chars: "CARATTERI",
            uppercase: "MAIUSCOLE (A-Z)",
            lowercase: "MINUSCOLE (a-z)",
            numbers: "NUMERI (0-9)",
            special: "SPECIALI (!@#$%...)",
            generate: "GENERA",
            copy: "COPIA",
            export: "ESPORTA",
            featuresHeader: "[ FUNZIONALITÀ DI SISTEMA ]",
            feature1: "<strong>ENTROPIA FISICA:</strong> Movimenti mouse/touch generano casualità crittografica.",
            feature2: "<strong>ENTROPIA TEMPORALE:</strong> Il delta temporale tra eventi aggiunge entropia.",
            feature3: "<strong>MULTI HASH:</strong> 10000 iterazioni SHA-512.",
            feature4: "<strong>CRYPTO API:</strong> API del browser + entropia fisica.",
            feature5: "<strong>VISTA SEED:</strong> Mostra il seed attualmente in uso.",
            feature6: "<strong>STATO:</strong> Indicatore di entropia in tempo reale.",
            errorInsufficientEntropy: "ERRORE: ENTROPIA INSUFFICIENTE\nRaccogli 1000/1000 punti.",
            errorNoCharset: "ERRORE: NESSUN SET DI CARATTERI SELEZIONATO",
            errorGenerateFirst: "ERRORE: GENERA PRIMA UNA PASSWORD",
            copied: "[ COPIATO ]",
            exportWarning: "ATTENZIONE: I file di testo non sono SICURI.\n\nEliminare subito dopo aver copiato nel gestore di password.\n\nPROCEDERE?",
            errorCrypto: "ERRORE: API CRITTOGRAFICA NON SUPPORTATA O BLOCCATA.",
            errorClipboard: "ERRORE: IMPOSSIBILE COPIARE NEGLI APPUNTI.",
            confirmYes: "PROCEDI",
            confirmNo: "ANNULLA"
        },
        en: {
            securityWarningHeader: "⚠ SECURITY WARNING",
            securityWarningText: "Browsers are not tamper-proof environments. Malicious extensions or XSS attacks could compromise security. Use this tool with caution, preferably in a browser with a clean profile.",
            title: "Secure Password Generator",
            subtitle: "SECURE PASSWORD GENERATOR",
            instruction: "> MOVE CURSOR / TOUCH SCREEN => COLLECT ENTROPY => GENERATE",
            awaitingGeneration: "> AWAITING GENERATION...",
            readyForGeneration: "> READY FOR GENERATION...",
            entropyHeader: "[ ENTROPY ]",
            collected: "COLLECTED",
            seedNoData: "SEED: NO DATA GENERATED",
            length: "LENGTH",
            chars: "CHARS",
            uppercase: "UPPERCASE (A-Z)",
            lowercase: "LOWERCASE (a-z)",
            numbers: "NUMBERS (0-9)",
            special: "SPECIAL (!@#$%...)",
            generate: "GENERATE",
            copy: "COPY",
            export: "EXPORT",
            featuresHeader: "[ SYSTEM FEATURES ]",
            feature1: "<strong>PHYSICAL ENTROPY:</strong> Touch/mouse movements generate crypto randomness.",
            feature2: "<strong>TEMPORAL ENTROPY:</strong> Time delta between events adds entropy.",
            feature3: "<strong>MULTI HASH:</strong> 10000 SHA-512 iterations.",
            feature4: "<strong>CRYPTO API:</strong> Browser API + physical entropy.",
            feature5: "<strong>SEED VIEW:</strong> Displays the seed currently in use.",
            feature6: "<strong>STATUS:</strong> Real-time entropy indicator.",
            errorInsufficientEntropy: "ERROR: INSUFFICIENT ENTROPY\nCollect 1000/1000 points.",
            errorNoCharset: "ERROR: NO CHARSET SELECTED",
            errorGenerateFirst: "ERROR: GENERATE PASSWORD FIRST",
            copied: "[ COPIED ]",
            exportWarning: "WARNING: Plain text files are NOT SECURE.\n\nDelete immediately after copying to password manager.\n\nPROCEED?",
            errorCrypto: "ERROR: CRYPTO API NOT SUPPORTED OR BLOCKED.",
            errorClipboard: "ERROR: FAILED TO COPY TO CLIPBOARD.",
            confirmYes: "PROCEED",
            confirmNo: "CANCEL"
        }
    };

    const elements = {
        instructionBox: document.querySelector('.generate-instruction'),
        passwordDisplay: document.getElementById('passwordDisplay'),
        passwordText: document.getElementById('passwordText'),
        matrixCanvas: document.getElementById('matrixCanvas'),
        lengthSlider: document.getElementById('lengthSlider'),
        lengthValue: document.getElementById('lengthValue'),
        generateBtn: document.getElementById('generateBtn'),
        copyBtn: document.getElementById('copyBtn'),
        saveBtn: document.getElementById('saveBtn'),
        entropyCount: document.getElementById('entropyCount'),
        entropyFill: document.getElementById('entropyFill'),
        seedDisplay: document.getElementById('seedDisplay'),
        langSelector: document.querySelector('.lang-selector'),
        notification: document.getElementById('notification'),
        langElements: document.querySelectorAll('[data-lang]'),
        customConfirm: document.getElementById('customConfirm'),
        customConfirmMessage: document.getElementById('customConfirmMessage'),
        customConfirmYes: document.getElementById('customConfirmYes'),
        customConfirmNo: document.getElementById('customConfirmNo')
    };

    function showCustomConfirm(messageKey, callback) {
        elements.customConfirmMessage.textContent = translations[state.currentLang][messageKey];
        elements.customConfirm.classList.add('show');

        elements.customConfirmYes.onclick = () => {
            elements.customConfirm.classList.remove('show');
            callback(true);
        };

        elements.customConfirmNo.onclick = () => {
            elements.customConfirm.classList.remove('show');
            callback(false);
        };
    }

    function showNotification(messageKey, duration = config.NOTIFICATION_DURATION) {
        elements.notification.textContent = translations[state.currentLang][messageKey] || messageKey;
        elements.notification.classList.add('show');
        setTimeout(() => {
            elements.notification.classList.remove('show');
        }, duration);
    }

    function setLanguage(lang) {
        state.currentLang = lang;
        document.documentElement.lang = lang;
        const langData = translations[lang];
        if (!langData) return;

        document.title = langData.title;

        elements.langElements.forEach(el => {
            const key = el.getAttribute('data-lang');
            if (langData[key]) {
                if (key === 'instruction') {
                    typewriterEffect(el, langData[key]);
                } else {
                    el.innerHTML = langData[key];
                }
            }
        });
        
        if (!state.passwordGenerated) {
            typewriterEffect(elements.passwordText, langData.awaitingGeneration);
        }
        
        if (!state.currentSeed) {
            elements.seedDisplay.textContent = langData.seedNoData;
        }
    }

    elements.langSelector.addEventListener('click', (e) => {
        if (e.target.classList.contains('lang-option')) {
            const lang = e.target.getAttribute('data-lang-option');
            setLanguage(lang);
            document.querySelectorAll('.lang-option').forEach(opt => opt.classList.remove('active'));
            e.target.classList.add('active');
        }
    });

    document.querySelectorAll('.checkbox-container').forEach(container => {
        function toggleCheckbox(element) {
            const checkbox = element.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            element.classList.toggle('active', checkbox.checked);
        }

        container.addEventListener('click', function() {
            toggleCheckbox(this);
        });

        container.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCheckbox(this);
            }
        });
    });

    elements.lengthSlider.addEventListener('input', function() {
        elements.lengthValue.textContent = this.value;
    });

    function collectEntropy(e) {
        const currentTime = performance.now();
        const timeDelta = currentTime - state.lastEventTime;
        if (timeDelta < config.MIN_TIME_DELTA) return;

        let point;
        if (e.type.startsWith('touch')) {
            const touch = e.touches[0];
            point = { x: touch.clientX, y: touch.clientY };
        } else {
            point = { x: e.clientX, y: e.clientY };
        }

        const entropyPoint = { ...point, time: currentTime, deltaTime: timeDelta, type: e.type };
        state.userEntropyData.push(entropyPoint);
        state.lastEventTime = currentTime;

        if (state.userEntropyData.length > config.MAX_ENTROPY_POINTS) {
            state.userEntropyData.shift();
        }
        updateEntropyDisplay();
    }

    function updateEntropyDisplay() {
        const currentEntropy = state.userEntropyData.length;
        const percentage = (currentEntropy / config.MAX_ENTROPY_POINTS) * 100;
        elements.entropyCount.textContent = currentEntropy;
        elements.entropyFill.style.width = percentage + '%';

        if (currentEntropy >= config.MAX_ENTROPY_POINTS && !state.passwordGenerated && !state.isReadyForGeneration) {
            state.isReadyForGeneration = true;
            typewriterEffect(elements.passwordText, translations[state.currentLang].readyForGeneration);
            manageGlowEffect('entropy-ready', elements, translations[state.currentLang]);
        }
    }

    async function generateUserSeed() {
        if (state.userEntropyData.length < config.MAX_ENTROPY_POINTS) return null;
        let entropyString = state.userEntropyData.map(p => `${p.x}:${p.y}:${p.time.toFixed(4)}:${p.deltaTime.toFixed(4)}:${p.type}`).join('|');
        const timeBeforeGenerate = performance.now() - state.pageLoadTime;
        entropyString += `|${timeBeforeGenerate}:${navigator.userAgent.length}`;
        let hash = entropyString;
        for (let i = 0; i < config.HASH_ROUNDS; i++) {
            hash = await sha512(hash + i.toString() + (state.currentSeed || ''));
        }
        return hash;
    }

    async function generateSecurePassword(length, options) {
        try {
            const userSeed = await generateUserSeed();
            if (!userSeed) {
                showNotification('errorInsufficientEntropy');
                return null;
            }

            let charset = '';
            if (options.uppercase) charset += charsets.uppercase;
            if (options.lowercase) charset += charsets.lowercase;
            if (options.numbers) charset += charsets.numbers;
            if (options.special) charset += charsets.special;

            if (charset === '') {
                showNotification('errorNoCharset');
                return null;
            }

            const cryptoArray = new Uint32Array(length);
            try {
                crypto.getRandomValues(cryptoArray);
            } catch (error) {
                console.error('Crypto API error:', error);
                showNotification('errorCrypto');
                return null;
            }
            
            const combinedSeed = await sha512(userSeed + Array.from(cryptoArray).join(''));
            state.currentSeed = combinedSeed;

            elements.seedDisplay.textContent = `SEED (${combinedSeed.length} chars): ${combinedSeed}`;

            let password = '';
            for (let i = 0; i < length; i++) {
                const seedHex = combinedSeed.substring((i * 4) % (combinedSeed.length - 4), (i * 4) % (combinedSeed.length - 4) + 4);
                const seedNum = parseInt(seedHex, 16);
                const cryptoNum = cryptoArray[i % cryptoArray.length];
                const combinedIndex = (seedNum + cryptoNum) % charset.length;
                password += charset[combinedIndex];
            }
            return password;
        } catch (error) {
            console.error('Error generating password:', error);
            showNotification('errorGenerateFirst');
            return null;
        }
    }

    document.addEventListener('mousemove', collectEntropy);
    document.addEventListener('touchmove', collectEntropy, { passive: true });
    document.addEventListener('touchstart', collectEntropy, { passive: true });

    elements.generateBtn.addEventListener('click', async function() {
        this.disabled = true;
        try {
            const length = parseInt(elements.lengthSlider.value);
            const options = {
                uppercase: document.getElementById('uppercase').checked,
                lowercase: document.getElementById('lowercase').checked,
                numbers: document.getElementById('numbers').checked,
                special: document.getElementById('specialChars').checked
            };

            elements.passwordText.textContent = '';

            const password = await generateSecurePassword(length, options);

            if (password) {
                state.passwordGenerated = true;
                typewriterEffect(elements.passwordText, password, config.TYPEWRITER_SPEED, () => {
                    flashElement(elements.passwordDisplay);
                    manageGlowEffect('generated', elements, translations[state.currentLang]);
                    this.disabled = false;
                });
            } else {
                 typewriterEffect(elements.passwordText, translations[state.currentLang].awaitingGeneration);
                 this.disabled = false;
            }
        } catch (error) {
            console.error('Error in generate button:', error);
            showNotification('errorGenerateFirst');
            this.disabled = false;
        }
    });

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
      
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
      
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showNotification('copied');
                manageGlowEffect('copied_or_exported', elements, translations[state.currentLang]);
            } else {
                showNotification('errorClipboard');
            }
        } catch (err) {
            showNotification('errorClipboard');
        }
      
        document.body.removeChild(textArea);
    }

    elements.copyBtn.addEventListener('click', function() {
        if (!state.passwordGenerated) {
            showNotification('errorGenerateFirst');
            return;
        }
        const passwordToCopy = elements.passwordText.textContent;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(passwordToCopy).then(() => {
                showNotification('copied');
                manageGlowEffect('copied_or_exported', elements, translations[state.currentLang]);
            }).catch(err => {
                console.error('Async clipboard copy failed, falling back:', err);
                fallbackCopyTextToClipboard(passwordToCopy);
            });
        } else {
            fallbackCopyTextToClipboard(passwordToCopy);
        }
    });

    elements.saveBtn.addEventListener('click', function() {
        try {
            if (!state.passwordGenerated) {
                showNotification('errorGenerateFirst');
                return;
            }
            
            showCustomConfirm('exportWarning', (proceed) => {
                if (!proceed) {
                    return;
                }

                manageGlowEffect('copied_or_exported', elements, translations[state.currentLang]);
                const password = elements.passwordText.textContent;
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const seedInfo = state.currentSeed ? `\n\nSEED:\n${state.currentSeed}` : '';
                const content = `PASSWORD: ${password}\nTIME: ${new Date().toLocaleString()}${seedInfo}`;
                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `pwd-${timestamp}.txt`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            });
        } catch (error) {
            console.error('Error in save button:', error);
        }
    });

    setLanguage(state.currentLang);
    updateEntropyDisplay();
    manageGlowEffect('initial', elements, translations[state.currentLang]);
    startMatrixAnimation(elements.matrixCanvas, charsets);

    const featuresHeader = document.getElementById('featuresHeader');
    const instructionsContainer = document.querySelector('.instructions.collapsible');

    featuresHeader.addEventListener('click', () => {
        instructionsContainer.classList.toggle('collapsed');
    });
});
