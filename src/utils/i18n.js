const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../../task-config.json');
const DEFAULT_LANG = 'pt-BR';

let currentLang = DEFAULT_LANG;
let translations = {};

// Load config to get language
function loadLanguage() {
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
            if (config.language) {
                currentLang = config.language;
            }
        } catch (err) {
            // ignore error, use default
        }
    }
    loadTranslations(currentLang);
}

function loadTranslations(lang) {
    try {
        const localePath = path.join(__dirname, `../locales/${lang}.json`);
        if (fs.existsSync(localePath)) {
            translations = JSON.parse(fs.readFileSync(localePath, 'utf8'));
        } else {
            // Fallback to default if locale file specific to region doesn't exist?
            // For now assume files exist.
            translations = require('../locales/en-US.json');
        }
    } catch (err) {
        translations = require('../locales/en-US.json');
    }
}

function t(key, params = {}) {
    let text = translations[key] || key;

    // Simple replacement for {param}
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });

    return text;
}

function getLanguage() {
    return currentLang;
}

// Initial load
loadLanguage();

module.exports = {
    t,
    loadLanguage, // Call this if config changes at runtime (e.g. setup)
    getLanguage
};
