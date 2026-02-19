const { intro, text, select, isCancel, cancel } = require('@clack/prompts');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const matter = require('gray-matter');
const configService = require('../../core/configService');
const taskService = require('../../core/taskService');
const taskRepository = require('../../data/taskRepository');

const TEMP_FILE = path.join('/tmp', `temp-task-${Date.now()}.md`);

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

    const config = configService.loadConfig();
    const categoryOptions = (config.categories || ['work', 'personal', 'study']).map(c => ({
        value: c,
        label: c.charAt(0).toUpperCase() + c.slice(1)
    }));

    const category = await select({
        message: 'What is the category?',
        options: categoryOptions,
    });

    if (isCancel(category)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    const description = await text({
        message: 'Quick description (optional, press Enter to skip):',
        placeholder: 'e.g. Remember to buy milk',
        initialValue: '',
    });

    if (isCancel(description)) {
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

    const template = taskService.buildFrontmatter(Date.now(), title, category, deadline, status, description);

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

        let title = parsed.data.title || 'untitled-task';
        const slug = taskService.generateTaskSlug(title);
        const timestamp = parsed.data.id || Date.now();
        const filename = `${timestamp}-${slug}.md`;

        taskRepository.saveTask(filename, content);

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

module.exports = createNewTask;
