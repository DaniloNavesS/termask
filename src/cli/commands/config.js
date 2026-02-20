const { intro, select, isCancel, cancel, text } = require('@clack/prompts');
const chalk = require('chalk');
const configService = require('../../core/configService');
const i18n = require('../../utils/i18n');

async function configureInteractive() {
    i18n.loadLanguage();
    intro(chalk.inverse(i18n.t('configTitle')));

    const action = await select({
        message: i18n.t('configActionPrompt'),
        options: [
            { value: 'add_category', label: i18n.t('configActionAddCat') },
            { value: 'exit', label: i18n.t('configActionExit') }
        ],
    });

    if (isCancel(action) || action === 'exit') {
        cancel(i18n.t('opCancelled'));
        process.exit(0);
    }

    if (action === 'add_category') {
        const newCategory = await text({
            message: i18n.t('configAddCatPrompt'),
            validate(value) {
                if (value.length === 0) return i18n.t('valRequired');
            },
        });

        if (isCancel(newCategory)) {
            cancel(i18n.t('opCancelled'));
            process.exit(0);
        }

        const formattedCategory = newCategory.toLowerCase().trim();

        try {
            const currentConfig = configService.loadConfig();
            if (!currentConfig.categories) {
                currentConfig.categories = [];
            }

            if (currentConfig.categories.some(c => c.id === formattedCategory)) {
                console.log(chalk.yellow(i18n.t('configAddCatExists', { category: formattedCategory })));
                process.exit(0);
            }

            const colorOptions = [
                { value: 'gray', label: chalk.gray('Gray/Cinza') },
                { value: 'red', label: chalk.red('Red/Vermelho') },
                { value: 'green', label: chalk.green('Green/Verde') },
                { value: 'yellow', label: chalk.yellow('Yellow/Amarelo') },
                { value: 'blue', label: chalk.blue('Blue/Azul') },
                { value: 'magenta', label: chalk.magenta('Magenta/Rosa') },
                { value: 'cyan', label: chalk.cyan('Cyan/Ciano') },
                { value: 'white', label: chalk.white('White/Branco') }
            ];

            const selectedColor = await select({
                message: 'Qual a cor desta categoria? / What is the color of this category?',
                options: colorOptions,
            });

            if (isCancel(selectedColor)) {
                cancel(i18n.t('opCancelled'));
                process.exit(0);
            }

            currentConfig.categories.push({
                id: formattedCategory,
                label: newCategory.trim(), // Keep original casing for label
                color: selectedColor
            });
            configService.saveConfig(currentConfig);

            console.log(chalk.green(i18n.t('configAddCatSuccess', { category: formattedCategory })));

        } catch (err) {
            console.error(chalk.red(i18n.t('errorGeneric')), err);
        }
    }
}

module.exports = configureInteractive;
