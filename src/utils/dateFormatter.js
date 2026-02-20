function parseDate(input, language) {
    if (!input) return '';

    const cleanInput = input.replace(/[\.\-]/g, '/');
    const parts = cleanInput.split('/');

    if (parts.length !== 3) return input;

    let day, month, year;

    if (language === 'pt-BR') {
        day = parts[0];
        month = parts[1];
        year = parts[2];
    } else {
        month = parts[0];
        day = parts[1];
        year = parts[2];
    }

    // Smart fallback if someone typed day where month goes (e.g > 12)
    if (parseInt(month) > 12 && parseInt(day) <= 12) {
        let temp = day;
        day = month;
        month = temp;
    }

    day = day.padStart(2, '0');
    month = month.padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatDate(isoDate, language) {
    if (!isoDate) return '';

    // isoDate is YYYY-MM-DD
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;

    let [year, month, day] = parts;

    // Fix corrupted ISOs on the fly gracefully
    if (parseInt(month) > 12 && parseInt(day) <= 12) {
        let temp = day;
        day = month;
        month = temp;
    }

    if (language === 'pt-BR') {
        return `${day}/${month}/${year}`;
    } else {
        return `${month}/${day}/${year}`;
    }
}

function getDeadlineStatus(deadlineIsoString) {
    if (!deadlineIsoString) return { color: 'gray', isFuture: true, isToday: false, isOverdue: false };

    // deadlineIsoString is YYYY-MM-DD
    const deadlineParts = deadlineIsoString.split('-');
    if (deadlineParts.length !== 3) return { color: 'gray', isFuture: true, isToday: false, isOverdue: false };

    const deadlineDate = new Date(
        parseInt(deadlineParts[0]),
        parseInt(deadlineParts[1]) - 1,
        parseInt(deadlineParts[2])
    );

    const matchDate = new Date();
    const todayDate = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());

    const diffTime = deadlineDate.getTime() - todayDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { color: 'red', isOverdue: true, isToday: false, isFuture: false };
    } else if (diffDays === 0) {
        return { color: 'yellow', isToday: true, isOverdue: false, isFuture: false };
    } else {
        return { color: 'gray', isFuture: true, isToday: false, isOverdue: false };
    }
}

module.exports = {
    parseDate,
    formatDate,
    getDeadlineStatus
};
