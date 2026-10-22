# ADR-002 — Persistência com PostgreSQL e Prisma

## Status
Aceita.

## Data
22/08/2026

## Contexto
O array em memória permitia validar o protótipo, mas fazia os restaurantes desaparecerem a cada reinicialização. A EasyFood passou a precisar de persistência, integridade referencial e uma base para relacionar restaurantes, utilizadores e pratos.

## Alternativas consideradas
- **PostgreSQL:** banco relacional open source, ACID e forte suporte a relacionamentos.
- **MySQL:** alternativa relacional madura e amplamente utilizada.
- **MongoDB:** flexível, mas menos alinhado ao relacionamento entre restaurantes e pratos.
- **SQLite:** simples para desenvolvimento, mas limitado para múltiplas instâncias.
- **Firebase:** reduz a gestão de infraestrutura, mas cria maior dependência de um fornecedor.

## Decisão
Adotar PostgreSQL como banco persistente e Prisma como ORM e ferramenta de migrations.

## Justificativa
PostgreSQL oferece transações, chaves estrangeiras, índices e consultas relacionais adequadas ao domínio. Prisma centraliza o schema, gera o cliente tipado e versiona a evolução do banco. A combinação mantém a API simples, mas permite crescer para cardápios, pedidos e outros relacionamentos.

## Consequências positivas
- Dados sobrevivem a reinicializações.
- Integridade entre `Restaurant` e `Dish`.
- Migrations reproduzíveis em diferentes ambientes.
- Consultas, índices e transações disponíveis.
- Separação clara entre API e persistência.

## Consequências negativas e trade-offs
- É necessário instalar, configurar e operar um servidor PostgreSQL.
- O ambiente passa a depender de `DATABASE_URL` e migrations.
- Prisma adiciona uma camada e exige regenerar o client quando o schema muda.
- Indisponibilidade do banco afeta as rotas que dependem dele.

## Critérios de revisão
Reavaliar a decisão se a escala exigir réplicas, particionamento, cache complementar, armazenamento especializado ou uma estratégia de persistência diferente.
