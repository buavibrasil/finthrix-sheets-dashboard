# 📊 FinThrix Dashboard - Google Sheets Integration

> Dashboard financeiro moderno com integração completa ao Google Sheets, sistema de segurança robusto e arquitetura escalável.

[![Deploy Status](https://img.shields.io/badge/deploy-auto-brightgreen)](./DEPLOY_AUTO.md)
[![Security](https://img.shields.io/badge/security-enterprise-blue)](./SECURITY.md)
[![Documentation](https://img.shields.io/badge/docs-complete-success)](./docs/)

## 🚀 Quick Start (5 minutos)

### Para Novos Desenvolvedores

```bash
# 1. Clone o repositório
git clone <YOUR_GIT_URL>
cd finthrix-sheets-dash-main

# 2. Instale dependências
npm install

# 3. Configure ambiente (copie e edite)
cp .env.example .env.local

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

**🎯 Próximos passos:** [Configuração Google Sheets](./GOOGLE_SETUP.md) → [Guia de Segurança](./SECURITY_IMPLEMENTATION_GUIDE.md)

### Para Revisores de Código

- **📋 Templates de Documentação:** [docs/DOCUMENTATION_TEMPLATES.md](./docs/DOCUMENTATION_TEMPLATES.md)
- **🔒 Implementação de Segurança:** [SECURITY_README.md](./SECURITY_README.md)
- **🧪 Guia de Testes:** [docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)
- **🔧 Manutenção:** [docs/MAINTENANCE_GUIDE.md](./docs/MAINTENANCE_GUIDE.md)

## 🎯 Características Principais

### 💼 Funcionalidades de Negócio
- **📈 Dashboard Financeiro:** Visualização de dados em tempo real com gráficos interativos
- **🔗 Google Sheets:** Integração nativa com sincronização bidirecional
- **📊 Analytics:** Métricas de performance e uso detalhadas
- **📱 Responsivo:** Interface otimizada para desktop e mobile

### 🛡️ Segurança Empresarial
- **🔐 Autenticação OAuth 2.0:** Login seguro com Google
- **🔒 Criptografia AES-GCM:** Proteção de dados sensíveis
- **🚫 Rate Limiting:** Proteção contra ataques DDoS
- **🛡️ Validação Rigorosa:** Sanitização contra XSS e injeções
- **📝 Logging Seguro:** Auditoria completa com redação de dados sensíveis

### ⚡ Performance e Escalabilidade
- **🚀 Vite + React:** Build otimizado e hot reload
- **🎨 Tailwind CSS:** Styling eficiente e consistente
- **📦 Code Splitting:** Carregamento otimizado de componentes
- **🔄 Middleware:** Arquitetura modular e extensível

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** + **TypeScript** - Interface moderna e type-safe
- **Vite** - Build tool rápido com HMR
- **Tailwind CSS** + **shadcn/ui** - Design system consistente
- **Recharts** - Visualização de dados interativa

### Backend & Integração
- **Supabase** - Backend-as-a-Service
- **Google Sheets API** - Integração com planilhas
- **Google OAuth 2.0** - Autenticação segura

### Segurança & Qualidade
- **ESLint** + **Prettier** - Qualidade de código
- **TypeScript** - Type safety
- **Vitest** - Testes unitários e integração
- **Custom Security Layer** - Proteção empresarial

### Deploy & DevOps
- **Vercel** - Deploy automático
- **GitHub Actions** - CI/CD pipeline
- **Environment Variables** - Configuração segura

## 🏗️ Arquitetura do Projeto

### 📁 Estrutura de Pastas
```
src/
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # Componentes base do design system
│   ├── auth/           # Componentes de autenticação
│   ├── charts/         # Componentes de visualização
│   ├── security/       # Componentes de segurança
│   └── debug/          # Ferramentas de debugging
├── config/             # Configurações centralizadas
├── hooks/              # Custom React hooks
├── lib/                # Integrações e utilitários principais
├── middleware/         # Middleware de segurança e validação
├── pages/              # Páginas da aplicação
├── store/              # Gerenciamento de estado
├── utils/              # Utilitários e helpers
└── types/              # Definições TypeScript
```

### 🔄 Fluxo de Dados
```
User Input → Validation → Security Middleware → Google Sheets API → State Management → UI Update
```

### 🛡️ Camadas de Segurança
1. **Input Validation** - Sanitização e validação de entrada
2. **Authentication** - OAuth 2.0 com Google
3. **Authorization** - Controle de acesso baseado em roles
4. **Rate Limiting** - Proteção contra ataques
5. **Encryption** - Criptografia de dados sensíveis
6. **Logging** - Auditoria e monitoramento

## 📚 Guias de Desenvolvimento

### 🚀 Para Começar Rapidamente

#### 1. Configuração Inicial (5 min)
```bash
# Clone e configure
git clone <YOUR_GIT_URL>
cd finthrix-sheets-dash-main
npm install
cp .env.example .env.local
```

#### 2. Configuração Google Sheets (10 min)
- Siga o [Guia de Configuração Google](./GOOGLE_SETUP.md)
- Configure as variáveis no `.env.local`
- Teste a conexão com `npm run dev`

#### 3. Primeiro Componente (15 min)
- Use os [Templates de Documentação](./docs/DOCUMENTATION_TEMPLATES.md)
- Implemente seguindo os padrões de segurança
- Adicione testes unitários

### 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run build           # Build para produção
npm run preview         # Preview do build

# Qualidade de Código
npm run lint            # Verificar linting
npm run lint:fix        # Corrigir problemas automáticos
npm run type-check      # Verificar tipos TypeScript

# Testes
npm run test            # Executar todos os testes
npm run test:watch      # Testes em modo watch
npm run test:security   # Testes específicos de segurança
npm run test:coverage   # Relatório de cobertura

# Utilitários
npm run clean           # Limpar cache e builds
npm run analyze         # Analisar bundle size
```

### 📋 Checklist para Novos Desenvolvedores

#### ✅ Setup Inicial
- [ ] Node.js 18+ instalado
- [ ] Git configurado
- [ ] IDE configurado (VS Code recomendado)
- [ ] Extensões recomendadas instaladas

#### ✅ Configuração do Projeto
- [ ] Repositório clonado
- [ ] Dependências instaladas
- [ ] Arquivo `.env.local` configurado
- [ ] Servidor de desenvolvimento funcionando

#### ✅ Conhecimento Base
- [ ] Leu a documentação de segurança
- [ ] Entendeu a arquitetura do projeto
- [ ] Conhece os padrões de código
- [ ] Sabe como executar testes

#### ✅ Primeiro Commit
- [ ] Criou branch feature
- [ ] Implementou funcionalidade
- [ ] Adicionou testes
- [ ] Documentou mudanças
- [ ] Passou no CI/CD

## 🚀 Deploy e Ambientes

### 🔄 Deploy Automático
- **Produção:** Commits na `main` → Deploy automático no Vercel
- **Preview:** Pull Requests → URLs de preview automáticas
- **Staging:** Branch `staging` → Ambiente de homologação

### 📖 Guias Detalhados
- **[Deploy Automático (Recomendado)](./DEPLOY_AUTO.md)**
- **[Deploy Local](./DEPLOY_LOCAL.md)**
- **[Configuração Google Sheets](./GOOGLE_SETUP.md)**

## 🧪 Testes e Qualidade

### 📊 Cobertura de Testes
- **Meta:** ≥ 80% de cobertura
- **Unitários:** Componentes e utilitários
- **Integração:** Fluxos completos
- **Segurança:** Validações e middleware

### 🔍 Ferramentas de Qualidade
- **ESLint:** Análise estática de código
- **Prettier:** Formatação consistente
- **TypeScript:** Type safety
- **Vitest:** Framework de testes
- **Husky:** Git hooks para qualidade

## 📚 Documentação Completa

### 🔒 Segurança
- **[Visão Geral de Segurança](./SECURITY.md)**
- **[Guia de Implementação](./SECURITY_IMPLEMENTATION_GUIDE.md)**
- **[README de Segurança](./SECURITY_README.md)**

### 📋 Templates e Padrões
- **[Templates de Documentação](./docs/DOCUMENTATION_TEMPLATES.md)**
- **[Guia de Manutenção](./docs/MAINTENANCE_GUIDE.md)**
- **[Padrões de Código](./docs/CODING_STANDARDS.md)**

### 🐛 Troubleshooting
- **[Google Sheets Issues](./docs/GOOGLE_SHEETS_TROUBLESHOOTING.md)**
- **[Deploy Issues](./docs/VERCEL_PRODUCTION_TROUBLESHOOTING.md)**
- **[Soluções Comuns](./docs/DEPLOY_SOLUTION.md)**

## 🤝 Contribuindo

### 📝 Processo de Contribuição
1. **Fork** o repositório
2. **Crie** uma branch feature (`git checkout -b feature/nova-funcionalidade`)
3. **Implemente** seguindo os padrões do projeto
4. **Adicione** testes e documentação
5. **Commit** com mensagens claras
6. **Push** para sua branch
7. **Abra** um Pull Request

### 🔍 Code Review
- Todos os PRs passam por review
- Testes automatizados devem passar
- Cobertura de código mantida
- Documentação atualizada

### 📋 Padrões de Commit
```
feat: adiciona nova funcionalidade
fix: corrige bug específico
docs: atualiza documentação
style: formatação de código
refactor: refatoração sem mudança funcional
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

## 🆘 Suporte e Comunidade

### 💬 Canais de Comunicação
- **Issues:** Para bugs e feature requests
- **Discussions:** Para dúvidas e ideias
- **Wiki:** Documentação colaborativa

### 🔗 Links Úteis
- **[Lovable Project](https://lovable.dev/projects/a5000ca9-1e80-40d8-9189-70c943085cf7)**
- **[Vercel Dashboard](https://vercel.com/dashboard)**
- **[Google Cloud Console](https://console.cloud.google.com/)**

### 📞 Contato
- **Maintainer:** [Nome do Responsável]
- **Email:** [email@exemplo.com]
- **Slack:** [#finthrix-dev]

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](./LICENSE).

## 🙏 Agradecimentos

- **shadcn/ui** - Design system components
- **Vercel** - Platform de deploy
- **Google** - Sheets API e OAuth
- **Comunidade Open Source** - Bibliotecas e ferramentas

---

**⭐ Se este projeto foi útil, considere dar uma estrela!**
