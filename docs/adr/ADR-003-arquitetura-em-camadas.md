# ADR-003 — Arquitetura em camadas e monólito modular

## Status
Aceita.

## Contexto
Concentrar Express, rotas, validações, Prisma e inicialização em `server.js` dificultava a manutenção e o crescimento da API. A aplicação precisava continuar sendo um monólito simples, mas com responsabilidades separadas.

## Decisão
Organizar a EasyFood nas camadas `database`, `service`, `controller` e `routes`, agrupadas por módulo de domínio. `server.js` inicia o servidor; `app.js` configura middlewares e conecta os módulos.

## Responsabilidades
- `database/prisma.js`: disponibiliza uma única instância do Prisma.
- `service`: regras de negócio e operações de persistência, sem depender de `req` ou `res`.
- `controller`: valida entrada HTTP, chama o service e constrói a resposta.
- `routes`: declara caminhos e middlewares.
- `app.js`: compõe middlewares e módulos.

## Justificativa
A separação reduz acoplamento, facilita testes e permite adicionar `auth`, `dishes` e serviços compartilhados sem transformar um único arquivo em ponto de concentração.

## Consequências
A estrutura aumenta o número de ficheiros e exige disciplina de imports, mas melhora a legibilidade, a testabilidade e a evolução do monólito.

## Critérios de revisão
Reavaliar quando os módulos crescerem a ponto de exigir bounded contexts separados, filas, serviços independentes ou outra fronteira arquitetural.
