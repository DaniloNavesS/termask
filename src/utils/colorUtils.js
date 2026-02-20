/**
 * Determina a cor ideal do texto (preto ou branco) 
 * com base na cor de fundo fornecida.
 * Exclusivamente projetado para a paleta de cores padrão do Ink/Chalk.
 * 
 * @param {string} backgroundColor - A cor de fundo (ex: 'red', 'cyan', 'blue').
 * @returns {string|undefined} - A cor do texto com melhor contraste ou undefined.
 */
function getContrastText(backgroundColor) {
    if (!backgroundColor) return undefined; // Herda a cor padrão do terminal

    const darkTextBackgrounds = ['yellow', 'cyan', 'white'];
    const lightTextBackgrounds = ['red', 'blue', 'green', 'magenta', 'gray', 'black'];

    if (darkTextBackgrounds.includes(backgroundColor)) {
        return 'black';
    } else if (lightTextBackgrounds.includes(backgroundColor)) {
        return 'white';
    }

    return undefined; // Corem sem match, preserva fallback nativo.
}

module.exports = {
    getContrastText
};
