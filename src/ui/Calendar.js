const React = require('react');
const { Box, Text } = require('ink');
const PropTypes = require('prop-types');
const { getContrastText } = require('../utils/colorUtils');

const DAYS_OF_WEEK = {
    'pt-BR': ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    'en-US': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
};

const Calendar = ({ tasksByDate, language = 'en-US', configPriorities = [] }) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexado

    // Obter numero de dias no mês
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Obter numero de dias no mes anterior
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    // Obter o dia da semana do primeiro dia do mês (0 = Dom, 6 = Sab)
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

    const headers = DAYS_OF_WEEK[language] || DAYS_OF_WEEK['en-US'];

    // Montar matriz do calendário (semanas/dias)
    const weeks = [];
    let currentWeek = [];

    // Preenchendo dias do mes anterior
    for (let i = 0; i < firstDayOfWeek; i++) {
        const prevDay = daysInPrevMonth - firstDayOfWeek + i + 1;
        currentWeek.push({ day: prevDay, type: 'prev', monthDist: -1 });
    }

    for (let day = 1; day <= daysInMonth; day++) {
        currentWeek.push({ day, type: 'current', monthDist: 0 });

        // Se a semana encheu (7 dias), empurramos ela e reiniciamos
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    // Preenchendo dias do prox mes
    if (currentWeek.length > 0) {
        let nextDay = 1;
        while (currentWeek.length < 7) {
            currentWeek.push({ day: nextDay++, type: 'next', monthDist: 1 });
        }
        weeks.push(currentWeek);
    }

    // Helper p/ pegar a cor da Tarefa de Maior Prioridade
    const getTaskPriorityColor = (priority) => {
        return configPriorities.find(p => p.id === priority)?.color || 'gray';
    };

    return (
        <Box flexDirection="column" width="100%">
            <Box justifyContent="center" marginBottom={1}>
                <Text bold>{`${currentMonth + 1}/${currentYear}`}</Text>
            </Box>

            <Box flexDirection="row" width="100%">
                {headers.map((h, i) => (
                    <Box key={i} flexBasis="14.2%" justifyContent="center" marginBottom={1}>
                        <Text bold color="cyan">{h}</Text>
                    </Box>
                ))}
            </Box>

            {weeks.map((week, weekIndex) => (
                <Box key={weekIndex} flexDirection="row" width="100%">
                    {week.map((dateObj, dayIndex) => {
                        let tempMonth = currentMonth + dateObj.monthDist;
                        let tempYear = currentYear;

                        if (tempMonth < 0) {
                            tempMonth = 11;
                            tempYear--;
                        } else if (tempMonth > 11) {
                            tempMonth = 0;
                            tempYear++;
                        }

                        // Formatar ISO String daquela data
                        const dateStr = `${tempYear}-${String(tempMonth + 1).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}`;

                        // Checar se a data tem Tasks associadas (Array)
                        const dayTasks = tasksByDate[dateStr] || [];
                        const taskCount = dayTasks.length;

                        // Verificar se eh hoje!
                        const isToday = dateObj.day === today.getDate() && tempMonth === today.getMonth() && tempYear === today.getFullYear();
                        const isDim = dateObj.type !== 'current';

                        const displayedTasks = dayTasks.slice(0, 3);
                        const overflow = taskCount - 3;

                        return (
                            <Box
                                key={`${weekIndex}-${dayIndex}`}
                                flexBasis="14.2%"
                                minHeight={5}
                                flexDirection="column"
                                borderStyle="single"
                                borderColor={isDim ? 'gray' : 'white'}
                                paddingX={1}
                            >
                                <Box marginBottom={1} justifyContent="flex-start">
                                    <Text
                                        color={isToday ? getContrastText('white') : (isDim ? 'gray' : undefined)}
                                        backgroundColor={isToday ? 'white' : undefined}
                                        bold={isToday}
                                    >
                                        {String(dateObj.day).padStart(2, '0')}
                                    </Text>
                                </Box>

                                <Box flexDirection="column" flexGrow={1}>
                                    {displayedTasks.map((t, idx) => {
                                        const pColor = getTaskPriorityColor(t.priority);
                                        return (
                                            <Box key={idx} width="100%">
                                                <Text wrap="truncate-end" color={isDim ? 'gray' : undefined}>
                                                    <Text color={pColor}>•</Text> {t.title}
                                                </Text>
                                            </Box>
                                        );
                                    })}

                                    {overflow > 0 && (
                                        <Box marginTop={0}>
                                            <Text dimColor={true} italic>+ {overflow} mais</Text>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            ))}
        </Box>
    );
};

Calendar.propTypes = {
    tasksByDate: PropTypes.object.isRequired,
    language: PropTypes.string,
    configPriorities: PropTypes.array
};

module.exports = Calendar;
