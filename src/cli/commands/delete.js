const { intro, select, isCancel, cancel, confirm } = require('@clack/prompts');
const chalk = require('chalk');
const taskService = require('../../core/taskService');
const taskRepository = require('../../data/taskRepository');
const i18n = require('../../utils/i18n');

async function deleteTaskInteractive(args, statusFilter, categoryFilter) {
    i18n.loadLanguage();
    intro(chalk.inverse(i18n.t('deleteTitle')));

    const query = args && args.length > 0 ? args[0] : null;
    const tasks = taskService.getFilteredTasks(statusFilter, categoryFilter, query);

    if (tasks.length === 0) {
        console.log(chalk.yellow(i18n.t('viewNoTasks')));
        process.exit(0);
    }

    const options = tasks.map(task => {
        let label = task.title || task.filename;
        return {
            value: task.filename,
            label: label,
        };
    });

    const selectedFile = await select({
        message: i18n.t('deleteSelectPrompt'),
        options: options,
    });

    if (isCancel(selectedFile)) {
        cancel(i18n.t('opCancelled'));
        process.exit(0);
    }

    const shouldDelete = await confirm({
        message: i18n.t('deleteConfirm'),
    });

    if (isCancel(shouldDelete) || !shouldDelete) {
        cancel(i18n.t('opCancelled'));
        process.exit(0);
    }

    try {
        taskRepository.deleteTask(selectedFile);
        console.log(chalk.green(i18n.t('deleteSuccess')));
    } catch (err) {
        console.error(chalk.red(i18n.t('errorGeneric')), err);
    }
}

module.exports = deleteTaskInteractive;
