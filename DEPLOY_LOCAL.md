# 🚀 Deploy Local - FinThrix Dashboard

Este guia explica como fazer o deploy local da aplicação FinThrix em modo de produção.

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- NPM instalado
- Configurações do Google OAuth já configuradas
- Variáveis de ambiente configuradas no `.env`

## 🛠️ Scripts Disponíveis

### Deploy Completo (Recomendado)
```bash
npm run deploy:local
```
Este comando:
1. Faz o build de produção (`npm run build`)
2. Inicia o servidor local de produção (`npm run preview`)

### Apenas Servidor de Produção
```bash
npm run start:prod
```
Inicia apenas o servidor de produção (requer build prévio)

### Build Manual + Servidor
```bash
# 1. Build de produção
npm run build

# 2. Iniciar servidor
npm run preview
```

## 🌐 URLs de Acesso

Após executar o deploy local, a aplicação estará disponível em:

- **Local:** http://localhost:4173/
- **Rede:** Várias IPs da rede local (mostradas no terminal)

## 🔧 Configuração de Produção

### 1. Variáveis de Ambiente
Certifique-se de que o arquivo `.env` está configurado:

```env
# Supabase
VITE_SUPABASE_PROJECT_ID="seu-projeto-id"
VITE_SUPABASE_ANON_KEY="sua-chave-publica"
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"

# Google OAuth
VITE_GOOGLE_CLIENT_ID="seu-client-id.apps.googleusercontent.com"

# Google Sheets
VITE_GOOGLE_SPREADSHEET_ID="id-da-sua-planilha"
```

### 2. Google OAuth - Origens Autorizadas
No Google Cloud Console, adicione às "Origens JavaScript autorizadas":

```
http://localhost:4173
http://127.0.0.1:4173
```

## 📊 Características do Deploy Local

### ✅ Vantagens
- **Performance otimizada:** Código minificado e otimizado
- **Ambiente de produção:** Simula exatamente o ambiente real
- **Sem dependências externas:** Roda completamente offline
- **Controle total:** Você tem controle completo sobre o ambiente
- **Debugging:** Ainda permite debugging se necessário

### 📈 Métricas de Build
- **Tamanho do CSS:** ~64KB (11KB gzipped)
- **Tamanho do JS:** ~984KB (282KB gzipped)
- **Tempo de build:** ~10 segundos

## 🔍 Monitoramento e Debugging

A aplicação inclui sistema completo de monitoramento:

- **SystemMonitor:** Monitora performance em tempo real
- **Console logs:** Logs detalhados de todas as operações
- **Error tracking:** Captura e exibe erros automaticamente
- **Network monitoring:** Monitora requisições HTTP

## 🚨 Troubleshooting

### Problema: Erro de autenticação Google
**Solução:** Adicione `http://localhost:4173` nas origens autorizadas do Google Cloud Console

### Problema: Aplicação não carrega
**Solução:** 
1. Verifique se o build foi feito: `npm run build`
2. Verifique se a pasta `dist` existe
3. Reinicie o servidor: `npm run preview`

### Problema: Variáveis de ambiente não funcionam
**Solução:**
1. Verifique se o arquivo `.env` existe
2. Certifique-se de que as variáveis começam com `VITE_`
3. Refaça o build: `npm run build`

## 📁 Estrutura de Deploy

```
dist/
├── index.html              # Página principal
├── assets/
│   ├── index-[hash].css    # Estilos otimizados
│   └── index-[hash].js     # JavaScript otimizado
├── favicon.ico
└── robots.txt
```

## 🔄 Processo de Atualização

Para atualizar a aplicação em produção local:

1. **Pare o servidor** (Ctrl+C no terminal)
2. **Faça suas alterações** no código
3. **Execute o deploy:** `npm run deploy:local`

## 🌟 Próximos Passos

Após confirmar que tudo funciona localmente:

1. **Backup:** Faça backup da configuração atual
2. **Documentação:** Documente qualquer configuração específica
3. **Monitoramento:** Configure alertas se necessário
4. **Automação:** Considere criar scripts de automação

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no terminal
2. Abra o console do navegador (F12)
3. Verifique o SystemMonitor na aplicação
4. Consulte a documentação do Google OAuth

---

**✨ Sua aplicação FinThrix está rodando em produção local!**

Acesse: http://localhost:4173/