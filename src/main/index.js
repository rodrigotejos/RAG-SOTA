// src/main/index.js
// @ts-check
const { parseParaMarkdown } = require('./services/parse');

/**
 * @typedef {'PARSE' | 'PII' | 'CHUNKING' | 'EMBEDDING' | 'VECTOR_DB' | 'LLM_EMBEDDINGS' | 'VECTOR_RETRIEVER' | 'RE_RANKER' | 'LLM_CONTEXT'} PassoRAG
 */

/**
 * Orquestrador para debug do RAG.
 * 
 * @param {PassoRAG} testeSet - A etapa específica do pipeline do RAG que será testada
 */
async function orquestradorDebug(testeSet) {
    console.log(`Iniciando orquestrador na etapa: ${testeSet}`);
    switch (testeSet) {
        case 'PARSE':
            console.log(' teste parse');
            await parseParaMarkdown(process.argv[3]);
            break;
        case 'PII':
            console.log(' teste pii');
            break;
        case 'CHUNKING':
            console.log(' teste chunking');
            break;
        case 'EMBEDDING':
            console.log(' teste embedding');
            break;
        case 'VECTOR_DB':
            console.log(' teste vector db');
            break;
        case 'LLM_EMBEDDINGS':
            console.log(' teste llm embeddings');
            break;
        case 'VECTOR_RETRIEVER':
            console.log(' teste vector retriever');
            break;
        case 'RE_RANKER':
            console.log(' teste re ranker');
            break;
        case 'LLM_CONTEXT':
            console.log(' teste llm context');
            break;
        default:
            console.log('Etapa não reconhecida');
    }
}

async function iniciar() {
    console.log("Iniciando serviço de RAG...");
}

(async () => {
    //iniciar();
    const etapa = /** @type {PassoRAG} */ (process.argv[2]?.toUpperCase() || 'PARSE');
    await orquestradorDebug(etapa);
})()