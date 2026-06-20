// src/main/services/pii.js
const crypto = require('crypto');

class PiiService {
    /**
     * @param {string} secretKey - A chave secreta usada para o HMAC (deve vir de variáveis de ambiente)
     */
    constructor(secretKey) {
        if (!secretKey) {
            throw new Error('A chave secreta HMAC é obrigatória.');
        }
        this.secretKey = secretKey;
        // Tabela em memória para o mapeamento reverso.
        // Em produção, use um banco de dados KV como o Redis com TTL (tempo de vida).
        this.vault = new Map();
    }

    /**
     * Gera o token HMAC para uma entidade PII
     * @param {string} entityType - Ex: 'PERSON', 'CPF', 'EMAIL'
     * @param {string} value - O dado sensível original (ex: 'William')
     * @returns {string} Token formatado (ex: '[PERSON:8f3b2a4c]')
     */
    generateHmacToken(entityType, value) {
        const cleanValue = value.trim();
        // Computa o hash HMAC-SHA256 e pega os primeiros 12 caracteres para melhor legibilidade no LLM
        const hash = crypto
            .createHmac('sha256', this.secretKey)
            .update(cleanValue)
            .digest('hex')
            .slice(0, 12);

        const token = `[${entityType.toUpperCase()}:${hash}]`;

        // Salva a relação reversa no vault
        this.vault.set(token, cleanValue);

        return token;
    }

    /**
     * Exemplo de mascaramento de texto usando expressões regulares
     * @param {string} text - O texto original que entra no RAG
     * @returns {string} Texto mascarado
     */
    maskText(text) {
        let maskedText = text;

        // 1. Exemplo de máscara para CPF (Regex simples)
        const cpfRegex = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g;
        maskedText = maskedText.replace(cpfRegex, (match) => {
            return this.generateHmacToken('CPF', match);
        });

        // 2. Exemplo de máscara para E-mail
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        maskedText = maskedText.replace(emailRegex, (match) => {
            return this.generateHmacToken('EMAIL', match);
        });

        return maskedText;
    }

    /**
     * Restaura os valores originais da resposta do LLM baseando-se no vault
     * @param {string} responseText - O texto gerado pelo LLM contendo os tokens HMAC
     * @returns {string} Texto restaurado com os dados originais
     */
    restoreText(responseText) {
        let restoredText = responseText;

        // Procura por padrões como [TIPO:hash] no texto de resposta
        const tokenRegex = /\[[A-Z_]+:[a-f0-9]{12}\]/g;

        restoredText = restoredText.replace(tokenRegex, (token) => {
            if (this.vault.has(token)) {
                return this.vault.get(token);
            }
            return token; // Se não encontrar, mantém o token (segurança)
        });

        return restoredText;
    }
}

module.exports = PiiService;
