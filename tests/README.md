# Testes

- **Testes unitários** ficam colocados ao lado do código em `src/server/**` (arquivos `*.test.js`).
  Cobrem domínio, value objects e use-cases de forma isolada (sem rede/DB).
- **Testes de integração** ficam aqui em `tests/integration/**`.
  Exercitam os route handlers do Next e a infraestrutura (providers, repositórios)
  com dependências injetadas/mockadas ou contra um banco de teste.
