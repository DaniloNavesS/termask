const viewTaskInteractive = require('./view');
const { text, isCancel, cancel } = require('@clack/prompts');

async function searchTaskInteractive(args, statusFilter, categoryFilter, includeArchived) {
    // If no args (term), prompt for it
    if (!args || args.length === 0) {
        const term = await text({
            message: 'Enter search term:',
            validate(value) {
                if (value.length === 0) return 'Search term is required!';
            },
        });

        if (isCancel(term)) {
            cancel('Operation cancelled.');
            process.exit(0);
        }

        args = [term];
    }

    // Call view with the args
    await viewTaskInteractive(args, statusFilter, categoryFilter, includeArchived);
}

module.exports = searchTaskInteractive;
