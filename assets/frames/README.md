# assets/frames — quadros dos clipes gerados (drop-in)

Coloque aqui os quadros extraídos dos clipes cinematográficos gerados, um subdiretório
por capítulo (o `id` usado no array `CHAPTERS` de `../../script.js`):

```
assets/frames/hero/0001.jpg  0002.jpg  ...
assets/frames/fluxo/0001.jpg 0002.jpg  ...
assets/frames/acolhimento/...
assets/frames/rigor/...
assets/frames/final/...
```

Exemplo de extração:

```bash
ffmpeg -i cap-fluxo.mp4 -vf fps=24 assets/frames/fluxo/%04d.jpg
```

Depois ajuste `frameCount` do capítulo correspondente em `script.js`.

Enquanto não houver quadros, o canvas usa o renderizador-placeholder automaticamente.
Veja a seção "Como inserir os vídeos gerados" no README principal.
