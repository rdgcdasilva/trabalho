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
5. **Serviços** (reposicionado, foco acadêmico/independente) — palestras, aulas &
   formação; guias & curso de IA aplicada; diagnóstico de hospitalidade (hotelaria,
   food service, varejo, serviços); e People Analytics & métodos quantitativos.
6. **Produtos & Relatórios** (`#produtos`) — infoprodutos pagos (Hotmart) e a isca
   gratuita com formulário de lead (`#guia-gratis`). Ver a seção **Monetização**.
7. **Capítulo 05 — Impacto / Final** → **Contato** (Lattes, LinkedIn, e-mail) e CTA final.

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
│   └── guia-ia-pequenas-empresas.pdf   # isca gratuita (entregue via formulário)
└── README.md
```

## Monetização

O site tem uma camada de monetização de caráter **acadêmico e independente**
(sem relação com o vínculo empregatício do autor — ver disclaimer no rodapé e na
seção **Produtos**). O formulário de lead está conectado ao **Formspree**
(`https://formspree.io/f/mvzeqdwk`) no `index.html`.

### Produtos pagos (aquisição via Contato)

Na seção **Produtos & Relatórios** (`#produtos`), os produtos pagos **não** exibem
preço nem usam checkout do Hotmart. Cada card traz um único CTA
**"Fale comigo para adquirir"** (`Get in touch to purchase`) que leva à seção
**Contato** (`#contato`), onde o interessado fala diretamente com o autor para
adquirir. Os produtos pagos são:

- Guia de IA para Hospitalidade & A&B
- Formação: IA para Alavancar a Carreira
- Relatório de Hospitalidade — Individual
- Relatório de Hospitalidade — Organizacional

Os **relatórios** seguem o fluxo *responda o instrumento → adquira o relatório*:
apontam para os sistemas de avaliação existentes
(`avaliacao-hospitalidade.html` e `mapeamento-hospitalidade.html`) e entregam um
relatório que combina **(1)** o resultado das respostas ao instrumento e **(2)**
uma varredura da avaliação de clientes e funcionários sobre o grau de
hospitalidade da empresa.

> O guia pago **substitui** o antigo PDF público
> `assets/guia-ia-hospitalidade-ab.pdf`, que foi **removido dos assets** (o
> arquivo permanece no histórico do git; o histórico não foi reescrito).

### Isca gratuita + formulário de lead (`#guia-gratis`)

O **Guia Fácil de IA para Pequenas Empresas** é gratuito, mas liberado **somente
após o envio de um formulário de lead** (não há mais download direto na UI). O
formulário coleta nome, e-mail (obrigatório), telefone/WhatsApp, empresa, cargo,
setor, um consentimento de contato e uma linha de LGPD.

Como é um site estático (GitHub Pages, sem back-end), o formulário está
**conectado ao [Formspree](https://formspree.io)**:

- `action="https://formspree.io/f/mvzeqdwk"`, `method="POST"`. Os campos usam os
  `name=` `nome`, `email`, `telefone`, `empresa`, `cargo`, `setor` e
  `quer_contato` (o Formspree os usa como rótulos; `email` vira o *reply-to*).
  Há ainda um campo oculto `_subject` (assunto do e-mail) e um honeypot
  anti-spam `_gotcha`.
- **Aprimoramento progressivo:** com JavaScript, o `script.js` intercepta o
  envio e faz um `fetch` (AJAX). **No sucesso, o site oculta o formulário e
  libera o download do guia gratuito** (`assets/guia-ia-pequenas-empresas.pdf`)
  em um botão bilíngue. No erro, mostra uma mensagem e mantém o formulário para
  nova tentativa. Sem JavaScript, o `<form>` envia por POST nativo ao Formspree
  normalmente.
- O Formspree **encaminha cada lead por e-mail** para `rdgcdasilva@gmail.com`.

> **Primeira ativação:** no **primeiro envio real**, o Formspree envia um e-mail
> de **confirmação** para o dono do formulário. É preciso **confirmar/ativar** o
> formulário uma única vez para que os leads passem a ser entregues. Esse passo
> só pode ser concluído pelo dono, no site publicado.

## Como adicionar um Conteúdo ou um post de Blog

O site tem **duas seções separadas**, ambas entre **Publicações** e **Serviços**:

- **Conteúdos** (`#conteudos`) — o que o autor **recomenda e disponibiliza**:
  **Apresentações**, **Vídeos do YouTube** e **Artigos científicos**. Um filtro
  de categorias (Todos / Apresentações / Vídeos / Artigos científicos) mostra/oculta
  os cartões via JavaScript puro (`initContentFilter` no `script.js`).
- **Blog** (`#blog`) — os **textos escritos pelo próprio autor**. É um feed único,
  **sem filtro** de categorias.

### Adicionar um Conteúdo (recomendação)

1. Abra o `index.html` e localize a seção `#conteudos`. No topo da `.cards-grid`
   há um bloco de **TEMPLATES "copie-me"** comentado — um para cada tipo.
2. **Copie o template do tipo desejado** e cole logo após ele, agora **fora** do
   comentário (cada cartão real é marcado com `<!-- EDITÁVEL: substitua pelo seu
   conteúdo real -->`).
3. Ajuste o **`data-category`** do `<article>` para um destes três valores:
   `apresentacao` | `video` | `artigo-cientifico` (é ele que o filtro usa).
4. Preencha **título**, **data** (`.content-date`, ex.: `Jul 2026`), **descrição**
   e o **link/CTA** — sempre nos três idiomas via `data-pt` / `data-en` / `data-es`.
   A data pode ser igual nos três idiomas.
5. Para **vídeos**, o padrão é **linkar** o YouTube (`href` com a URL, `target="_blank"`
   e um `▶` no CTA). Se preferir **embutir** o vídeo, há um template de `<div class="video-embed">`
   comentado dentro do cartão de vídeo — troque `SEU_VIDEO_ID` e cole no cartão
   (o CSS `.video-embed` já garante o formato responsivo 16:9).

### Adicionar um post de Blog

1. Abra o `index.html` e localize a seção `#blog`. No topo da `.cards-grid` há um
   único **TEMPLATE "copie-me"** comentado (`<article class="blog-card">`).
2. **Copie o template** e cole logo após ele, **fora** do comentário (os cartões
   reais são marcados com `<!-- EDITÁVEL: substitua pelo seu conteúdo real -->`).
3. Preencha **título**, **data** (`.content-date`), **descrição** e o link
   **"Ler artigo →"** — sempre nos três idiomas (`data-pt` / `data-en` / `data-es`).
   Não há `data-category` nem badge aqui: a seção inteira é o blog.

Pronto: não há build. Salve, sirva a pasta (veja abaixo) e o novo cartão aparece —
já respeitando o filtro (nos Conteúdos) e a troca de idiomas.

## Restauração / backup

O estado do site **antes** da transformação cinematográfica está preservado na tag git
**`backup-pre-cinematic`**. Para restaurar:

```bash
git checkout backup-pre-cinematic
```

## Publicação (GitHub Pages)

O site é publicado gratuitamente via GitHub Pages e está disponível em:

**https://www.rodrigocunhadasilva.com.br/**

Também acessível pela URL do projeto no GitHub Pages: https://rdgcdasilva.github.io/trabalho/

Como não há etapa de build, nenhuma configuração adicional é necessária: os arquivos na
raiz do repositório são servidos diretamente.
