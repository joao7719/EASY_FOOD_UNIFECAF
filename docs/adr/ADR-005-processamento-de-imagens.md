# ADR-005 — Processamento de imagens dentro da API EasyFood

- **Status:** Aceita
- **Data:** 22/10/2026

## Contexto

A EasyFood precisa permitir o envio de imagens para os pratos do cardápio. As imagens devem ser validadas, redimensionadas e convertidas antes de serem disponibilizadas, reduzindo o volume transferido ao navegador. O projeto está em contexto acadêmico e tem baixo volume inicial de imagens.

## Alternativas consideradas

1. **Processar dentro da API:** receber o arquivo na API, processá-lo com Sharp e guardar a versão otimizada em `uploads/dishes/`.
2. **Criar um serviço independente:** separar o processamento em outro serviço, com implantação e comunicação próprias.
3. **Utilizar Serverless/FaaS:** disparar uma função sob demanda para processar cada imagem, normalmente integrada a armazenamento externo e eventos/filas.

## Decisão

Manter o processamento dentro do servidor da API EasyFood. O Multer recebe o arquivo em memória, com limite de 5 MB e tipos MIME JPEG, PNG e WebP. O Sharp corrige a orientação, limita a largura a 800 pixels, converte para WebP com qualidade 80 e salva a saída localmente. O caminho é persistido no campo `Dish.imageUrl`.

## Justificativa

A solução mantém a simplicidade e a facilidade de implementação adequadas ao contexto acadêmico, aproveita a infraestrutura já existente e atende ao baixo volume inicial sem exigir serviços, filas ou infraestrutura adicionais. A escolha é contextual e não significa que Serverless/FaaS seja inadequado para outros cenários.

## Consequências

### Vantagens

- Menor complexidade inicial e menos componentes para configurar.
- Reutilização da infraestrutura e do processo de implantação atuais.
- Implementação e depuração diretas no monólito modular.

### Limitações

- O processamento consome CPU e memória da própria API e pode afetar outras requisições.
- O armazenamento local é apropriado para a atividade, mas não é compartilhado entre múltiplas instâncias e pode ser efêmero em algumas plataformas.
- Será necessário reavaliar a decisão quando o volume crescer ou os requisitos de disponibilidade e escalabilidade mudarem; armazenamento externo, serviço independente ou FaaS poderão então ser considerados.
