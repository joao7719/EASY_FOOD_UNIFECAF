# ADR-006 — Processamento de imagens dentro da API

## Status
Aceita para o contexto acadêmico.

## Contexto
Os pratos precisam aceitar imagens, mas arquivos grandes prejudicam transferência e consumo de dados. O projeto tem baixo volume inicial e já possui um servidor Node.js.

## Alternativas consideradas
1. Processar dentro da API com Multer e Sharp.
2. Criar um serviço independente de imagens.
3. Utilizar Serverless/FaaS com armazenamento externo e eventos.

## Decisão
Manter o processamento dentro da API EasyFood. O Multer recebe JPEG, PNG ou WebP em memória, com limite de 5 MB. O Sharp corrige a orientação, limita a largura a 800 px, converte para WebP com qualidade 80 e salva em `uploads/dishes/`. O caminho é gravado em `Dish.imageUrl`.

## Justificativa
A solução é simples, reutiliza a infraestrutura existente e atende ao baixo volume do contexto acadêmico. Não exige microsserviços, filas ou configuração adicional.

## Consequências
### Vantagens
- Menor complexidade inicial.
- Fácil implementação e teste.
- Responsabilidade reutilizável em `modules/shared`.

### Limitações e trade-offs
- O processamento consome CPU e memória da API.
- Armazenamento local não é partilhado entre múltiplas instâncias.
- Em produção, seria necessário considerar S3 ou serviço equivalente, filas e validações de segurança mais fortes.
- A decisão deve ser reavaliada se o volume ou a disponibilidade exigidos crescerem.
