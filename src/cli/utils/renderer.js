const { marked } = require('marked');
const TerminalRenderer = require('marked-terminal').default;
const chalk = require('chalk');
const matter = require('gray-matter');

marked.setOptions({
    renderer: new TerminalRenderer()
});

function renderTask(content) {
    const parsed = matter(content);

    if (!parsed.content || parsed.content.trim().length === 0) {
        console.log(chalk.italic.gray('\n   (No description provided for this task)\n'));
    } else {
        console.log('\n' + chalk.dim('─'.repeat(50)) + '\n');
        console.log(marked(parsed.content));
        console.log(chalk.dim('─'.repeat(50)) + '\n');
    }
}

module.exports = { renderTask };
