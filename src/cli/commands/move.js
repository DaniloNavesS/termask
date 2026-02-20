const { intro, select, isCancel, cancel } = require('@clack/prompts');
const chalk = require('chalk');
const taskService = require('../../core/taskService');
const taskRepository = require('../../data/taskRepository');
const configService = require('../../core/configService');
const matter = require('gray-matter');
const i18n = require('../../utils/i18n');

async function moveTaskInteractive(args, statusFilter, categoryFilter) {
    i18n.loadLanguage();
    intro(chalk.inverse(i18n.t('moveTitle')));

    const query = args && args.length > 0 ? args[0] : null;
    const tasks = taskService.getFilteredTasks(statusFilter, categoryFilter, query);

    if (tasks.length === 0) {
        console.log(chalk.yellow(i18n.t('viewNoTasks')));
        process.exit(0);
    }

    const config = configService.loadConfig();

    const options = tasks.map(task => {
        let taskTitle = task.title || task.filename;
        let catObj = config.categories ? config.categories.find(c => c.id === task.category) : null;
        let catColorPath = catObj?.color || 'gray';
        let catLabelColor = catObj?.label || (task.category ? task.category.charAt(0).toUpperCase() + task.category.slice(1) : 'Sem categoria');

        // Exemplo Chalk.keyword('magenta')() no código real é mais amigável, mas pegaremos a function do chalk se existir:
        let colorFunc = chalk[catColorPath] || chalk.gray;

        let displayLabel = `${colorFunc(`[${catLabelColor}]`)} ${taskTitle}`;

        return {
            value: task.filename,
            label: displayLabel,
        };
    });

    const selectedFile = await select({
        message: i18n.t('moveSelectPrompt'),
        options: options,
    });

    if (isCancel(selectedFile)) {
        cancel(i18n.t('opCancelled'));
        process.exit(0);
    }

    const statusOptions = config.statuses.map(s => ({
        value: s.id,
        label: s.label
    }));

    const newStatus = await select({
        message: i18n.t('moveStatusPrompt'),
        options: statusOptions,
    });

    if (isCancel(newStatus)) {
        cancel(i18n.t('opCancelled'));
        process.exit(0);
    }

    try {
        const task = taskRepository.getTaskByFilename(selectedFile);
        if (!task) throw new Error('Task not found');

        const newData = { ...task };
        delete newData.filename;
        delete newData.content;
        delete newData.rawContent;

        newData.status = newStatus;

        const newContent = matter.stringify(task.content, newData);
        taskRepository.saveTask(selectedFile, newContent);

        console.log(chalk.green(i18n.t('moveSuccess', { status: newStatus })));
    } catch (err) {
        console.error(chalk.red(i18n.t('errorGeneric')), err);
    }
}

module.exports = moveTaskInteractive;
