#!/usr/bin/env node

require('@babel/register')({
    presets: ['@babel/preset-react']
});

const arg = require('arg');
const configService = require('./core/configService');

// Import Commands
const createNewTask = require('./cli/commands/new');
const listTasks = require('./cli/commands/list');
const moveTaskInteractive = require('./cli/commands/move');
const deleteTaskInteractive = require('./cli/commands/delete');
const configureInteractive = require('./cli/commands/config');
const viewTaskInteractive = require('./cli/commands/view');
const searchTaskInteractive = require('./cli/commands/search');
const showHelp = require('./cli/commands/help');

// Parse args
const args = arg({
    '--status': String,
    '--category': String,
    '--archived': Boolean,
    // Aliases
    '-s': '--status',
    '-c': '--category',
    '-a': '--archived'
}, {
    permissive: true
});

const command = args._[0];
const commandArgs = args._.slice(1);

async function main() {
    await configService.checkAndInitSetup();

    const includeArchived = args['--archived'] || false;

    switch (command) {
        case 'new':
            await createNewTask();
            break;
        case 'list':
            listTasks(commandArgs, args['--status'], args['--category'], includeArchived);
            break;
        case 'move':
            await moveTaskInteractive(commandArgs, args['--status'], args['--category']);
            break;
        case 'delete':
            await deleteTaskInteractive(commandArgs, args['--status'], args['--category']);
            break;
        case 'config':
            await configureInteractive();
            break;
        case 'view':
            await viewTaskInteractive(commandArgs, args['--status'], args['--category'], includeArchived);
            break;
        case 'search':
            await searchTaskInteractive(commandArgs, args['--status'], args['--category'], includeArchived);
            break;
        case 'clean-done':
            await require('./cli/commands/clean-done')();
            break;
        case 'help':
        default:
            showHelp();
            break;
    }
}

main();
