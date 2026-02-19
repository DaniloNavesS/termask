const { intro, select, isCancel, cancel } = require('@clack/prompts');
const chalk = require('chalk');
const taskService = require('../../core/taskService');
const taskRepository = require('../../data/taskRepository');
const { renderTask } = require('../utils/renderer');

async function viewTaskInteractive(args, statusFilter, categoryFilter) {
    intro(chalk.inverse(' View Task '));

    const query = args && args.length > 0 ? args[0] : null;
    const tasks = taskService.getFilteredTasks(statusFilter, categoryFilter, query);

    if (tasks.length === 0) {
        if (taskRepository.getAllTasks().length > 0 && tasks.length === 0) {
            const msg = query
                ? `\nNo tasks found matching query '${query}' and filters.`
                : `\nNo tasks found matching your filters.`;
            console.log(chalk.yellow(msg));
            process.exit(0);
        } else {
            cancel('No tasks found to view.');
            process.exit(0);
        }
    }

    const options = tasks.map(task => {
        let label = task.title || task.filename;
        if (task.category) {
            label = `[${task.category}] ${label}`;
        }
        return {
            value: task.filename,
            label: label,
        };
    });

    const selectedFile = await select({
        message: 'Select a task to view:',
        options: options,
    });

    if (isCancel(selectedFile)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    const task = taskRepository.getTaskByFilename(selectedFile);
    if (task) {
        renderTask(task.rawContent);
    } else {
        console.error(chalk.red('Error: Task file not found.'));
    }
}

module.exports = viewTaskInteractive;
