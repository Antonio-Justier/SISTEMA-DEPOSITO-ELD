# El Dourado — Ferramentas

Aplicação web unificada para o **El Dourado by Sapore** que reúne, em um único lugar, todas as ferramentas internas de controle de estoque e qualidade, com histórico de gerações e funcionamento offline.

## 📋 Sobre o projeto

Antes, cada ferramenta era um site separado, sem persistência: bastava trocar de aba, bloquear o celular ou recarregar a página para perder todo o preenchimento. Esta versão resolve isso reunindo as ferramentas em um só app, com **auto-save automático** e **histórico de gerações** salvos localmente no navegador.

## ✨ Funcionalidades

- **5 abas** acessíveis no topo:
  - **Parâmetros de Compras** — lista dinâmica de produtos (nome, quantidade atual, comprar) → gera PDF retrato A4
  - **RNC** — formulário completo de Relatório de Não Conformidade com até 2 imagens, incluindo campo S.I.F → gera PDF paisagem A4
  - **Placas Palete** — gerador de placas de identificação de palete com entrada automática em CAIXA ALTA → gera PDF
  - **Protocolo de Retirada** — documentação de requisição/retorno com tabela de produtos dinâmica (adicionar/remover linhas), upload de até 6 fotos de evidência e tipo Requisição/Retorno → gera PDF retrato A4 com linha para assinatura manual (Nome/CPF)
  - **Histórico** — lista de todos os PDFs gerados, com data/hora e os itens preenchidos, filtrável por tipo
- **Auto-save automático** com debounce de 400ms — tudo que você digita fica salvo no `localStorage` do navegador. Pode trocar de aba, fechar o navegador, bloquear o celular: ao reabrir, está lá.
- **Histórico de gerações** mostra o título, data/hora e todos os campos preenchidos. Permite **reabrir no formulário** para usar como modelo.
- **PWA instalável** — pode ser adicionado à tela inicial do celular e funcionar como um app, inclusive offline depois da primeira visita.
- **Mobile-first** — layout adaptado para uso no celular, com áreas de toque generosas.
- Logo da empresa embutida em base64 — funciona offline.
- Aba ativa também é persistida — abre na última aba que você usou.

## 🚀 Como usar

### Acesso pelo navegador

Abra o arquivo `index.html` em qualquer navegador moderno (Chrome, Edge, Firefox, Safari). Para o PWA funcionar (instalação e offline), os arquivos precisam estar servidos via HTTP/HTTPS, não diretamente do sistema de arquivos.

### Servir localmente

```bash
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080` no navegador.

### Hospedagem

Pode ser hospedado em GitHub Pages, Netlify, Vercel ou qualquer servidor estático. Não há backend.

### Instalar como app no celular

1. Abra o site no Chrome (Android) ou Safari (iOS).
2. No menu do navegador, escolha **"Adicionar à tela inicial"** ou **"Instalar app"**.
3. O app passa a aparecer com ícone próprio na tela inicial e abre em tela cheia.

## 📁 Estrutura

```
.
├── index.html       # Aplicação completa (HTML + CSS + JS + logo embutida)
├── manifest.json    # Manifesto PWA (nome, ícones, cores)
├── sw.js            # Service Worker (cache offline)
├── icon-192.png     # Ícone do app (192x192)
├── icon-512.png     # Ícone do app (512x512)
└── README.md        # Este arquivo
```

Tudo é estático, sem build nem dependências de Node. As bibliotecas usadas (`jsPDF`, `jsPDF-AutoTable`, `html2canvas`) vêm via CDN e ficam cacheadas pelo Service Worker após a primeira visita.

## 💾 Persistência dos dados

Toda a persistência é feita no `localStorage` do próprio navegador, usando as seguintes chaves:

| Chave | Conteúdo |
|---|---|
| `eldourado:state:pc` | Estado atual da aba Parâmetros (linhas digitadas) |
| `eldourado:state:rnc` | Estado atual da aba RNC (todos os campos + imagens em base64) |
| `eldourado:state:placa` | Estado atual da aba Placas Palete |
| `eldourado:history` | Lista de gerações (até 100 entradas mais recentes) |
| `eldourado:activeTab` | Última aba ativa |

**Importante:** o `localStorage` é por navegador e por dispositivo. Não há sincronização entre dispositivos. Limpar os dados do navegador apaga tudo. Se mudar de celular, os dados não vão junto.

### Histórico

Cada vez que você gera um PDF, uma entrada é adicionada ao histórico contendo:
- **Tipo** (Parâmetros, RNC, Placas Palete ou Protocolo)
- **Título** descritivo (ex.: "RNC Nº 02 — Queijo Mussarela", "Protocolo #1 — Felipe")
- **Data e hora da geração**
- **Todos os itens preenchidos** (campos textuais — imagens não são salvas no histórico para economizar espaço)

O histórico fica capado em 100 entradas; quando passa disso, as mais antigas são removidas automaticamente.

## 🛠️ Tecnologias

- **HTML5 + CSS3** — interface
- **JavaScript (Vanilla)** — sem frameworks
- **[jsPDF](https://github.com/parallax/jsPDF) 2.5.1** + **[jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) 3.8.2** — PDF da aba Parâmetros
- **[html2canvas](https://html2canvas.hertzen.com/) 1.4.1** + **jsPDF** — PDF das abas RNC e Protocolo (a partir de templates HTML ocultos)
- **Service Worker + Cache API** — funcionamento offline
- **Web App Manifest** — instalação como PWA
- **localStorage API** — persistência local

## 🔧 Personalização

### Trocar a logo

A logo está embutida em base64 no JS na constante `LOGO_SRC` (próximo ao topo do bloco `<script>`). Para trocar:

1. Converta sua imagem para base64:
   ```bash
   base64 -w 0 sua-logo.jpg
   ```
2. Substitua o conteúdo de `LOGO_SRC` por `data:image/jpeg;base64,<seu_base64>`.
3. Se a nova logo tiver outra proporção, ajuste o cálculo dentro de `pc.generatePDF()`:
   ```javascript
   const logoH = logoW * (163 / 539); // troque pelos seus valores
   ```

### Mudar cores

As cores principais ficam em variáveis CSS no `:root`:
```css
--accent-pc: #898989;     /* Parâmetros — cinza */
--accent-rnc: #b91c1c;    /* RNC — vermelho */
--accent-placa: #b8860b;  /* Placas Palete — dourado */
--accent-proto: #e67e22;  /* Protocolo — laranja */
--accent-hist: #2563eb;   /* Histórico — azul */
```

### Adicionar/remover campos do RNC

1. Adicione o `<input>` ou `<textarea>` no formulário (mantenha o padrão de id `rnc-nomedocampo`).
2. Inclua o nome do campo (sem o prefixo `rnc-`) no array `RNC_FIELDS` no JS.
3. Inclua o rótulo no objeto `RNC_LABELS`.
4. Se for um campo de data, inclua no array `RNC_DATE_FIELDS`.
5. Adicione o `<span id="p-nomedocampo"></span>` no template oculto do PDF (`#pdf-template`).
6. Adicione a linha correspondente na função `rnc.generatePDF()`.

## 🗺️ Roadmap

- [ ] Exportar histórico em CSV/JSON
- [ ] Importar histórico de outro dispositivo (via arquivo)
- [ ] Numeração automática sequencial das RNCs (próximo número baseado no histórico)
- [ ] Sincronização opcional via Firebase/Supabase (para multi-dispositivo)
- [ ] Modo escuro
- [ ] Busca no histórico por produto/data
- [ ] Edição de entradas do histórico

## 📝 Histórico de mudanças

- **v3.0** — Adição da aba Protocolo de Retirada (documentação de requisição/retorno com produtos dinâmicos, upload de fotos e geração de PDF com assinatura), campo S.I.F na RNC, entrada automática em CAIXA ALTA na aba Placas Palete, e aba Placas Palete integrada ao histórico.
- **v2.0** — Unificação dos dois sistemas em um único app com abas, auto-save em `localStorage`, aba Histórico e funcionamento como PWA instalável.
- **v1.x** — Versões anteriores separadas:
  - Parâmetros de Compras v1.0 → v1.2
  - Gerador de RNC v1.0

## 👥 Créditos

- **Desenvolvido por:** Antonio Aguilera
- **Layout RNC:** Cesar Augusto
- **Unificação e persistência:** com auxílio de Claude (Anthropic)

## 📄 Licença

Uso interno — El Dourado by Sapore.
