const { intro, select, isCancel, cancel } = require('@clack/prompts');
const chalk = require('chalk');
const taskService = require('../../core/taskService');
const taskRepository = require('../../data/taskRepository');
const configService = require('../../core/configService');
const matter = require('gray-matter');

async function moveTaskInteractive(args, statusFilter, categoryFilter) {
    intro(chalk.inverse(' Move Task '));

    const query = args && args.length > 0 ? args[0] : null;
    const tasks = taskService.getFilteredTasks(statusFilter, categoryFilter, query);

    if (tasks.length === 0) {
        if (taskRepository.getAllTasks().length > 0 && tasks.length === 0) {
            const msg = query
                ? `\nNo tasks found matching query '${query}' and filters to move.`
                : `\nNo tasks found matching your filters to move.`;
            console.log(chalk.yellow(msg));
            process.exit(0);
        } else {
            cancel('No tasks found to move.');
            process.exit(0);
        }
    }

    const options = tasks.map(task => {
        let label = task.title || task.filename;
        return {
            value: task.filename,
            label: label,
        };
    });

    const selectedFile = await select({
        message: 'Select a task to move:',
        options: options,
    });

    if (isCancel(selectedFile)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    const config = configService.loadConfig();
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

        console.log(chalk.green(`\nTask moved successfully to '${newStatus}'`));
    } catch (err) {
        console.error(chalk.red('Error moving task:'), err);
    }
}

module.exports = moveTaskInteractive;
