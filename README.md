# Landing Cinematográfica — Rodrigo Cunha da Silva

Landing page de página única (single-page), **scroll-driven e cinematográfica**, de
**Rodrigo Cunha da Silva** — Professor Titular no PPG em Hospitalidade da Universidade
Anhembi Morumbi (UAM), Doutor e Pós-Doutor em Administração pela USP e Especialista de
Workforce Design na EDP. O site apresenta sua trajetória na intersecção entre **ciência
de dados, hospitalidade organizacional e gestão de pessoas** como uma jornada de rolagem
dividida em capítulos.

O site é estático (**HTML, CSS e JavaScript**) e usa três bibliotecas **vendorizadas
localmente** (sem dependência de CDN em tempo de execução — funciona offline). Basta abrir
`index.html` no navegador ou servir a pasta.

## Tecnologia

- **GSAP 3** + **ScrollTrigger** — animações e *pin/scrub* dirigidos pelo scroll.
- **Lenis** — *smooth scroll* sincronizado com o ScrollTrigger (via `gsap.ticker`).
- **Vídeo cinematográfico com scrub por scroll** — no desktop, cada capítulo embarca um
  clipe gerado (Higgsfield) cujo `currentTime` é dirigido pelo progresso do scroll (0→1),
  *pinado* enquanto o capítulo rola. Por baixo do vídeo há um `<canvas>` de tela cheia com
  o *poster* real do capítulo; se o vídeo falhar (ou em mobile/reduced-motion), o canvas
  garante a imagem estática — nunca um quadro em branco. Como última rede de segurança, um
  **renderizador-placeholder** desenha um gradiente grafite→âmbar com grão, vinheta e um
  motivo de pontos que se **estruturam** em grade conforme o progresso.

As bibliotecas ficam em `assets/vendor/`:

```
assets/vendor/gsap.min.js
assets/vendor/ScrollTrigger.min.js
assets/vendor/lenis.min.js
```

## Estrutura em capítulos (jornada de scroll)

Um único fluxo contínuo. Os **capítulos cinematográficos** (estágios de tela cheia com
canvas + texto sobreposto) se alternam com **seções de conteúdo real**:

1. **Capítulo 01 — Hero · "O que move as pessoas"** — nome, missão, eyebrow, silhueta
   profissional (placeholder) e CTAs *Ver trajetória* / *Vamos conversar*.
2. **Capítulo 02 — Fluxo · Workforce Design & Dados** → conteúdo real: papel na EDP,
   People Analytics, Áreas de Atuação e a **Carreira** (7 experiências, todas preservadas).
3. **Capítulo 03 — Acolhimento · Hospitalidade Organizacional** ("a hospitalidade não é
   ornamento, é estrutura") → **Sobre**, tese, vídeo de apresentação e **Projetos**
   (os 2 sistemas de avaliação de hospitalidade, NotebookLM e os guias de IA).
4. **Capítulo 04 — Rigor · Pesquisa & Conhecimento** → **Formação** e **Publicações**
   (livros, artigos publicados e working papers de 2026 — HospGap).
5. **Serviços** — consultoria em People Analytics, diagnóstico de hospitalidade
   organizacional, Workforce Design & Data Governance, palestras/formação e orientação
   acadêmica/mentoria.
6. **Capítulo 05 — Impacto / Final** → **Contato** (Lattes, LinkedIn, e-mail) e CTA final.

O site é **bilíngue (PT/EN)**: o botão de idioma na barra de navegação alterna todos os
textos com atributos `data-pt`/`data-en`; a escolha é salva no navegador (localStorage).

## Fallbacks responsivos e de acessibilidade

- **Telas pequenas (mobile)** — modo **leve**: os capítulos deixam de ser *pinados*, cada
  canvas exibe um *poster* estático e o conteúdo aparece com *fade-in* simples via
  `IntersectionObserver`. Rolagem normal, sem *scrub* pesado. Detecção por `matchMedia`.
- **`prefers-reduced-motion: reduce`** — modo **estático**: Lenis, *pin* e *scrub* são
  desativados; todo o conteúdo fica visível e acessível em uma página de rolagem normal
  (nenhum conteúdo depende de animação para aparecer).
- **Degradação graciosa** — se GSAP/Lenis não carregarem, o site cai automaticamente no
  modo estático: o conteúdo continua visível e navegável.
- **Conversão** — sem WhatsApp/telefone. A CTA persistente "Vamos conversar" leva ao
  Contato, com botões diretos para **LinkedIn** e **e-mail** (`mailto:`).

## Como inserir os vídeos gerados

> **Status:** todos os **cinco** capítulos cinematográficos já embarcam clipes reais
> gerados no **Higgsfield (Cinema Studio Video 3.0)** — Hero, Fluxo, Acolhimento, Rigor e
> Impacto/Final. Cada clipe é uma peça publicitária fotorrealista (~6 s, 1080p, 16:9, sem
> áudio), com uma figura profissional genérica **sem rosto**, na mesma casa grafite + âmbar,
> em continuidade de cena. Os arquivos ficam em `assets/video/<id>.mp4` (+ `.webm`) e o
> *poster* estático em `assets/frames/<id>/poster.png`. O placeholder de canvas segue
> presente apenas como rede de segurança (nunca aparece um quadro em branco).

O array de configuração `CHAPTERS` em `script.js` referencia o *poster* real de cada
capítulo:

```js
var CHAPTERS = [
  { id: 'hero',        framesDir: 'assets/frames/hero/',        frameCount: 0, accent: '#f5b301', poster: 'assets/frames/hero/poster.png' },
  { id: 'fluxo',       framesDir: 'assets/frames/fluxo/',       frameCount: 0, accent: '#f5b301', poster: 'assets/frames/fluxo/poster.png' },
  { id: 'acolhimento', framesDir: 'assets/frames/acolhimento/', frameCount: 0, accent: '#f6c343', poster: 'assets/frames/acolhimento/poster.png' },
  { id: 'rigor',       framesDir: 'assets/frames/rigor/',       frameCount: 0, accent: '#f5b301', poster: 'assets/frames/rigor/poster.png' },
  { id: 'final',       framesDir: 'assets/frames/final/',       frameCount: 0, accent: '#f6c343', poster: 'assets/frames/final/poster.png' }
];
```

### Como o clipe é integrado (padrão do Hero, replicado em cada capítulo)

No `index.html`, dentro do `.chapter-pin`, cada capítulo tem — sobre o `<canvas>` de
poster e sob o *scrim* + texto — um `<video>` com `data-chapter-video`:

```html
<video class="chapter-video" data-chapter-video
       poster="assets/frames/<id>/poster.png"
       muted playsinline preload="none" aria-hidden="true">
  <source data-src="assets/video/<id>.mp4" type="video/mp4">
  <source data-src="assets/video/<id>.webm" type="video/webm">
</video>
```

- **Desktop (modo cinematográfico):** o JS ativa os `<source>` (`data-src` → `src`) só neste
  modo e faz **scrub** — dirige `video.currentTime` pelo progresso (0→duração) do
  ScrollTrigger daquele capítulo. Quando um quadro é decodificado, o vídeo recebe a classe
  `is-on` e cobre o canvas-poster (que fica oculto via `.chapter.chapter-video-on`).
- **Fallback de hospedagem sem `Range`:** se o *seek* não "pegar", o clipe passa a tocar em
  **loop mudo** — garante movimento sem quadro preto.
- **Mobile / `prefers-reduced-motion`:** o vídeo **não** é baixado (`preload=none` e os
  `data-src` não são ativados); permanece o **poster estático** desenhado no canvas.

### Como os clipes foram processados

Cada clipe gerado é baixado (CloudFront) e processado com `ffmpeg`:

```bash
# MP4 com faststart + keyframes densos (scrub suave)
ffmpeg -i clipe.mp4 -c:v libx264 -crf 21 -g 12 -keyint_min 12 -sc_threshold 0 \
       -pix_fmt yuv420p -an -movflags +faststart assets/video/<id>.mp4
# Alternativa WebM (VP9) com keyframes densos
ffmpeg -i clipe.mp4 -c:v libvpx-vp9 -b:v 0 -crf 34 -g 12 -an assets/video/<id>.webm
# Poster estático
ffmpeg -ss 3 -i clipe.mp4 -frames:v 1 -q:v 2 assets/frames/<id>/poster.png
```

### Alternativa histórica — sequência de quadros

O *loader* de quadros continua disponível: se existir `assets/frames/<id>/0001.jpg`,
`0002.jpg`, ... e `frameCount` for ajustado, o canvas desenha o quadro correspondente ao
progresso (útil para hospedagens sem suporte a *seek* de vídeo). O vídeo `data-chapter-video`
tem precedência quando presente.

## Como visualizar localmente

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Estrutura de arquivos

```
.
├── index.html          # Estrutura, capítulos e todo o conteúdo (single-page)
├── styles.css          # Tema grafite/âmbar, capítulos cinematográficos e fallbacks
├── script.js           # Motor de scroll, canvas + CHAPTERS, idioma (PT/EN), fallbacks
├── assets/
│   ├── vendor/         # GSAP, ScrollTrigger e Lenis (vendorizados localmente)
│   ├── video/          # clipes cinematográficos por capítulo: <id>.mp4 + <id>.webm
│   ├── frames/         # posters dos capítulos (<id>/poster.png) e quadros opcionais
│   ├── video-rodrigo.mp4
│   ├── guia-ia-hospitalidade-ab.pdf
│   └── guia-ia-pequenas-empresas.pdf
└── README.md
```

## Restauração / backup

O estado do site **antes** da transformação cinematográfica está preservado na tag git
**`backup-pre-cinematic`**. Para restaurar:

```bash
git checkout backup-pre-cinematic
```

## Publicação (GitHub Pages)

O site é publicado gratuitamente via GitHub Pages e está disponível em:

**https://rdgcdasilva.github.io/trabalho/**

Como não há etapa de build, nenhuma configuração adicional é necessária: os arquivos na
raiz do repositório são servidos diretamente.
