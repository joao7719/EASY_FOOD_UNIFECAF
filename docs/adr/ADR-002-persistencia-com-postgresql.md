# ADR-002 — Persistência com PostgreSQL

## Status
Aceita.

## Contexto
O array em memória fazia os restaurantes desaparecerem quando o servidor era reiniciado. A EasyFood passou a precisar de persistência entre execuções e de relacionamentos entre restaurantes, utilizadores e pratos.

## Alternativas consideradas
- PostgreSQL.
- MySQL.
- MongoDB.
- SQLite.
- Firebase.

## Decisão
Adotar PostgreSQL como banco persistente e Prisma como ORM e ferramenta de migrations.

## Justificativa
PostgreSQL oferece transações, integridade referencial, índices e consultas relacionais adequadas ao domínio. Prisma centraliza o schema, gera o cliente e mantém o histórico de migrations reproduzível.

## Consequências positivas
- Os dados sobrevivem a reinicializações.
- Relacionamentos entre `Restaurant`, `User` e `Dish` são representados por chaves estrangeiras.
- A evolução do banco fica versionada.
- O serviço mantém uma separação clara entre API e persistência.

## Consequências negativas e trade-offs
- É preciso operar um servidor PostgreSQL e configurar `DATABASE_URL`.
- A indisponibilidade do banco afeta as rotas que consultam ou alteram dados.
- Prisma adiciona uma camada de geração de client e migrations.
- Produção exigiria backup, monitorização e gestão de credenciais.

## Critérios de revisão
Reavaliar a escolha se a escala exigir particionamento, réplicas, cache, armazenamento especializado ou outra estratégia de persistência.

## Relação com a documentação
A versão expandida desta decisão está em `ADR-002-escolha-do-banco-de-dados.md`; os dois arquivos registram a mesma decisão solicitada nas etapas de persistência da EasyFood.
