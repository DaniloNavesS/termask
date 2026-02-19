const { intro, select, isCancel, cancel } = require('@clack/prompts');
const chalk = require('chalk');
const taskService = require('../../core/taskService');
const taskRepository = require('../../data/taskRepository');
const { renderTask } = require('../utils/renderer');
const i18n = require('../../utils/i18n');

async function viewTaskInteractive(args, statusFilter, categoryFilter, includeArchived) {
    i18n.loadLanguage();
    intro(chalk.inverse(i18n.t('viewTitle')));

    const query = args && args.length > 0 ? args[0] : null;
    const tasks = taskService.getFilteredTasks(statusFilter, categoryFilter, query, includeArchived);

    if (tasks.length === 0) {
        console.log(chalk.yellow(i18n.t('viewNoTasks')));
        process.exit(0);
    }

    const options = tasks.map(task => {
        let label = task.title || task.filename;
        if (task.category) {
            label = `[${task.category}] ${label}`;
        }
        if (task.archived) {
            label = `${label} (Archived)`;
        }
        return {
            value: task.filename,
            label: label,
        };
    });

    const selectedFile = await select({
        message: i18n.t('viewSelectPrompt'),
        options: options,
    });

    if (isCancel(selectedFile)) {
        cancel(i18n.t('opCancelled'));
        process.exit(0);
    }

    const task = taskRepository.getTaskByFilename(selectedFile);
    if (task) {
        renderTask(task.rawContent);
    } else {
        console.error(chalk.red(i18n.t('viewError')));
    }
}

module.exports = viewTaskInteractive;
