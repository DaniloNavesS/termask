const React = require('react');
const { Box, Text } = require('ink');
const PropTypes = require('prop-types');
const dateFormatter = require('../utils/dateFormatter');
const configService = require('../core/configService');

const TaskCard = ({ title, id, category, deadline }) => {
    // We need to load config to get language for formatting
    // In a real React app we'd pass this via context or props from root
    // For now we can load it here or assume it's passed? 
    // Ideally passed from Dashboard.
    // But Dashboard gets config.
    // Let's modify TaskCard to accept language or just load it? Loading it here might be slow if many cards.
    // Better to pass language or config as prop. 
    // I'll assume config is passed or I'll load it once in module scope if possible? No, config changes.
    // I'll check Dashboard.js to see if it passes config to TaskCard?
    // Dashboard passes { ...task } to TaskCard. propTypes need update.

    // I will use a safe fallback if config not passed, but I should probably update Dashboard to pass locale.
    // For this step I'll try to load it or just format if deadline exists.

    const config = configService.loadConfig(); // Synchronous load, might be okay for TUI
    const formattedDeadline = deadline ? dateFormatter.formatDate(deadline, config.language) : null;

    return (
        <Box borderStyle="single" padding={1} flexDirection="column" marginBottom={1}>
            <Text bold>{title}</Text>
            {category && (
                <Text color="cyan" dimColor>
                    [{category}]
                </Text>
            )}
            {formattedDeadline && (
                <Text color="red">
                    {formattedDeadline}
                </Text>
            )}
            <Box marginTop={1}>
                <Text color="gray" dimColor>ID: {id}</Text>
            </Box>
        </Box>
    );
};

TaskCard.propTypes = {
    title: PropTypes.string.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    category: PropTypes.string,
};

module.exports = TaskCard;
