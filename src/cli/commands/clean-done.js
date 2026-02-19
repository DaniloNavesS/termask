const { intro, select, isCancel, cancel, confirm } = require('@clack/prompts');
const chalk = require('chalk');
const taskRepository = require('../../data/taskRepository');
const taskService = require('../../core/taskService');
const matter = require('gray-matter');
const i18n = require('../../utils/i18n');

async function cleanDoneInteractive() {
    i18n.loadLanguage();
    intro(chalk.inverse(i18n.t('cleanTitle')));

    // Get all tasks that are done AND not archived
    const tasks = taskService.getFilteredTasks('done');

    if (tasks.length === 0) {
        console.log(chalk.yellow(i18n.t('cleanNoTasks')));
        process.exit(0);
    }

    console.log(chalk.blue(i18n.t('cleanFoundTasks', { count: tasks.length })));

    const action = await select({
        message: i18n.t('cleanActionPrompt'),
        options: [
            { value: 'archive', label: i18n.t('cleanActionArchive') },
            { value: 'delete', label: i18n.t('cleanActionDelete') },
            { value: 'cancel', label: i18n.t('cleanActionCancel') }
        ],
    });

    if (isCancel(action) || action === 'cancel') {
        cancel(i18n.t('opCancelled'));
        process.exit(0);
    }

    if (action === 'archive') {
        const confirmArchive = await confirm({
            message: i18n.t('cleanConfirmArchive', { count: tasks.length }),
        });

        if (isCancel(confirmArchive) || !confirmArchive) {
            cancel(i18n.t('opCancelled'));
            process.exit(0);
        }

        let count = 0;
        for (const task of tasks) {
            const newData = { ...task };
            delete newData.filename;
            delete newData.content;
            delete newData.rawContent;

            newData.archived = true;

            const newContent = matter.stringify(task.content, newData);
            taskRepository.saveTask(task.filename, newContent);
            count++;
        }
        console.log(chalk.green(i18n.t('cleanSuccessArchive', { count })));

    } else if (action === 'delete') {
        const confirmDelete = await confirm({
            message: i18n.t('cleanConfirmDelete', { count: tasks.length }),
        });

        if (isCancel(confirmDelete) || !confirmDelete) {
            cancel(i18n.t('opCancelled'));
            process.exit(0);
        }

        let count = 0;
        for (const task of tasks) {
            taskRepository.deleteTask(task.filename);
            count++;
        }
        console.log(chalk.green(i18n.t('cleanSuccessDelete', { count })));
    }
}

module.exports = cleanDoneInteractive;
