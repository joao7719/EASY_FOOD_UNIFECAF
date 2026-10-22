# Atividade 7 — Comparação de imagens

A suíte `npm test` gera uma imagem PNG sintética de teste (1200 × 900 px), passa o buffer pelo mesmo serviço Sharp usado pela API e compara o arquivo resultante. Os tamanhos exatos são impressos durante a execução para que a comparação possa ser reproduzida no ambiente local.

- **Imagem original:** padrão sintético gerado pelo teste; PNG; 1200 × 900 px; **3.246.714 bytes**.
- **Imagem otimizada:** WebP; 800 × 600 px; qualidade 80; **262.066 bytes**.

Nesta execução, a versão otimizada ficou cerca de **91,93% menor** (aproximadamente 12,39 vezes menor). O teste automatizado imprime os tamanhos medidos quando executado novamente; versões de Sharp/libvips diferentes podem produzir pequenas variações.

A entrada de teste é sintética e serve para verificar o fluxo de processamento; a relação de compressão varia de acordo com o conteúdo da imagem original. Por isso, o resultado não representa uma garantia para fotografias reais.

## Respostas

1. **A imagem otimizada ficou menor?** Sim, nesta amostra: 3.246.714 bytes (PNG) contra 262.066 bytes (WebP), redução de aproximadamente 91,93%. Para outros arquivos, o resultado depende do conteúdo e da compressibilidade.
2. **Qual transformação foi realizada?** O serviço aplica a orientação EXIF quando existir, limita a largura a 800 px sem ampliar imagens menores, preserva a proporção e converte para WebP com qualidade 80.
3. **Por que isso pode melhorar a experiência?** Um arquivo menor normalmente reduz o tempo de transferência e o consumo de dados, especialmente em conexões móveis.
4. **O arquivo sempre ficará menor?** Não. Dependendo do formato original, do conteúdo e das configurações, a conversão poderá gerar um arquivo do mesmo tamanho ou maior.

Para reproduzir e ver os valores medidos:

```bash
npm test
```
