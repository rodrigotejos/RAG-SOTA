

async function salvarArquivo(conteudo, nomeArquivo) {
    const fs = require('fs');
    const path = require('path');
    const caminhoArquivo = path.join(__dirname, nomeArquivo);
    fs.writeFileSync(caminhoArquivo, conteudo);
    console.log(`Arquivo ${nomeArquivo} salvo com sucesso em ${caminhoArquivo}`);
}

module.exports = {
    salvarArquivo
};