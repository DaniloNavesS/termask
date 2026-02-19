const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { intro, confirm, cancel, outro } = require('@clack/prompts');
const { isCancel } = require('@clack/prompts');

const CONFIG_FILE = path.join(__dirname, '../../task-config.json');
const TASKS_DIR = path.join(__dirname, '../../data/tasks');

function loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        } catch (err) {
            console.error(chalk.red('Error loading config file:'), err);
        }
    }
    return { statuses: [], categories: [] };
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

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
        return; // Config exists, proceed normally
    }

    // 3. Wizard for First Run
    console.log(); // Spacing
    intro(chalk.inverse(' Welcome to CLI Task Manager! '));
    console.log(chalk.dim(' It looks like this is your first time here. '));

    const shouldInit = await confirm({
        message: 'Do you want to initialize the environment with the default Kanban board?',
        initialValue: true
    });

    if (isCancel(shouldInit) || !shouldInit) {
        cancel('Initialization is required to run this app. Exiting.');
        process.exit(1);
    }

    // Create default config
    const defaultConfig = {
        "statuses": [
            { "id": "todo", "label": "Para Fazer", "color": "red" },
            { "id": "in-progress", "label": "Em Progresso", "color": "yellow" },
            { "id": "done", "label": "Feito", "color": "green" }
        ],
        "categories": ["work", "personal", "study"]
    };

    try {
        saveConfig(defaultConfig);
        outro('Ambiente configurado! Digite `task-cli help` para começar.');
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
