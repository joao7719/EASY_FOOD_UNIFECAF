# ADR-004 — Autenticação com JWT

## Status
Aceita para a API acadêmica.

## Contexto
O cadastro de restaurantes e pratos altera dados e não deve ficar disponível sem identificação. A solução precisava ser pequena, adequada ao monólito atual e fácil de testar com Postman.

## Alternativas consideradas
- JWT emitido pela própria API.
- AWS Cognito ou outro Identity Provider.
- Login social com Google.

## Decisão
Implementar cadastro e login locais com senha protegida por `bcryptjs`, emitir JWT com validade de um dia e exigir `Authorization: Bearer <token>` nas operações de escrita.

## Justificativa
JWT não exige sessão armazenada no servidor e encaixa no fluxo de uma API REST pequena. O segredo permanece em `JWT_SECRET`, e a senha nunca é devolvida nem armazenada em texto puro.

## Consequências
### Positivas
- Fluxo simples de integrar a clientes HTTP.
- Rotas públicas e protegidas ficam explícitas.
- A autenticação é reutilizável pelos módulos de restaurantes e pratos.

### Trade-offs
- Revogar tokens antes do vencimento exige uma estratégia adicional.
- JWT comprova identidade, mas não implementa autorização por proprietário ou papel.
- Produção exigiria rotação segura de segredos, rate limiting e políticas adicionais.
