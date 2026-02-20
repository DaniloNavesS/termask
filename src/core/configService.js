const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { intro, confirm, cancel, outro, select } = require('@clack/prompts');
const { isCancel } = require('@clack/prompts');

const CONFIG_FILE = path.join(__dirname, '../../task-config.json');
const TASKS_DIR = path.join(__dirname, '../../data/tasks');

function loadConfig() {
    let config = { statuses: [], categories: [] };
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        } catch (err) {
            console.error(chalk.red('Error loading config file:'), err);
        }
    }

    // Migration: Convert old string categories to objects
    if (config.categories && config.categories.length > 0 && typeof config.categories[0] === 'string') {
        config.categories = config.categories.map(cat => ({
            id: cat,
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
            color: 'gray'
        }));
        // Silently save the migrated config
        saveConfig(config);
    }

    // Inject default priorities if missing (backward compatibility)
    if (!config.priorities || config.priorities.length === 0) {
        config.priorities = [
            { id: "high", label: "↑ Alta", color: "red" },
            { id: "medium", label: "≡ Média", "color": "yellow" },
            { id: "low", label: "↓ Baixa", "color": "blue" }
        ];
    }

    return config;
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

const i18n = require('../utils/i18n');

async function checkAndInitSetup() {
    // 1. Silent Check/Create of tasks directory
    if (!fs.existsSync(TASKS_DIR)) {
        try {
            fs.mkdirSync(TASKS_DIR, { recursive: true });
        } catch (err) {
            // Silent failure
        }
    }

    // 2. Check for Config File
    if (fs.existsSync(CONFIG_FILE)) {
        // Load language from config if exists
        i18n.loadLanguage();
        return; // Config exists, proceed normally
    }

    // 3. Wizard for First Run
    console.log(); // Spacing
    // We don't know language yet, so hardcode or ask first

    const language = await select({
        message: 'Choose your language / Escolha seu idioma:',
        options: [
            { value: 'en-US', label: 'English (US)' },
            { value: 'pt-BR', label: 'Português (BR)' }
        ]
    });

    if (isCancel(language)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    // Save initial config with language to load i18n
    saveConfig({ language, statuses: [], categories: [] });
    i18n.loadLanguage();

    intro(chalk.inverse(i18n.t('setupIntro')));
    console.log(chalk.dim(i18n.t('setupFirstTime')));

    const shouldInit = await confirm({
        message: i18n.t('setupInitPrompt'),
        initialValue: true
    });

    if (isCancel(shouldInit) || !shouldInit) {
        cancel(i18n.t('setupInitCancel'));
        process.exit(1);
    }

    // Create default config
    const defaultConfig = {
        "language": language,
        "statuses": [
            { "id": "todo", "label": i18n.t('statusTodo'), "color": "red" },
            { "id": "in-progress", "label": i18n.t('statusInProgress'), "color": "yellow" },
            { "id": "done", "label": i18n.t('statusDone'), "color": "green" }
        ],
        "categories": [
            { "id": "work", "label": i18n.t('categoryWork') || "Work", "color": "cyan" },
            { "id": "personal", "label": i18n.t('categoryPersonal') || "Personal", "color": "magenta" },
            { "id": "study", "label": i18n.t('categoryStudy') || "Study", "color": "blue" }
        ],
        "priorities": [
            { "id": "high", "label": "↑ Alta", "color": "red" },
            { "id": "medium", "label": "≡ Média", "color": "yellow" },
            { "id": "low", "label": "↓ Baixa", "color": "blue" }
        ]
    };

    try {
        saveConfig(defaultConfig);
        outro(i18n.t('setupDone'));
        process.exit(0);
    } catch (err) {
        console.error(chalk.red('Error creating config file:'), err);
        process.exit(1);
    }
}

module.exports = {
    loadConfig,
    saveConfig,
    checkAndInitSetup
};
