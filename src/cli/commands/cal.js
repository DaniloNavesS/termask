const React = require('react');
const { render, Box, Text } = require('ink');
const Calendar = require('../../ui/Calendar');
const taskService = require('../../core/taskService');
const configService = require('../../core/configService');

async function viewCalendar(args, statusFilter, categoryFilter, includeArchived) {
    const config = configService.loadConfig(); // For language & colors

    // Obter array filtrado
    let tasks = taskService.getFilteredTasks(statusFilter, categoryFilter, '');

    // Remover arquivadas
    if (!includeArchived) {
        tasks = tasks.filter(t => t.status !== 'arquivado' && t.status !== 'archived');
    }

    // Processamento custom do plano
    const tasksByDate = taskService.getTasksByDeadline(tasks);

    // Bootstrap TUI mode
    const { unmount } = render(
        <Box flexDirection="column" paddingX={2} paddingY={1}>
            <Text bold color="cyan" marginBottom={1}>
                {' '}{config.language === 'pt-BR' ? '🗓️  Visão de Calendário Mensal' : '🗓️  Monthly Calendar View'}{' '}
            </Text>

            <Calendar
                tasksByDate={tasksByDate}
                language={config.language}
                configPriorities={config.priorities || []}
            />
        </Box>
    );

    // Terminar processo limpamente apos pintar caso ink nao segure block prompt
    // Wait for internal ink loop if we ever add interactivity
    // (A UI Estática se printa e finaliza no terminal igual cat/ls)
}

module.exports = viewCalendar;
