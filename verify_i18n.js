const i18n = require('./src/utils/i18n');
const dateFormatter = require('./src/utils/dateFormatter');

i18n.loadLanguage();
console.log('Current Language:', i18n.getLanguage());
console.log('Translated greeting:', i18n.t('setupIntro'));

// Date Formatting
const isoDate = '2023-12-31';
console.log('Formatted Date (US):', dateFormatter.formatDate(isoDate, 'en-US'));
console.log('Formatted Date (BR):', dateFormatter.formatDate(isoDate, 'pt-BR'));
