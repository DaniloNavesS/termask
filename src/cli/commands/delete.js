const { intro, select, isCancel, cancel, confirm } = require('@clack/prompts');
const chalk = require('chalk');
const taskService = require('../../core/taskService');
const taskRepository = require('../../data/taskRepository');

async function deleteTaskInteractive(args, statusFilter, categoryFilter) {
    intro(chalk.inverse(' Delete Task '));

    const query = args && args.length > 0 ? args[0] : null;
    const tasks = taskService.getFilteredTasks(statusFilter, categoryFilter, query);

    if (tasks.length === 0) {
        if (taskRepository.getAllTasks().length > 0 && tasks.length === 0) {
            const msg = query
                ? `\nNo tasks found matching query '${query}' and filters to delete.`
                : `\nNo tasks found matching your filters to delete.`;
            console.log(chalk.yellow(msg));
            process.exit(0);
        } else {
            cancel('No tasks found to delete.');
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
        message: 'Select a task to delete:',
        options: options,
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
        taskRepository.deleteTask(selectedFile);
        console.log(chalk.green('\nTask deleted successfully.'));
    } catch (err) {
        console.error(chalk.red('Error deleting task:'), err);
    }
}

module.exports = deleteTaskInteractive;
