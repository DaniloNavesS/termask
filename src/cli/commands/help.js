const chalk = require('chalk');

function showHelp() {
    console.log(chalk.bold('\n🚀 CLI Task Manager\n'));
    console.log(`  ${chalk.green('task-cli new')}                          - Create a new task`);
    console.log(`  ${chalk.green('task-cli list [term]')}                  - List tasks (optional search term)`);
    console.log(`  ${chalk.green('task-cli list --status <id> (-s)')}      - Filter by status`);
    console.log(`  ${chalk.green('task-cli list --category <name> (-c)')}  - Filter by category`);
    console.log(`  ${chalk.green('task-cli move [term]')}                  - Move task status (optional search)`);
    console.log(`  ${chalk.green('task-cli delete [term]')}                - Delete a task (optional search)`);
    console.log(`  ${chalk.green('task-cli view [term]')}                  - View task details (optional search)`);
    console.log(`  ${chalk.green('task-cli search <term>')}                - Search tasks by content (Alias to view)`);
    console.log(`  ${chalk.green('task-cli config')}                       - Configure settings (Interactive)`);
    console.log(`  ${chalk.green('task-cli help')}                         - Show this help`);
    console.log();
}

module.exports = showHelp;
