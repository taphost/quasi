document.addEventListener('DOMContentLoaded', () => {
    const MAX_ENTROPY_POINTS = 1000;
    const HASH_ROUNDS = 10000;

    async function sha512(str) {
        const buf = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(str));
        return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
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
            languageLabel: "Lingua:",
            instruction: "> MUOVI CURSORE / TOCCA SCHERMO<br>RACCOGLI ENTROPIA => GENERA",
            awaitingGeneration: "[ IN ATTESA DI GENERAZIONE... ]",
            entropyHeader: "[ ENTROPIA ]",
            showDetails: "MOSTRA DETTAGLI",
            hideDetails: "NASCONDI DETTAGLI",
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
            feature5: "<strong>VISTA SEED:</strong> Visualizzazione opzionale del seed.",
            feature6: "<strong>STATO:</strong> Indicatore di entropia in tempo reale.",
            errorInsufficientEntropy: "ERRORE: ENTROPIA INSUFFICIENTE\nRaccogli 1000/1000 punti.",
            errorNoCharset: "ERRORE: NESSUN SET DI CARATTERI SELEZIONATO",
            errorGenerateFirst: "ERRORE: GENERA PRIMA UNA PASSWORD",
            copied: "[ COPIATO ]",
            exportWarning: "ATTENZIONE: I file di testo non sono SICURI.\n\nEliminare subito dopo aver copiato nel gestore di password.\n\nPROCEDERE?"
        },
        en: {
            securityWarningHeader: "⚠ SECURITY WARNING",
            securityWarningText: "Browsers are not tamper-proof environments. Malicious extensions or XSS attacks could compromise security. Use this tool with caution, preferably in a browser with a clean profile.",
            title: "Secure Password Generator",
            subtitle: "SECURE PASSWORD GENERATOR",
            languageLabel: "Language:",
            instruction: "> MOVE CURSOR / TOUCH SCREEN<br>COLLECT ENTROPY => GENERATE",
            awaitingGeneration: "[ AWAITING GENERATION... ]",
            entropyHeader: "[ ENTROPY ]",
            showDetails: "SHOW DETAILS",
            hideDetails: "HIDE DETAILS",
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
            feature5: "<strong>SEED VIEW:</strong> Optional seed display.",
            feature6: "<strong>STATUS:</strong> Real-time entropy indicator.",
            errorInsufficientEntropy: "ERROR: INSUFFICIENT ENTROPY\nCollect 1000/1000 points.",
            errorNoCharset: "ERROR: NO CHARSET SELECTED",
            errorGenerateFirst: "ERROR: GENERATE PASSWORD FIRST",
            copied: "[ COPIED ]",
            exportWarning: "WARNING: Plain text files are NOT SECURE.\n\nDelete immediately after copying to password manager.\n\nPROCEED?"
        }
    };

    const elements = {
        passwordDisplay: document.getElementById('passwordDisplay'),
        lengthSlider: document.getElementById('lengthSlider'),
        lengthValue: document.getElementById('lengthValue'),
        generateBtn: document.getElementById('generateBtn'),
        copyBtn: document.getElementById('copyBtn'),
        saveBtn: document.getElementById('saveBtn'),
        entropyCount: document.getElementById('entropyCount'),
        entropyFill: document.getElementById('entropyFill'),
        entropyStatus: document.getElementById('entropyStatus'),
        seedDisplay: document.getElementById('seedDisplay'),
        toggleEntropy: document.getElementById('toggleEntropy'),
        langSelector: document.getElementById('lang'),
        notification: document.getElementById('notification')
    };

    let userEntropyData = [];
    let lastEventTime = 0;
    let currentSeed = null;
    let seedVisible = false;
    const pageLoadTime = performance.now();
    let currentLang = 'it';
    let passwordGenerated = false;

    function showNotification(messageKey, duration = 3000) {
        elements.notification.textContent = translations[currentLang][messageKey] || messageKey;
        elements.notification.classList.add('show');
        setTimeout(() => {
            elements.notification.classList.remove('show');
        }, duration);
    }

    function setLanguage(lang) {
        currentLang = lang;
        document.documentElement.lang = lang;
        const langData = translations[lang];
        if (!langData) return;

        document.title = langData.title;

        document.querySelectorAll('[data-lang]').forEach(el => {
            const key = el.getAttribute('data-lang');
            if (langData[key]) {
                el.innerHTML = langData[key];
            }
        });
        
        if (!passwordGenerated) {
            elements.passwordDisplay.textContent = langData.awaitingGeneration;
        }
        
        if (!currentSeed) {
            elements.seedDisplay.textContent = langData.seedNoData;
        }
        
        elements.toggleEntropy.textContent = seedVisible ? langData.hideDetails : langData.showDetails;
    }

    elements.langSelector.addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });

    document.querySelectorAll('.checkbox-container').forEach(container => {
        container.addEventListener('click', function() {
            const checkbox = this.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('active', checkbox.checked);
        });
    });

    elements.lengthSlider.addEventListener('input', function() {
        elements.lengthValue.textContent = this.value;
    });

    elements.toggleEntropy.addEventListener('click', function() {
        seedVisible = !seedVisible;
        elements.seedDisplay.style.display = seedVisible ? 'block' : 'none';
        this.textContent = seedVisible ? translations[currentLang].hideDetails : translations[currentLang].showDetails;
    });

    function collectEntropy(e) {
        const currentTime = performance.now();
        const timeDelta = currentTime - lastEventTime;
        if (timeDelta < 10) return;

        let point;
        if (e.type.startsWith('touch')) {
            const touch = e.touches[0];
            point = { x: touch.clientX, y: touch.clientY };
        } else {
            point = { x: e.clientX, y: e.clientY };
        }

        const entropyPoint = { ...point, time: currentTime, deltaTime: timeDelta, type: e.type };
        userEntropyData.push(entropyPoint);
        lastEventTime = currentTime;

        if (userEntropyData.length > MAX_ENTROPY_POINTS) {
            userEntropyData.shift();
        }
        updateEntropyDisplay();
    }

    function updateEntropyDisplay() {
        const currentEntropy = userEntropyData.length;
        const percentage = (currentEntropy / MAX_ENTROPY_POINTS) * 100;
        elements.entropyCount.textContent = currentEntropy;
        elements.entropyFill.style.width = percentage + '%';
        elements.entropyStatus.className = currentEntropy >= MAX_ENTROPY_POINTS ? 'status-indicator status-ready' : 'status-indicator status-collecting';
    }

    async function generateUserSeed() {
        if (userEntropyData.length < MAX_ENTROPY_POINTS) return null;
        let entropyString = userEntropyData.map(p => `${p.x}:${p.y}:${p.time.toFixed(4)}:${p.deltaTime.toFixed(4)}:${p.type}`).join('|');
        const timeBeforeGenerate = performance.now() - pageLoadTime;
        entropyString += `|${timeBeforeGenerate}:${navigator.userAgent.length}`;
        let hash = entropyString;
        for (let i = 0; i < HASH_ROUNDS; i++) {
            hash = await sha512(hash + i.toString() + (currentSeed || ''));
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
            crypto.getRandomValues(cryptoArray);
            const combinedSeed = await sha512(userSeed + Array.from(cryptoArray).join(''));
            currentSeed = combinedSeed;

            if (seedVisible) {
                elements.seedDisplay.textContent = `SEED (${combinedSeed.length} chars): ${combinedSeed}`;
            }

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
        try {
            const length = parseInt(elements.lengthSlider.value);
            const options = {
                uppercase: document.getElementById('uppercase').checked,
                lowercase: document.getElementById('lowercase').checked,
                numbers: document.getElementById('numbers').checked,
                special: document.getElementById('specialChars').checked
            };
            const password = await generateSecurePassword(length, options);
            if (password) {
                passwordGenerated = true;
                elements.passwordDisplay.textContent = password;
                elements.passwordDisplay.classList.add('generated');
                setTimeout(() => elements.passwordDisplay.classList.remove('generated'), 500);
            }
        } catch (error) {
            console.error('Error in generate button:', error);
            showNotification('errorGenerateFirst');
        }
    });

    elements.copyBtn.addEventListener('click', function() {
        try {
            if (!passwordGenerated) {
                showNotification('errorGenerateFirst');
                return;
            }
            navigator.clipboard.writeText(elements.passwordDisplay.textContent).then(() => {
                showNotification('copied');
            }).catch(error => {
                console.error('Error copying to clipboard:', error);
            });
        } catch (error) {
            console.error('Error in copy button:', error);
        }
    });

    elements.saveBtn.addEventListener('click', function() {
        try {
            if (!passwordGenerated) {
                showNotification('errorGenerateFirst');
                return;
            }
            
            if (!confirm(translations[currentLang].exportWarning)) {
                return;
            }

            const password = elements.passwordDisplay.textContent;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const seedInfo = currentSeed && seedVisible ? `\n\nSEED:\n${currentSeed}` : '';
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
        } catch (error) {
            console.error('Error in save button:', error);
        }
    });

    setLanguage(currentLang);
    updateEntropyDisplay();
});
