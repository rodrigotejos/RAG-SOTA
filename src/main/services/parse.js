// src/main/services/parse.js
// @ts-check

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const { LlamaCloud } = require('@llamaindex/llama-cloud');
const { salvarArquivo } = require('./fileSave');

const fs = require('fs'); // Usado para criar a stream de leitura do arquivo
const fsPromises = require('fs/promises');
const path = require('path');

/**
 * Converte um documento local (PDF, DOCX) em Markdown usando LlamaParse.
 * 
 * @param {string} caminhoDocumento - Caminho para o arquivo que será parseado
 * @returns {Promise<string>} O conteúdo do documento convertido em Markdown
 */
async function parseParaMarkdown(caminhoDocumento) {
    const client = new LlamaCloud();
    // O construtor busca automaticamente a chave de API na variável de ambiente 'LLAMA_CLOUD_API_KEY'

    //descobriar a lingauem pelo franc
    const { franc } = await import('franc-min');
    const textoDocumento = await fsPromises.readFile(caminhoDocumento, 'utf-8');
    const lingauem = franc(textoDocumento);
    console.log('Lingauem:', lingauem);

    const resultado = await client.parsing.parse({
        tier: 'cost_effective', // Tiers disponíveis: 'fast', 'cost_effective', 'agentic'
        version: 'latest',
        upload_file: fs.createReadStream(caminhoDocumento), // Envia o arquivo como Stream
        expand: ['markdown'], // Pede para retornar o markdown estruturado
        agentic_options: {
            custom_prompt: "Ignore headers e footers das páginas. Foque em manter tabelas em formato Markdown correto."
        }
    });
    //const mark = resultado?.markdown?.pages[0]
    //console.log(mark);

    // Pega o markdown completo do resultado
    // Junta o markdown de todas as páginas retornado no array
    const markdownCompleto = resultado?.markdown?.pages
        .map(p => p.markdown)
        .join('\n\n') || "";

    console.log(markdownCompleto);

    salvarArquivo(markdownCompleto, 'markdown.md');
    return markdownCompleto;

}

module.exports = {
    parseParaMarkdown
};
