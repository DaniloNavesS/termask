const React = require('react');
const { Box, Text } = require('ink');
const PropTypes = require('prop-types');

const TaskCard = ({ title, id, category }) => {
    return (
        <Box borderStyle="single" padding={1} flexDirection="column" marginBottom={1}>
            <Text bold>{title}</Text>
            {category && (
                <Text color="blue" dimColor>
                    Category: {category}
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
