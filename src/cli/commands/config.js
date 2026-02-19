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

            if (currentConfig.categories.includes(formattedCategory)) {
                console.log(chalk.yellow(i18n.t('configAddCatExists', { category: formattedCategory })));
                process.exit(0);
            }

            currentConfig.categories.push(formattedCategory);
            configService.saveConfig(currentConfig);

            console.log(chalk.green(i18n.t('configAddCatSuccess', { category: formattedCategory })));

        } catch (err) {
            console.error(chalk.red(i18n.t('errorGeneric')), err);
        }
    }
}

module.exports = configureInteractive;
