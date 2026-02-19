function parseDate(input, language) {
    if (!input) return '';

    // Normalize separator
    const cleanInput = input.replace(/[\.\-]/g, '/');
    const parts = cleanInput.split('/');

    if (parts.length !== 3) return input; // Return original if can't parse

    let day, month, year;

    if (language === 'pt-BR') {
        // DD/MM/YYYY
        day = parts[0];
        month = parts[1];
        year = parts[2];
    } else {
        // MM/DD/YYYY (en-US default)
        month = parts[0];
        day = parts[1];
        year = parts[2];
    }

    // Pad with zeros if needed
    day = day.padStart(2, '0');
    month = month.padStart(2, '0');

    // Basic Validation could go here

    return `${year}-${month}-${day}`;
}

function formatDate(isoDate, language) {
    if (!isoDate) return '';

    // isoDate is YYYY-MM-DD
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;

    const [year, month, day] = parts;

    if (language === 'pt-BR') {
        return `${day}/${month}/${year}`;
    } else {
        return `${month}/${day}/${year}`;
    }
}

module.exports = {
    parseDate,
    formatDate
};
