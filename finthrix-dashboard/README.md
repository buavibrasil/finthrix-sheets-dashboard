# FinThrix Dashboard

Dashboard financeiro de alta fidelidade para gestão de finanças pessoais e familiares.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + React Chart.js 2
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + TypeScript ESLint
- **Export**: jsPDF + html2canvas + XLSX
- **PWA**: Service Worker + Web App Manifest
- **Icons**: Lucide React

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes de interface básicos
│   ├── dashboard/      # Componentes específicos do dashboard
│   ├── charts/         # Componentes de gráficos (Line, Pie, Bar, Area)
│   ├── tables/         # Componentes de tabelas
│   ├── Auth/           # Componentes de autenticação
│   ├── Layout/         # Componentes de layout
│   ├── Export/         # Componentes de exportação
│   └── PWA/            # Componentes PWA
├── pages/              # Páginas da aplicação
├── hooks/              # Custom hooks
├── stores/             # Stores Zustand
├── services/           # Serviços de API e exportação
├── utils/              # Utilitários e helpers
├── types/              # Definições TypeScript
└── styles/             # Estilos globais
```

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar testes
npm run test

# Executar linting
npm run lint
```

## 📊 Funcionalidades

### KPIs Principais
- Saldo atual
- Total de receitas
- Total de despesas
- Contas a pagar
- Contas em atraso

### Gráficos Interativos
- **Gráfico de Linha**: Tendência de receitas/despesas ao longo do tempo
- **Gráfico de Pizza**: Distribuição por categorias
- **Gráfico de Barras**: Comparação mensal por categoria
- **Gráfico de Área**: Fluxo de caixa acumulado
- **Gráfico de Barras Horizontal**: Top categorias de gastos

### Exportação de Relatórios 📄
- **Formato PDF**: Relatórios visuais com gráficos inclusos
- **Formato Excel**: Dados tabulares para análise
- **Opções Personalizáveis**: Escolha do conteúdo a incluir
- **Interface Intuitiva**: Modal com seleção de formato e conteúdo

### PWA (Progressive Web App) 📱
- **Instalação**: Funciona como app nativo
- **Offline**: Funcionalidade básica sem internet
- **Notificações**: Alertas de atualizações e instalação
- **Ícones Personalizados**: Design otimizado para diferentes dispositivos

### Tabelas de Atividades
- Transações recentes
- Contas a pagar próximas

### Filtros Globais
- Período (hoje, semana, mês, trimestre, ano, personalizado)
- Tipo de transação (todas, receitas, despesas)
- Categoria

## 🎨 Design System

O projeto utiliza um design system baseado em Tailwind CSS com:
- Paleta de cores personalizada
- Componentes reutilizáveis
- Sistema de tipografia consistente
- Responsividade mobile-first

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=FinThrix Dashboard
```

### Configurações de Desenvolvimento
- Hot reload habilitado
- Source maps para debugging
- Linting automático
- Formatação com Prettier (recomendado)

## 📱 Responsividade

O dashboard é totalmente responsivo com breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

## 📖 Como Usar as Novas Funcionalidades

### Exportação de Relatórios
1. Clique no botão "Exportar Relatório" no cabeçalho da página
2. Escolha o formato desejado (PDF ou Excel)
3. Selecione o conteúdo a incluir no relatório
4. Clique em "Exportar" e o download iniciará automaticamente

### PWA (Progressive Web App)
1. **Instalação**: Acesse o dashboard pelo navegador e clique no ícone de instalação
2. **Uso Offline**: Funcionalidades básicas disponíveis sem conexão
3. **Atualizações**: Notificações automáticas quando houver novas versões

### Gráficos Expandidos
- **Interatividade**: Passe o mouse sobre os gráficos para ver detalhes
- **Responsividade**: Gráficos se adaptam automaticamente ao tamanho da tela
- **Filtros**: Use os filtros globais para personalizar os dados exibidos

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Executar testes com interface
npm run test:ui

# Executar testes com coverage
npm run test:coverage
```

## 📈 Performance

- Code splitting automático
- Lazy loading de componentes
- Otimização de bundle
- Caching inteligente de dados

## 🔒 Segurança

- Validação de dados com Zod
- Sanitização de inputs
- Headers de segurança
- Autenticação JWT (quando implementada)

## 📝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.