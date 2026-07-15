# Portfólio Acadêmico &amp; Profissional — Rodrigo Cunha da Silva

Site de página única (single-page) de **Rodrigo Cunha da Silva** — Professor Titular no PPG em
Hospitalidade da Universidade Anhembi Morumbi (UAM), Doutor e Pós-Doutor em Administração pela USP
e Analista Sênior de Workforce Design &amp; Intelligence na EDP. O site apresenta sua trajetória na
intersecção entre **ciência de dados, hospitalidade organizacional e gestão de pessoas**.

É um site estático escrito em **HTML, CSS e JavaScript puro**, sem dependências externas e sem etapa
de build. Basta abrir o arquivo `index.html` no navegador para visualizá-lo — funciona inclusive offline.

## Recursos

- Site **bilíngue (PT/EN)**: o conteúdo tem versão em português (padrão) e em inglês, alternadas por um
  botão de idioma na barra de navegação. A escolha é salva no navegador (localStorage) e restaurada nas
  próximas visitas, ajustando também o atributo `lang` do documento.
- Layout responsivo (mobile-first) e acessível.
- Alternância de tema **claro/escuro**, com preferência salva no navegador (localStorage) e respeito à
  configuração do sistema na primeira visita.
- Navegação fixa com rolagem suave e destaque do link da seção atual.

## Seções

- **Início (Hero)** — identidade, tagline e chamadas para ação.
- **Sobre** — trajetória da gestão de pessoas à hospitalidade organizacional.
- **Formação** — formação acadêmica (timeline) e certificações.
- **Carreira** — trajetória profissional em timeline.
- **Pesquisas** — projetos de investigação, incluindo os dois sistemas de avaliação de hospitalidade
  (Individual e Organizacional), working papers, artigo publicado, bolsa UAM, base de conhecimento e patente.
- **Publicações** — livros, artigos internacionais e working papers.
- **Artigos Publicados** — artigos e trabalhos publicados destacados em cards.
- **Contato** — links acadêmicos (ORCID, Lattes CNPq, Web of Science) e contatos.

## Editar os campos pendentes (EDITÁVEL)

Dois contatos ainda precisam ser preenchidos com os dados reais. Eles estão marcados no `index.html`
com o comentário `<!-- EDITÁVEL: substituir pelo LinkedIn/e-mail reais -->` (procure por `EDITÁVEL`):

1. **LinkedIn** — substitua `href="#"` pela URL real do perfil (ex.: `https://www.linkedin.com/in/seu-perfil`)
   e atualize o texto exibido.
2. **E-mail** — substitua `mailto:seu-email@exemplo.com` pelo e-mail real e atualize o texto exibido.

Os links acadêmicos (ORCID, Lattes CNPq, Web of Science) já estão preenchidos com os dados reais.

## Como visualizar localmente

Opção 1 — abrir diretamente: dê um duplo clique em `index.html`.

Opção 2 — servidor local (recomendado):

```bash
python3 -m http.server
```

Depois acesse `http://localhost:8000` no navegador.

## Estrutura de arquivos

```
.
├── index.html    # Estrutura e conteúdo do site (todas as seções)
├── styles.css    # Estilos, paleta de cores e responsividade (temas claro/escuro)
├── script.js     # Tema, idioma (PT/EN), ano do rodapé, menu mobile e destaque de navegação
└── README.md     # Este arquivo
```

## Publicação (GitHub Pages)

O site é publicado gratuitamente via GitHub Pages e está disponível em:

**https://rdgcdasilva.github.io/trabalho/**

Como não há etapa de build, nenhuma configuração adicional é necessária: os arquivos na raiz do
repositório são servidos diretamente.
