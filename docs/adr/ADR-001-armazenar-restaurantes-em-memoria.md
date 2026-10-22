# ADR-001 — Armazenar restaurantes em memória

## Status
Aceita para a fase inicial de prototipação.

## Data
20/08/2026

## Responsável
Equipe EasyFood

## Contexto
A primeira versão da API precisava consultar restaurantes e cadastrar novos registros. O produto ainda estava em prototipação, teste e validação, e a prioridade era confirmar rapidamente o fluxo da aplicação antes de introduzir infraestrutura adicional.

## Alternativas consideradas
1. Array em memória.
2. PostgreSQL.
3. MongoDB.
4. SQLite.
5. Firebase.
6. Arquivo JSON.

## Decisão
Adotar um array em memória como mecanismo de armazenamento da versão inicial do serviço.

## Justificativa
- Permite desenvolvimento e testes rápidos.
- Tem baixa complexidade operacional.
- Não exige configurar infraestrutura externa.
- Não cria custo adicional durante a validação do conceito.

## Consequências
### Positivas
- Menor tempo para disponibilizar `GET /restaurants` e `POST /restaurants`.
- Facilidade para demonstrar o fluxo inicial.
- Código simples para a primeira aula.

### Negativas
- Os dados desaparecem quando o processo Node.js reinicia.
- Não há integridade ou consultas relacionais.
- A solução não atende múltiplas instâncias com estado compartilhado.
- Não é adequada para produção.

## Critérios de revisão
A decisão deve ser reavaliada quando o MVP for validado, houver necessidade de persistência entre deploys, surgirem relacionamentos ou o volume de dados deixar de ser razoável para memória.

## Nota
A limitação observada nesta atividade motivou a ADR-002 e a migração para PostgreSQL com Prisma.
