const React = require('react');
const { Box, Text } = require('ink');
const PropTypes = require('prop-types');
const dateFormatter = require('../utils/dateFormatter');
const configService = require('../core/configService');
const { getContrastText } = require('../utils/colorUtils');

const TaskCard = ({ title, id, category, priority, deadline, categories = [], priorities = [] }) => {
    // We need to load config to get language for formatting
    const config = configService.loadConfig(); // Synchronous load
    const formattedDeadline = deadline ? dateFormatter.formatDate(deadline, config.language) : null;
    const deadlineStatus = dateFormatter.getDeadlineStatus(deadline);

    // Resolve Category Styling
    const categoryObj = categories.find(c => c.id === category);
    const categoryColor = categoryObj?.color || 'gray';
    const categoryLabel = categoryObj?.label || (category ? category.charAt(0).toUpperCase() + category.slice(1) : '');

    // Resolve Priority Styling
    const priorityObj = priorities.find(p => p.id === priority);
    const priorityColor = priorityObj?.color || 'gray';
    const priorityLabel = priorityObj?.label || (priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : '');

    return (
        <Box borderStyle="round" borderColor={categoryColor} dimColor={true} paddingX={1} paddingY={0} flexDirection="column" marginBottom={1}>
            <Box flexDirection="row" width="100%">
                {category && (
                    <Box marginRight={1} flexShrink={0}>
                        <Text backgroundColor={categoryColor} color={getContrastText(categoryColor)}>
                            {' '}{categoryLabel}{' '}
                        </Text>
                    </Box>
                )}
                <Box flexShrink={1}>
                    <Text bold wrap="truncate-end">{title}</Text>
                </Box>
            </Box>

            {(priorityLabel || formattedDeadline) && (
                <Box flexDirection="row" justifyContent="space-between" marginTop={1}>
                    <Box marginRight={1}>
                        {priorityLabel && (
                            <Text color={priorityColor}>{priorityLabel}</Text>
                        )}
                    </Box>
                    <Box flexShrink={1}>
                        {formattedDeadline && (
                            <Text color={deadlineStatus.color}>★ {formattedDeadline}</Text>
                        )}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

TaskCard.propTypes = {
    title: PropTypes.string.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    category: PropTypes.string,
};

module.exports = TaskCard;
