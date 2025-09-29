# 🚀 Deploy Automático GitHub + Vercel - FinThrix Dashboard

Este guia explica como configurar e usar o deploy automático via GitHub + Vercel para o FinThrix Dashboard.

## 📋 Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Vercel](https://vercel.com)
- Configurações do Google OAuth já configuradas
- Projeto Supabase configurado

## 🔧 Configuração Inicial

### 1. Criar Repositório no GitHub

1. **Acesse:** https://github.com/new
2. **Nome:** `finthrix-sheets-dashboard` (ou nome de sua escolha)
3. **Visibilidade:** Public ou Private
4. **NÃO** inicialize com README (já temos um)
5. **Clique em:** "Create repository"

### 2. Conectar Repositório Local ao GitHub

```bash
# Adicionar remote origin
git remote add origin https://github.com/SEU_USUARIO/finthrix-sheets-dashboard.git

# Push inicial
git branch -M main
git push -u origin main
```

### 3. Conectar GitHub ao Vercel

1. **Acesse:** https://vercel.com/dashboard
2. **Clique em:** "New Project"
3. **Selecione:** "Import Git Repository"
4. **Escolha:** Seu repositório `finthrix-sheets-dashboard`
5. **Configure:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

## 🔐 Configuração de Variáveis de Ambiente

### No Vercel Dashboard

1. **Vá para:** Project Settings > Environment Variables
2. **Adicione as seguintes variáveis:**

```env
# Supabase
VITE_SUPABASE_PROJECT_ID=seu-projeto-id
VITE_SUPABASE_ANON_KEY=sua-chave-publica
VITE_SUPABASE_URL=https://seu-projeto.supabase.co

# Google OAuth
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com

# Google Sheets
VITE_GOOGLE_SPREADSHEET_ID=id-da-sua-planilha
```

### Para GitHub Actions (Opcional)

Se quiser usar CI/CD com GitHub Actions:

1. **Vá para:** Repositório > Settings > Secrets and variables > Actions
2. **Adicione os secrets:**

```env
# Variáveis da aplicação
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_URL
VITE_GOOGLE_CLIENT_ID
VITE_GOOGLE_SPREADSHEET_ID

# Tokens do Vercel (opcional para GitHub Actions)
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

## 🌐 Configuração OAuth para Produção

### Google Cloud Console

1. **Acesse:** https://console.cloud.google.com/apis/credentials
2. **Edite** seu OAuth 2.0 Client ID
3. **Adicione às "Origens JavaScript autorizadas":**

```
https://seu-projeto.vercel.app
https://finthrix-sheets-dashboard.vercel.app
```

**Nota:** Substitua pela URL real do seu deploy Vercel.

## 🔄 Fluxo de Deploy Automático

### Como Funciona

1. **Push para main:** Qualquer commit na branch `main` dispara o deploy
2. **Build automático:** Vercel executa `npm run build` automaticamente
3. **Deploy instantâneo:** Nova versão fica disponível em segundos
4. **Preview deploys:** PRs geram URLs de preview automáticas

### Comandos para Deploy

```bash
# Desenvolvimento local
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Deploy automático acontece automaticamente! 🎉
```

## 📊 Características do Deploy Automático

### ✅ Vantagens

- **Deploy instantâneo:** Commits na main = deploy automático
- **Preview deploys:** Cada PR gera uma URL de preview
- **Rollback fácil:** Voltar para versões anteriores com 1 clique
- **CDN global:** Performance otimizada mundialmente
- **HTTPS automático:** SSL/TLS configurado automaticamente
- **Domínio personalizado:** Fácil configuração de domínio próprio

### 🚀 Performance Otimizada

- **Cache inteligente:** Assets com cache de 1 ano
- **Compressão:** Gzip/Brotli automático
- **Headers de segurança:** XSS, CSRF, etc.
- **Edge functions:** Execução próxima ao usuário

## 🔍 Monitoramento e Analytics

### Vercel Analytics

1. **Ative** no dashboard do Vercel
2. **Monitore:**
   - Page views
   - Performance metrics
   - Core Web Vitals
   - User sessions

### Logs e Debugging

- **Function logs:** Logs em tempo real
- **Build logs:** Histórico completo de builds
- **Error tracking:** Erros automáticos capturados

## 🚨 Troubleshooting

### Deploy Falha

**Problema:** Build falha no Vercel
**Soluções:**
1. Verifique variáveis de ambiente
2. Teste build local: `npm run build`
3. Verifique logs no Vercel dashboard

### Variáveis de Ambiente

**Problema:** App não funciona após deploy
**Soluções:**
1. Verifique se todas as variáveis estão configuradas
2. Certifique-se que começam com `VITE_`
3. Redeploy após adicionar variáveis

### OAuth Não Funciona

**Problema:** Erro de autenticação Google
**Soluções:**
1. Adicione URL do Vercel no Google Cloud Console
2. Aguarde propagação (até 5 minutos)
3. Teste em aba anônima

## 📈 Otimizações Avançadas

### 1. Domínio Personalizado

```bash
# No Vercel Dashboard
Project Settings > Domains > Add Domain
```

### 2. Configurações de Performance

O `vercel.json` já está otimizado com:
- Cache headers otimizados
- Security headers
- Compressão automática

### 3. Monitoramento Avançado

```bash
# Instalar Vercel CLI
npm i -g vercel

# Ver logs em tempo real
vercel logs
```

## 🔄 Workflow Recomendado

### Desenvolvimento

```bash
# 1. Criar branch para feature
git checkout -b feature/nova-funcionalidade

# 2. Desenvolver e testar localmente
npm run dev

# 3. Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin feature/nova-funcionalidade

# 4. Criar Pull Request
# - Vercel gera preview deploy automaticamente
# - Testar no preview deploy

# 5. Merge para main
# - Deploy automático para produção
```

## 📱 URLs Importantes

Após configurar, você terá:

- **Produção:** https://seu-projeto.vercel.app
- **Dashboard:** https://vercel.com/dashboard
- **Analytics:** https://vercel.com/analytics
- **Logs:** https://vercel.com/logs

## 🎯 Próximos Passos

1. **Configure** domínio personalizado
2. **Ative** Vercel Analytics
3. **Configure** alertas de erro
4. **Documente** processo para equipe
5. **Configure** staging environment (opcional)

## 📞 Suporte

### Recursos Úteis

- **Vercel Docs:** https://vercel.com/docs
- **GitHub Actions:** https://docs.github.com/actions
- **Troubleshooting:** Verifique logs no Vercel dashboard

### Comandos Úteis

```bash
# Ver status do deploy
vercel ls

# Ver logs
vercel logs

# Deploy manual (se necessário)
vercel --prod
```

---

**🎉 Parabéns! Seu FinThrix Dashboard agora tem deploy automático!**

Cada commit na branch `main` será automaticamente deployado para produção. 🚀