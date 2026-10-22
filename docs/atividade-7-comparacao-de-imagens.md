# Atividade 7 — Comparação de imagens

A suíte `npm test` gera uma imagem PNG sintética, passa o buffer pelo mesmo serviço Sharp usado pela API e imprime os tamanhos medidos. A versão processada deve ser WebP, ter largura máxima de 800 px e manter a proporção sem ampliar imagens pequenas.

## Como reproduzir

```bash
npm install
npm test
```

O resultado pode variar ligeiramente conforme a versão do Sharp/libvips e o conteúdo da imagem. Nesta execução, o teste mediu:

- Imagem original: PNG, 1200 × 900 px, 3.246.714 bytes.
- Imagem otimizada: WebP, 800 × 600 px, 262.066 bytes.
- Redução medida: aproximadamente 91,93%.

## Respostas

1. A imagem otimizada tende a ficar menor, mas isso depende do formato, conteúdo e compressibilidade da entrada.
2. A transformação aplica orientação EXIF, redimensiona para no máximo 800 px de largura, preserva a proporção e converte para WebP com qualidade 80.
3. Um arquivo menor reduz o tempo de transferência e o consumo de dados, principalmente em redes móveis.
4. O arquivo não ficará sempre menor: algumas entradas já comprimidas podem gerar resultado semelhante ou maior.
