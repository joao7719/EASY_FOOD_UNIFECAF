# ADR-005 — Serviço partilhado de e-mail via Resend

## Status
Aceita para a atividade.

## Contexto
O cadastro de restaurante passou a disparar notificações. A lógica de envio não deveria ficar dentro do controller nem depender de uma biblioteca específica em cada módulo.

## Decisão
Criar `src/modules/shared/email.service.js` com a função genérica `sendEmail({ to, toName, subject, header, body, footer })`. A implementação chama a API HTTP do Resend quando `EMAIL_API_KEY` está configurada; sem a chave, funciona em modo simulado para desenvolvimento e testes.

## Justificativa
A função compartilhada permite reutilizar o mesmo contrato em notificações diferentes e isola o fornecedor externo. O segredo, o remetente e o destinatário ficam no `.env`, nunca no código ou no repositório.

## Consequências
- O cadastro do restaurante é persistido antes do envio.
- Falhas no e-mail são capturadas e não anulam a operação principal.
- O projeto ganha uma dependência externa opcional e precisa de remetente verificado em produção.
- Se o volume de mensagens crescer, será necessário avaliar fila e processamento assíncrono.
