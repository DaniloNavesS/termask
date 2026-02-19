#!/usr/bin/env node

require('@babel/register')({
    presets: ['@babel/preset-react']
});

const React = require('react');
const { render } = require('ink');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const matter = require('gray-matter');
const chalk = require('chalk');
const { intro, text, select, isCancel, cancel, confirm, outro } = require('@clack/prompts');
const arg = require('arg');

// Import UI components after babel register
const Dashboard = require('./ui/Dashboard');

const TASKS_DIR = path.join(__dirname, '../data/tasks');
const TEMP_FILE = path.join('/tmp', `temp-task-${Date.now()}.md`);
const CONFIG_FILE = path.join(__dirname, '../task-config.json');

// Load config
let config = { statuses: [] };
try {
    if (fs.existsSync(CONFIG_FILE)) {
        config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
} catch (err) {
    console.error(chalk.red('Error loading config file:'), err);
}

// Tasks directory creation check moved to checkAndInitSetup

// Parse args
const args = arg({
    '--status': String,
    '--category': String,
    // Aliases
    '-s': '--status',
    '-c': '--category',
}, {
    permissive: true
});

const command = args._[0];
const commandArgs = args._.slice(1);

async function main() {
    await checkAndInitSetup();

    switch (command) {
        case 'new':
            await createNewTask();
            break;
        case 'list':
            listTasks(args['--status'], args['--category']);
            break;
        case 'move':
            await moveTaskInteractive();
            break;
        case 'delete':
            await deleteTaskInteractive();
            break;
        case 'help':
        default:
            showHelp();
            break;
    }
}

function showHelp() {
    console.log(chalk.bold('\n🚀 CLI Task Manager\n'));
    console.log(`  ${chalk.green('task-cli new')}                          - Create a new task`);
    console.log(`  ${chalk.green('task-cli list')}                         - List all tasks (TUI)`);
    console.log(`  ${chalk.green('task-cli list --status <id>')}           - Filter by status`);
    console.log(`  ${chalk.green('task-cli list --category <name>')}       - Filter by category`);
    console.log(`  ${chalk.green('task-cli move')}                         - Move task status (Interactive)`);
    console.log(`  ${chalk.green('task-cli delete')}                       - Delete a task (Interactive)`);
    console.log(`  ${chalk.green('task-cli help')}                         - Show this help`);
    console.log();
}

main();

async function createNewTask() {
    intro(chalk.inverse(' Create New Task '));

    const title = await text({
        message: 'What is the task title?',
        placeholder: 'e.g. Buy groceries',
        validate(value) {
            if (value.length === 0) return 'Title is required!';
        },
    });

    if (isCancel(title)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    const category = await text({
        message: 'What is the category? (optional)',
        placeholder: 'e.g. work, personal, study',
        initialValue: '',
    });

    if (isCancel(category)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    const deadline = await text({
        message: 'What is the deadline? (optional)',
        placeholder: 'YYYY-MM-DD',
        initialValue: '',
    });

    if (isCancel(deadline)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    // Dynamic status options from config
    const statusOptions = config.statuses.map(s => ({
        value: s.id,
        label: s.label
    }));

    const status = await select({
        message: 'What is the status?',
        options: statusOptions.length > 0 ? statusOptions : [
            { value: 'todo', label: 'Todo' }, // Fallback
            { value: 'in-progress', label: 'In Progress' },
            { value: 'done', label: 'Done' },
        ],
    });

    if (isCancel(status)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    const template = `---
id: ${Date.now()}
title: ${title}
category: ${category || ''}
deadline: ${deadline || ''}
status: ${status}
---

`;

    try {
        fs.writeFileSync(TEMP_FILE, template);
    } catch (err) {
        console.error(chalk.red('Error creating temporary file:'), err);
        process.exit(1);
    }

    const editor = spawn('vim', ['+normal G', TEMP_FILE], {
        stdio: 'inherit'
    });

    editor.on('exit', (code) => {
        if (code === 0) {
            processTempFile();
        } else {
            console.log(chalk.red('Editor closed with error code:', code));
            cleanupTempFile();
        }
    });
}

function processTempFile() {
    try {
        const content = fs.readFileSync(TEMP_FILE, 'utf8');
        const parsed = matter(content);

        let title = parsed.data.title;
        if (!title) {
            title = 'untitled-task';
        }

        const slug = title
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');

        const timestamp = parsed.data.id || Date.now();
        const filename = `${timestamp}-${slug}.md`;
        const finalPath = path.join(TASKS_DIR, filename);

        fs.writeFileSync(finalPath, content);

        console.log();
        console.log(chalk.green(`Task created successfully: ${filename}`));

        cleanupTempFile();
    } catch (err) {
        console.error(chalk.red('Error processing task file:'), err);
        cleanupTempFile();
    }
}

function cleanupTempFile() {
    if (fs.existsSync(TEMP_FILE)) {
        fs.unlinkSync(TEMP_FILE);
    }
}

function listTasks(statusFilter, categoryFilter) {
    try {
        const files = fs.readdirSync(TASKS_DIR).filter(file => file.endsWith('.md'));
        const tasks = [];

        files.forEach(file => {
            const content = fs.readFileSync(path.join(TASKS_DIR, file), 'utf8');
            const parsed = matter(content);
            tasks.push({
                ...parsed.data,
                filename: file
            });
        });

        // Filtering
        let filteredTasks = tasks;
        if (statusFilter) {
            filteredTasks = filteredTasks.filter(t => t.status === statusFilter);
        }
        if (categoryFilter) {
            filteredTasks = filteredTasks.filter(t => t.category && t.category.toLowerCase().includes(categoryFilter.toLowerCase()));
        }

        // Render the React TUI with filtered tasks and config
        render(React.createElement(Dashboard, { tasks: filteredTasks, config: config, filterStatus: statusFilter }));

    } catch (err) {
        console.error(chalk.red('Error listing tasks:'), err);
    }
}

function updateTask(id, newStatus) {
    if (!id || !newStatus) {
        console.log(chalk.yellow('Usage: task-cli update <id> <status>'));
        return;
    }

    try {
        const files = fs.readdirSync(TASKS_DIR).filter(file => file.endsWith('.md'));
        let found = false;

        for (const file of files) {
            const filePath = path.join(TASKS_DIR, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const parsed = matter(content);

            if (String(parsed.data.id) === String(id)) {
                parsed.data.status = newStatus;
                const newContent = matter.stringify(parsed.content, parsed.data);
                fs.writeFileSync(filePath, newContent);
                console.log(chalk.green(`Task ${id} updated to status '${newStatus}'`));
                found = true;
                break;
            }
        }

        if (!found) {
            console.log(chalk.red(`Task with ID ${id} not found.`));
        }

    } catch (err) {
        console.error(chalk.red('Error updating task:'), err);
    }
}

async function moveTaskInteractive() {
    intro(chalk.inverse(' Move Task '));

    const files = fs.readdirSync(TASKS_DIR).filter(file => file.endsWith('.md'));
    if (files.length === 0) {
        cancel('No tasks found to move.');
        process.exit(0);
    }

    const tasks = files.map(file => {
        const content = fs.readFileSync(path.join(TASKS_DIR, file), 'utf8');
        const parsed = matter(content);
        return {
            value: file,
            label: parsed.data.title || file,
            id: parsed.data.id
        };
    });

    const selectedFile = await select({
        message: 'Select a task to move:',
        options: tasks,
    });

    if (isCancel(selectedFile)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    // Dynamic status options from config
    const statusOptions = config.statuses.map(s => ({
        value: s.id,
        label: s.label
    }));

    const newStatus = await select({
        message: 'Select new status:',
        options: statusOptions,
    });

    if (isCancel(newStatus)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    // Update the file
    try {
        const filePath = path.join(TASKS_DIR, selectedFile);
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = matter(content);

        parsed.data.status = newStatus;
        const newContent = matter.stringify(parsed.content, parsed.data);
        fs.writeFileSync(filePath, newContent);

        console.log(chalk.green(`\nTask moved successfully to '${newStatus}'`));
    } catch (err) {
        console.error(chalk.red('Error moving task:'), err);
    }
}

async function deleteTaskInteractive() {
    intro(chalk.inverse(' Delete Task '));

    const files = fs.readdirSync(TASKS_DIR).filter(file => file.endsWith('.md'));
    if (files.length === 0) {
        cancel('No tasks found to delete.');
        process.exit(0);
    }

    const tasks = files.map(file => {
        const content = fs.readFileSync(path.join(TASKS_DIR, file), 'utf8');
        const parsed = matter(content);
        return {
            value: file,
            label: parsed.data.title || file
        };
    });

    const selectedFile = await select({
        message: 'Select a task to delete:',
        options: tasks,
    });

    if (isCancel(selectedFile)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    const shouldDelete = await confirm({
        message: `Are you sure you want to delete this task?`,
    });

    if (isCancel(shouldDelete) || !shouldDelete) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    try {
        const filePath = path.join(TASKS_DIR, selectedFile);
        fs.unlinkSync(filePath);
        console.log(chalk.green('\nTask deleted successfully.'));
    } catch (err) {
        console.error(chalk.red('Error deleting task:'), err);
    }
}

async function checkAndInitSetup() {
    // 1. Silent Check/Create of tasks directory
    if (!fs.existsSync(TASKS_DIR)) {
        try {
            fs.mkdirSync(TASKS_DIR, { recursive: true });
        } catch (err) {
            // Silent failure as requested, or maybe log debug? keeping silent.
        }
    }

    // 2. Check for Config File
    if (fs.existsSync(CONFIG_FILE)) {
        return; // Config exists, proceed normally
    }

    // 3. Wizard for First Run
    // Intro is from @clack/prompts
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
        ]
    };

    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
        outro('Ambiente configurado! Digite `task-cli help` para começar.');
        process.exit(0);
    } catch (err) {
        console.error(chalk.red('Error creating config file:'), err);
        process.exit(1);
    }
}
