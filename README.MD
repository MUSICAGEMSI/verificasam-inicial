# Google Sheets Interface

Uma interface React moderna para visualizar e filtrar dados do Google Sheets em tempo real.

## 🚀 Como executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação

1. **Clone ou baixe os arquivos** para uma pasta no seu computador

2. **Crie a estrutura de pastas:**
```
google-sheets-interface/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── GoogleSheetsInterface.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

3. **Abra o terminal na pasta do projeto** e execute:
```bash
npm install
```

4. **Inicie o servidor de desenvolvimento:**
```bash
npm start
```

5. **Abra o navegador** em: http://localhost:3000

## 📋 Como usar

### 1. Configurar o Google Sheets

1. Abra sua planilha no Google Sheets
2. Clique em **Arquivo > Compartilhar > Publicar na web**
3. Selecione a aba que deseja
4. Escolha **Valores separados por vírgula (.csv)**
5. Clique em **Publicar**
6. Copie o link gerado

### 2. Formato da URL

A URL deve seguir este formato:
```
https://docs.google.com/spreadsheets/d/SEU_SHEET_ID/pub?gid=0&single=true&output=csv
```

### 3. Funcionalidades

- ✅ **Visualização automática** dos dados
- ✅ **Filtros em tempo real** por qualquer coluna
- ✅ **Estatísticas** dos dados
- ✅ **Interface responsiva**
- ✅ **Atualização manual** dos dados
- ✅ **Tratamento de erros**

## 🛠️ Estrutura do projeto

### Componentes principais:

- **GoogleSheetsInterface**: Componente principal
- **useGoogleSheets**: Hook personalizado para buscar dados
- **DataTable**: Componente da tabela
- **DataFilters**: Sistema de filtros
- **DataStats**: Estatísticas dos dados

### Tecnologias utilizadas:

- **React 18**: Framework principal
- **Papa Parse**: Parsing robusto de CSV
- **CSS3**: Estilização moderna
- **Fetch API**: Requisições HTTP

## 🎨 Personalização

### Modificar estilos
Edite os arquivos `App.css` para personalizar:
- Cores
- Fontes
- Layout
- Animações

### Adicionar funcionalidades
No arquivo `GoogleSheetsInterface.js` você pode:
- Adicionar novos filtros
- Implementar ordenação
- Adicionar exportação
- Criar gráficos

## 📝 Exemplo de dados

A interface funciona com qualquer planilha que tenha:
- Cabeçalhos na primeira linha
- Dados organizados em colunas
- Formato CSV válido

### Exemplo de estrutura:
```csv
Nome,Email,Idade,Cidade,Status
João Silva,joao@email.com,25,São Paulo,Ativo
Maria Santos,maria@email.com,30,Rio de Janeiro,Ativo
Pedro Lima,pedro@email.com,28,Belo Horizonte,Inativo
```

## 🔧 Comandos disponíveis

### `npm start`
Executa a aplicação em modo de desenvolvimento
Abra [http://localhost:3000](http://localhost:3000) para ver no navegador

### `npm run build`
Compila a aplicação para produção na pasta `build`

### `npm test`
Executa os testes em modo interativo

## 🐛 Solução de problemas

### Erro de CORS
Se encontrar erros de CORS, verifique se:
- A planilha está pública
- A URL está no formato correto
- O navegador não está bloqueando requisições

### Dados não aparecem
Verifique se:
- A planilha tem dados
- A primeira linha contém cabeçalhos
- O formato da URL está correto
- A planilha está compartilhada publicamente

### Performance lenta
Para grandes volumes de dados:
- Considere implementar paginação
- Use virtualização da tabela
- Otimize os filtros

## 📦 Dependências

### Principais:
- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `papaparse`: ^5.4.1
- `axios`: ^1.6.0

### Desenvolvimento:
- `react-scripts`: 5.0.1

## 🚀 Deploy

### Netlify
1. Execute `npm run build`
2. Faça upload da pasta `build` para o Netlify

### Vercel
1. Conecte o repositório ao Vercel
2. Configure o comando de build: `npm run build`
3. Configure o diretório de output: `build`

### GitHub Pages
1. Execute `npm run build`
2. Faça upload do conteúdo de `build` para o branch `gh-pages`

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Se encontrar problemas ou tiver dúvidas:
1. Verifique se seguiu todos os passos de instalação
2. Confirme se o Node.js está instalado corretamente
3. Teste com uma planilha simples primeiro
4. Verifique o console do navegador para erros

## 🔮 Próximas funcionalidades

- [ ] Paginação para grandes datasets
- [ ] Gráficos e visualizações
- [ ] Exportação em diferentes formatos
- [ ] Ordenação por colunas
- [ ] Filtros avançados
- [ ] Modo escuro
- [ ] Salvamento de filtros
- [ ] API para múltiplas planilhas#   v e r i f i c a s a m - i n i c i a l  
 