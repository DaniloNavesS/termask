const React = require('react');
const { Box, Text } = require('ink');
const PropTypes = require('prop-types');
const Column = require('./Column');

const Dashboard = ({ tasks, config, filterStatus }) => {
    let statuses = config?.statuses || [];

    if (filterStatus) {
        statuses = statuses.filter((s) => s.id === filterStatus);
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Box marginBottom={1}>
                <Text bold>CLI Task Manager</Text>
            </Box>
            <Box flexDirection="row" justifyContent="flex-start" gap={2}>
                {statuses.map((status) => {
                    // Filter tasks for this status
                    const statusTasks = tasks.filter((t) => t.status === status.id);
                    return (
                        <Column
                            key={status.id}
                            title={status.label}
                            color={status.color}
                            tasks={statusTasks}
                        />
                    );
                })}
            </Box>
        </Box>
    );
};

Dashboard.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
    config: PropTypes.object.isRequired,
    filterStatus: PropTypes.string,
};

module.exports = Dashboard;
