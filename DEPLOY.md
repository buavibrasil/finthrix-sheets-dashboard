# 🚀 Guia de Deploy - FinThrix Dashboard

## 📋 Pré-requisitos

- ✅ Build da aplicação concluído (`npm run build`)
- ✅ Configurações do Google Sheets funcionando
- ✅ Conta no GitHub (para conectar com Vercel)

## 🎯 Deploy na Vercel (Recomendado)

### 1. Preparação

1. **Faça commit de todas as alterações:**
   ```bash
   git add .
   git commit -m "feat: preparar para deploy"
   git push origin main
   ```

2. **Acesse:** https://vercel.com
3. **Faça login** com sua conta GitHub

### 2. Configuração do Projeto

1. **Clique em "New Project"**
2. **Importe** seu repositório GitHub
3. **Configure as seguintes opções:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 3. Variáveis de Ambiente

**IMPORTANTE:** Configure estas variáveis na Vercel:

```env
VITE_SUPABASE_PROJECT_ID=iiczfcfxgvuqvhqohnue
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpY3pmY2Z4Z3Z1cXZocW9obnVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNTk2MzMsImV4cCI6MjA3NDczNTYzM30.VnWWXur1M6FGcvEdIHj-6FzUZZt33bp7MPZu1R9rz1U
VITE_SUPABASE_URL=https://iiczfcfxgvuqvhqohnue.supabase.co
VITE_GOOGLE_CLIENT_ID=413802157-g31n250c8tqmg72rq5kr52l3knss1se9.apps.googleusercontent.com
VITE_GOOGLE_SPREADSHEET_ID=1TlJA8hQgYl8SW6muRjvOxEAQgPyW-3XSsGJiY16u6TA
```

### 4. Deploy

1. **Clique em "Deploy"**
2. **Aguarde** o processo de build (2-5 minutos)
3. **Acesse** a URL gerada pela Vercel

## 🔧 Configuração do Google OAuth

**IMPORTANTE:** Após o deploy, você precisa:

1. **Acesse:** https://console.developers.google.com
2. **Vá em:** APIs & Services > Credentials
3. **Edite** seu OAuth 2.0 Client ID
4. **Adicione** a URL da Vercel em "Authorized JavaScript origins":
   ```
   https://seu-projeto.vercel.app
   ```

## 🧪 Teste Pós-Deploy

1. **Acesse** sua aplicação na URL da Vercel
2. **Teste** a conexão com Google Sheets
3. **Verifique** se os dados carregam corretamente
4. **Monitore** os logs no painel da Vercel

## 🚨 Troubleshooting

### Erro de CORS
- Verifique se a URL da Vercel está nas origens autorizadas do Google

### Variáveis de ambiente não funcionam
- Confirme se todas as variáveis estão configuradas na Vercel
- Verifique se os nomes estão corretos (com prefixo `VITE_`)

### Build falha
- Execute `npm run build` localmente primeiro
- Verifique se não há erros de TypeScript

## 📊 Monitoramento

- **Logs:** Acesse o painel da Vercel > Functions > View Function Logs
- **Analytics:** Ative o Vercel Analytics para métricas
- **Performance:** Use o Web Vitals integrado

## 🔄 Deploy Automático

Após a configuração inicial, todo `git push` para a branch `main` fará deploy automático!

---

**🎉 Sua aplicação FinThrix estará online e acessível globalmente!**