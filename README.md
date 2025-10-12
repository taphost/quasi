# [ QUASI ] - Secure Password Generator

![Version](https://img.shields.io/badge/version-1.0.0-yellow.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)
![Security](https://img.shields.io/badge/security-cryptographic-orange.svg)

Un generatore di password sicure che utilizza entropia fisica da movimenti mouse/touch combinata con le API crittografiche del browser.

## ⚠️ Avviso di Sicurezza

I browser non sono ambienti a prova di manomissione. Estensioni malevole o attacchi XSS potrebbero compromettere la sicurezza. Usa questo strumento con cautela, preferibilmente in un browser con un profilo pulito.

## 🎯 Caratteristiche

### Entropia Fisica
- **Raccolta movimenti**: Cattura coordinate X/Y, timestamp e delta temporale da mouse/touch
- **1000 punti richiesti**: Accumula entropia sufficiente prima della generazione
- **Feedback visivo**: Barra di progresso in tempo reale

### Generazione Crittografica
- **Doppia fonte di entropia**: Combina entropia fisica con `crypto.getRandomValues()`
- **10.000 iterazioni SHA-512**: Hash multipli del seed per massima casualità
- **Seed visualizzabile**: Opzionale trasparenza del processo di generazione

### Configurazione Password
- **Lunghezza**: da 8 a 128 caratteri
- **Set di caratteri personalizzabili**:
  - Maiuscole (A-Z)
  - Minuscole (a-z)
  - Numeri (0-9)
  - Caratteri speciali (!@#$%^&*()_+-=[]{}|;:,.<>?~`)

### UI/UX
- **Design CRT retro**: Effetto schermo vintage con flickering e scanlines.
- **Matrix Animation**: Animazione a cascata in stile "Matrix" nel display della password.
- **Typewriter Effect**: Testo che appare con un effetto macchina da scrivere per un feedback dinamico.
- **Glow Breathing**: Animazioni che guidano l'utente attraverso il workflow.
- **Modal di Conferma Personalizzato**: Avviso di sicurezza per l'esportazione con uno stile coerente all'interfaccia.
- **Interfaccia Interattiva**: Sezioni collassabili e checkbox personalizzate.
- **Responsive**: Ottimizzato per desktop, tablet e mobile.
- **Bilingue**: Italiano e Inglese.

## 🚀 Installazione

```bash
# Clona il repository
git clone https://github.com/taphost/quasi.git
cd quasi

# Assicurati di avere la struttura corretta
quasi/
├── index.html
├── styles.css
├── script.js
├── animations.js
├── fonts/
│   └── VT323-Regular.woff2
└── README.md
```

## 📖 Utilizzo

1. **Apri `index.html`** nel browser
2. **Muovi il mouse** o tocca lo schermo per raccogliere entropia (1000/1000 punti)
3. **Configura** lunghezza e caratteri desiderati
4. **Clicca GENERA** quando la barra entropia è piena
5. **COPIA** negli appunti o **ESPORTA** in file di testo

### Workflow Guidato

L'interfaccia usa animazioni "breathing glow" per guidare l'utente:

- **Stato iniziale**: Glow su istruzioni
- **Entropia pronta**: Glow su display password e bottone GENERA
- **Password generata**: Glow su display, COPIA e ESPORTA
- **Copiata/Esportata**: Tutti i glow si fermano

## 🔐 Sicurezza

### Architettura Crittografica

```
Entropia Fisica (1000 punti) → SHA-512 (10k iterazioni) → User Seed
                                                              ↓
                                        Crypto.getRandomValues() → Combined Seed
                                                              ↓
                                                    Password Generation
```

### Considerazioni

- ✅ **Offline-first**: Nessuna connessione di rete richiesta
- ✅ **No storage**: Nessun dato salvato in localStorage/sessionStorage
- ✅ **Trasparenza**: Seed visualizzabile per verifica
- ⚠️ **Export non sicuro**: I file .txt esportati non sono crittografati
- ⚠️ **Browser extensions**: Potrebbero intercettare i dati

### Best Practices

1. Usa un profilo browser pulito senza estensioni
2. Copia immediatamente nel password manager
3. Elimina subito i file .txt esportati
4. Non condividere screenshot del seed
5. Usa HTTPS se ospiti su server

## 🛠️ Struttura Tecnica

### File

- **index.html**: Struttura DOM e markup semantico
- **styles.css**: Design CRT retro con animazioni e responsive
- **script.js**: Logica principale, gestione entropia e crittografia
- **animations.js**: Sistema di animazioni guidate
- **fonts/**: Font VT323 per effetto terminale

### Dipendenze

Nessuna dipendenza esterna. Usa solo:
- Web Crypto API (`crypto.subtle.digest`)
- Crypto.getRandomValues
- API DOM standard

### Browser Supportati

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Richiede supporto per:
- ES6+ (async/await, arrow functions)
- Web Crypto API
- CSS Grid/Flexbox
- CSS Custom Properties

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 480px (2 checkbox per riga)
- **Small Mobile**: < 360px (1 checkbox per riga)
- **Desktop**: ≥ 1024px (4 checkbox per riga, hover effects)
- **Landscape**: < 500px altezza (layout compattato)

### Touch Optimization

- Tap highlight rimosso
- Touch-action: manipulation sui bottoni
- Eventi touch passivi per performance
- Font scaling fluido con clamp()

## 🎨 Personalizzazione

### Colori

```css
--primary: #fcd106;  /* Giallo CRT */
--bg: #000000;       /* Nero puro */
--warning: #ff6b00;  /* Arancione warning */
```

### Timing Entropia

```javascript
const MAX_ENTROPY_POINTS = 1000;  // Punti richiesti
const HASH_ROUNDS = 10000;        // Iterazioni SHA-512
```

## 🌐 Localizzazione

Attualmente supporta:
- 🇮🇹 Italiano (default)
- 🇬🇧 English

Per aggiungere una lingua, modifica l'oggetto `translations` in `script.js`:

```javascript
const translations = {
  it: { /* ... */ },
  en: { /* ... */ },
  fr: { /* ... */ }  // Nuova lingua
};
```

## 📄 Licenza

MIT License - Sentiti libero di usare e modificare per i tuoi progetti.

## 🐛 Bug Report

Apri un issue su GitHub includendo:
- Browser e versione
- Sistema operativo
- Passi per riprodurre
- Screenshot (senza seed visibili!)

## 📚 Risorse

- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [SHA-512 Algorithm](https://en.wikipedia.org/wiki/SHA-2)
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## ✨ Credits

- Font: [VT323](https://fonts.google.com/specimen/VT323) by Google Fonts
- Design: Ispirato ai terminali CRT vintage

---
