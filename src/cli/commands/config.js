const { intro, select, isCancel, cancel, text } = require('@clack/prompts');
const chalk = require('chalk');
const configService = require('../../core/configService');

async function configureInteractive() {
    intro(chalk.inverse(' Configuration '));

    const action = await select({
        message: 'What do you want to configure?',
        options: [
            { value: 'add_category', label: 'Add new category' },
            { value: 'exit', label: 'Exit' }
        ],
    });

    if (isCancel(action) || action === 'exit') {
        cancel('Exiting configuration.');
        process.exit(0);
    }

    if (action === 'add_category') {
        const newCategory = await text({
            message: 'What is the name of the new category?',
            validate(value) {
                if (value.length === 0) return 'Category name is required!';
            },
        });

        if (isCancel(newCategory)) {
            cancel('Operation cancelled.');
            process.exit(0);
        }

        const formattedCategory = newCategory.toLowerCase().trim();

        try {
            const currentConfig = configService.loadConfig();
            if (!currentConfig.categories) {
                currentConfig.categories = [];
            }

            if (currentConfig.categories.includes(formattedCategory)) {
                console.log(chalk.yellow(`\nCategory '${formattedCategory}' already exists.`));
                process.exit(0);
            }

            currentConfig.categories.push(formattedCategory);
            configService.saveConfig(currentConfig);

            console.log(chalk.green(`\nCategory '${formattedCategory}' added successfully!`));

        } catch (err) {
            console.error(chalk.red('Error updating configuration:'), err);
        }
    }
}

module.exports = configureInteractive;
