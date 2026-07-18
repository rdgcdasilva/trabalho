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
- **Canvas com scrub por progresso** — cada capítulo tem um `<canvas>` de tela cheia,
  *pinado* enquanto o capítulo rola, cujo desenho é dirigido pelo progresso do scroll
  (0→1). Enquanto os clipes gerados não existem, um **renderizador-placeholder** desenha
  um gradiente cinematográfico grafite→âmbar que faz *scrub* visível para frente e para
  trás, com grão, vinheta e um motivo de pontos que se **estruturam** em grade conforme o
  progresso.

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

Toda a integração está preparada em `script.js`, no array de configuração `CHAPTERS`:

```js
var CHAPTERS = [
  { id: 'hero',        framesDir: 'assets/frames/hero/',        frameCount: 0, accent: '#f5b301' },
  { id: 'fluxo',       framesDir: 'assets/frames/fluxo/',       frameCount: 0, accent: '#f5b301' },
  { id: 'acolhimento', framesDir: 'assets/frames/acolhimento/', frameCount: 0, accent: '#f6c343' },
  { id: 'rigor',       framesDir: 'assets/frames/rigor/',       frameCount: 0, accent: '#f5b301' },
  { id: 'final',       framesDir: 'assets/frames/final/',       frameCount: 0, accent: '#f6c343' }
];
```

### Opção A — sequência de quadros (recomendada, mantém o *scrub*)

1. Extraia os quadros do clipe gerado (ex.: com o Higgsfield), usando o `id` do capítulo:

   ```bash
   ffmpeg -i cap-fluxo.mp4 -vf fps=24 assets/frames/fluxo/%04d.jpg
   ```

2. Os arquivos devem ficar em `assets/frames/<id>/0001.jpg`, `0002.jpg`, ...
3. Ajuste `frameCount` do capítulo para o total de quadros extraídos.

O *loader* tenta carregar `assets/frames/<id>/0001.jpg`; se existir, o canvas passa a
desenhar o quadro correspondente ao progresso do scroll. Se não existir, cai
automaticamente no renderizador-placeholder — ou seja, é seguro configurar um capítulo
por vez.

### Opção B — vídeo simples (sem *scrub* por quadro)

Troque, no `index.html`, o `<canvas data-canvas="<id>">` do capítulo por um `<video>`:

```html
<video class="chapter-canvas" src="assets/clips/<id>.mp4"
       muted loop playsinline autoplay preload="auto"></video>
```

e remova esse `id` do array `CHAPTERS` (o motor ignora capítulos sem canvas).

> **Status:** os quadros/clipes gerados ainda **não** foram produzidos (dependem do
> servidor de geração de mídia Higgsfield). Até lá, os capítulos usam o
> placeholder cinematográfico.

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
│   ├── frames/         # (drop-in) quadros dos clipes gerados: <id>/0001.jpg ...
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
