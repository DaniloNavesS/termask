const taskRepository = require('../data/taskRepository');
const matter = require('gray-matter');

function getFilteredTasks(statusFilter, categoryFilter, query) {
    let tasks = taskRepository.getAllTasks();

    // 1. Content Search (Query) - "Grep" behavior
    if (query) {
        const lowerQuery = query.toLowerCase();
        tasks = tasks.filter(t => t.rawContent.toLowerCase().includes(lowerQuery));
    }

    // 2. Metadata Filters
    if (statusFilter) {
        tasks = tasks.filter(t => t.status === statusFilter);
    }

    if (categoryFilter) {
        tasks = tasks.filter(t => t.category && t.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    // Sort logic (newest first)
    tasks.sort((a, b) => {
        if (a.filename < b.filename) return 1;
        if (a.filename > b.filename) return -1;
        return 0;
    });

    return tasks;
}

function generateTaskSlug(title) {
    let cleanTitle = title;
    if (!cleanTitle) {
        cleanTitle = 'untitled-task';
    }

    return cleanTitle
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

function buildFrontmatter(id, title, category, priority, deadline, status, description) {
    const data = {
        id: id || Date.now(),
        title: title,
        category: category,
        priority: priority || 'medium',
        deadline: deadline || '',
        status: status
    };

    let content = '\n# Descrição\n\n';
    if (description) {
        content += description;
    }

    return matter.stringify(content, data);
}

function getTasksByDeadline(tasks) {
    const tasksByDeadline = {};

    tasks.forEach(task => {
        if (!task.deadline) return;

        // Pega apenas a string completa (ex: '2026-02-19') da ISO se existir timestamp associado
        const deadlineDate = task.deadline.substring(0, 10);

        if (!tasksByDeadline[deadlineDate]) {
            tasksByDeadline[deadlineDate] = [];
        }

        tasksByDeadline[deadlineDate].push(task);
    });

    return tasksByDeadline;
}

module.exports = {
    getFilteredTasks,
    generateTaskSlug,
    buildFrontmatter,
    getTasksByDeadline
};
