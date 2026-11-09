# ADR-006 — Processamento de imagens dentro da API

## Status
Aceita para o contexto acadêmico.

## Contexto
Usuários, restaurantes e pratos precisam aceitar imagens, mas arquivos grandes prejudicam transferência e consumo de dados. O projeto tem baixo volume inicial e já possui um servidor Node.js.

## Alternativas consideradas
1. Processar dentro da API com Multer e Sharp.
2. Criar um serviço independente de imagens.
3. Utilizar Serverless/FaaS com armazenamento externo e eventos.

## Decisão
Manter o processamento dentro da API EasyFood e reutilizar `modules/shared/image.service.js` nos módulos de autenticação, restaurantes e pratos. O Multer recebe JPEG, PNG ou WebP em memória, com limite de 5 MB. O Sharp confere o conteúdo real, corrige orientação, limita a largura a 800 px, converte para WebP com qualidade 80 e salva em `uploads/profiles/`, `uploads/restaurants/` ou `uploads/dishes/`. O caminho público correspondente é persistido em `User.imageUrl`, `Restaurant.imageUrl` ou `Dish.imageUrl`.

## Justificativa
Um serviço compartilhado evita duplicar validação, redimensionamento, conversão e limpeza de arquivos. Controllers continuam responsáveis por HTTP e services por regras de negócio e persistência. A solução mantém baixa a complexidade sem acoplar o processamento às rotas.

## Consequências
### Vantagens
- Menor complexidade inicial e fácil implementação/teste.
- Componente reutilizável em `modules/shared`.
- Arquivos são organizados por finalidade e não são versionados.
- Erros de processamento não deixam caminhos inconsistentes no banco.

### Limitações e trade-offs
- O processamento consome CPU e memória da API.
- Armazenamento local não é partilhado entre múltiplas instâncias.
- Em produção, seria necessário considerar S3 ou serviço equivalente, filas e validações de segurança mais fortes.
- A decisão deve ser reavaliada se o volume ou a disponibilidade exigidos crescerem.
