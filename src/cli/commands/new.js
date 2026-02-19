const { intro, text, select, isCancel, cancel } = require('@clack/prompts');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const matter = require('gray-matter');
const configService = require('../../core/configService');
const taskService = require('../../core/taskService');
const taskRepository = require('../../data/taskRepository');
const i18n = require('../../utils/i18n');
const dateFormatter = require('../../utils/dateFormatter');

const TEMP_FILE = path.join('/tmp', `temp-task-${Date.now()}.md`);

async function createNewTask() {
    // Reload lang in case config changed
    i18n.loadLanguage();

    intro(chalk.inverse(i18n.t('setupIntro'))); // Reusing intro or promptTitle context?
    // Actually new task intro should be consistent
    // Let's use 'Create New Task' but we don't have a key for that title in my json
    // Wait, I put "promptTitle": "Qual o título da tarefa?" 
    // I should create a header key. "newTaskTitle" maybe?
    // I used "setupIntro" for "Welcome...".
    // I'll just use chalk.inverse(' ' + i18n.t('promptTitle') + ' ') for now or hardcode?
    // No, I added "promptTitle" as the QUESTION. 
    // Let's check my JSON. 
    // "promptTitle": "What is the task title?"
    // I need a header.
    // I'll skip header or use "CLI Task Manager".

    // Actually I can just use i18n.t('promptTitle') for the text prompt.

    const title = await text({
        message: i18n.t('promptTitle'),
        placeholder: i18n.t('promptTitlePlaceholder'),
        validate(value) {
            if (value.length === 0) return i18n.t('valRequired');
        },
    });

    if (isCancel(title)) {
        cancel(i18n.t('opCancelled'));
        process.exit(0);
    }

    const config = configService.loadConfig();
    const categoryOptions = (config.categories || ['work', 'personal', 'study']).map(c => ({
        value: c,
        label: c.charAt(0).toUpperCase() + c.slice(1)
    }));

    const category = await select({
        message: i18n.t('promptCategory'),
        options: categoryOptions,
    });

    if (isCancel(category)) {
        cancel(i18n.t('opCancelled'));
        process.exit(0);
    }

    const description = await text({
        message: i18n.t('promptDesc'),
        placeholder: i18n.t('promptDescPlaceholder'),
        initialValue: '',
    });

    if (isCancel(description)) {
        cancel(i18n.t('opCancelled'));
        process.exit(0);
    }

    const deadlineRaw = await text({
        message: `${i18n.t('promptDeadline')} ${chalk.dim(i18n.t('dateFormatHint'))}`,
        placeholder: config.language === 'pt-BR' ? 'DD/MM/AAAA' : 'MM/DD/YYYY',
        initialValue: '',
    });

    if (isCancel(deadlineRaw)) {
        cancel(i18n.t('opCancelled'));
        process.exit(0);
    }

    const deadline = dateFormatter.parseDate(deadlineRaw, config.language);

    // Dynamic status options from config
    const statusOptions = config.statuses.map(s => ({
        value: s.id,
        label: s.label
    }));

    const status = await select({
        message: i18n.t('promptStatus'),
        options: statusOptions.length > 0 ? statusOptions : [
            { value: 'todo', label: 'Todo' }, // Fallback
            { value: 'in-progress', label: 'In Progress' },
            { value: 'done', label: 'Done' },
        ],
    });

    if (isCancel(status)) {
        cancel(i18n.t('opCancelled'));
        process.exit(0);
    }

    const template = taskService.buildFrontmatter(Date.now(), title, category, deadline, status, description);

    try {
        fs.writeFileSync(TEMP_FILE, template);
    } catch (err) {
        console.error(chalk.red(i18n.t('errorGeneric')), err);
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
        console.log(chalk.green(i18n.t('taskCreated', { filename })));

        cleanupTempFile();
    } catch (err) {
        console.error(chalk.red(i18n.t('errorGeneric')), err);
        cleanupTempFile();
    }
}

function cleanupTempFile() {
    if (fs.existsSync(TEMP_FILE)) {
        fs.unlinkSync(TEMP_FILE);
    }
}

module.exports = createNewTask;
