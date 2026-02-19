const React = require('react');
const { render } = require('ink');
const Dashboard = require('../../ui/Dashboard');
const taskService = require('../../core/taskService');
const configService = require('../../core/configService');
const chalk = require('chalk');

function listTasks(args, statusFilter, categoryFilter, includeArchived) {
    try {
        const query = args && args.length > 0 ? args[0] : null;
        const tasks = taskService.getFilteredTasks(statusFilter, categoryFilter, query, includeArchived);
        const config = configService.loadConfig();

        if (tasks.length === 0 && query) {
            console.log(chalk.yellow(`\nNo tasks found matching query '${query}' and filters.`));
        }

        render(React.createElement(Dashboard, { tasks, config, filterStatus: statusFilter }));
    } catch (err) {
        console.error(chalk.red('Error listing tasks:'), err);
    }
}

module.exports = listTasks;
