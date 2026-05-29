// Silencia logs estruturados durante os testes (mantém a saída limpa).
// Pode ser sobrescrito exportando LOG_LEVEL antes de rodar o Jest.
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'silent';
