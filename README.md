# Portfólio Profissional — Rodrigo da Silva

Site de portfólio profissional de **Rodrigo da Silva**, especialista em hospitalidade e no
desenvolvimento de **sistemas de avaliação de hospitalidade individual e organizacional**.

É um site estático de página única (single-page), escrito em **HTML, CSS e JavaScript puro**,
sem nenhuma dependência externa e sem etapa de build. Basta abrir o arquivo `index.html` no
navegador para visualizá-lo — funciona inclusive offline.

## Recursos

- Layout responsivo (mobile-first) e acessível.
- Alternância de tema **claro/escuro**, com preferência salva no navegador (localStorage)
  e respeito à configuração do sistema na primeira visita.
- Navegação fixa com rolagem suave e destaque do link da seção atual.
- Seções: Início (Hero), Sobre, Realizações, Projetos e Contato.

## Como visualizar localmente

Opção 1 — abrir diretamente:

- Dê um duplo clique em `index.html` (ou arraste-o para o navegador).

Opção 2 — servidor local (recomendado, evita restrições de alguns navegadores):

```bash
python3 -m http.server
```

Depois acesse `http://localhost:8000` no navegador.

## Estrutura de arquivos

```
.
├── index.html    # Estrutura e conteúdo do site (todas as seções)
├── styles.css    # Estilos, paleta de cores e responsividade (temas claro/escuro)
├── script.js     # Tema, ano do rodapé, menu mobile e destaque de navegação
└── README.md     # Este arquivo
```

## Como personalizar

O conteúdo foi escrito para servir como base sólida. Os pontos que você deve ajustar com
suas informações reais estão marcados no `index.html` com o comentário `<!-- EDITÁVEL -->`.
Procure por esse termo no arquivo. Os principais são:

1. **Links de contato** (seção Contato): substitua os valores de exemplo pelos seus reais:
   - `mailto:seu-email@exemplo.com` → seu e-mail;
   - `https://linkedin.com/in/seu-perfil` → seu perfil do LinkedIn;
   - `https://github.com/rdgcdasilva` → seu perfil do GitHub (já preenchido, confira).
2. **Números das Realizações**: os cartões de métricas têm o comentário
   `<!-- EDITÁVEL: ajuste os números -->`. Troque valores como "+25", "+30%" pelos seus.
3. **Projetos adicionais**: os cartões marcados com
   `<!-- EDITÁVEL: adicione seus próprios projetos -->` são modelos prontos para você
   descrever outros trabalhos. Duplique um cartão `<article class="project-card">` para
   adicionar mais.
4. **Formulário de contato**: é apenas ilustrativo. Para que ele envie mensagens de verdade,
   é necessário um backend ou um serviço de formulários (por exemplo, Formspree ou
   Netlify Forms). Veja o comentário no HTML do formulário.

Textos como o resumo em "Sobre" e as descrições dos projetos também podem ser ajustados
livremente para refletir sua trajetória.

## Publicação gratuita no GitHub Pages

Este site pode ser hospedado gratuitamente no GitHub Pages:

1. Envie os arquivos para um repositório no GitHub.
2. No repositório, acesse **Settings → Pages**.
3. Em **Source**, escolha **Deploy from a branch**.
4. Selecione a branch (por exemplo, `main`) e a pasta `/ (root)`, e salve.
5. Aguarde alguns instantes; o endereço público do site aparecerá na mesma página.

Como não há etapa de build, nenhuma configuração adicional é necessária.
