const React = require('react');
const { Box, Text } = require('ink');
const PropTypes = require('prop-types');
const TaskCard = require('./TaskCard');

const Column = ({ title, color, tasks }) => {
    return (
        <Box flexDirection="column" width="33%" padding={1}>
            <Box marginBottom={1}>
                <Text color={color} bold underline>
                    {title} ({tasks.length})
                </Text>
            </Box>
            <Box flexDirection="column">
                {tasks.map((task) => (
                    <TaskCard key={task.id} title={task.title} id={task.id} />
                ))}
                {tasks.length === 0 && (
                    <Text color="gray" italic>
                        No tasks
                    </Text>
                )}
            </Box>
        </Box>
    );
};

Column.propTypes = {
    title: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    tasks: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string.isRequired,
        })
    ).isRequired,
};

module.exports = Column;
