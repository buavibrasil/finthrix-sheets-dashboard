# Configuração das Integrações Google

Este documento descreve como configurar as integrações com Google Sheets e Google OAuth para o FinThrix.

## Pré-requisitos

1. Conta Google ativa
2. Acesso ao Google Cloud Console
3. Planilha Google Sheets criada

## 1. Configuração do Google Cloud Console

### 1.1 Criar um Projeto

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em "Selecionar projeto" no topo da página
3. Clique em "Novo projeto"
4. Digite um nome para o projeto (ex: "FinThrix Dashboard")
5. Clique em "Criar"

### 1.2 Habilitar APIs

1. No menu lateral, vá para "APIs e serviços" > "Biblioteca"
2. Procure e habilite as seguintes APIs:
   - **Google Sheets API**
   - **Google Drive API** (opcional, para acesso a arquivos)

### 1.3 Configurar OAuth 2.0

1. Vá para "APIs e serviços" > "Credenciais"
2. Clique em "Criar credenciais" > "ID do cliente OAuth"
3. Selecione "Aplicativo da Web"
4. Configure:
   - **Nome**: FinThrix Dashboard
   - **Origens JavaScript autorizadas**: 
     - `http://localhost:3000`
     - `http://localhost:5173`
     - `http://localhost:8080`
     - `http://127.0.0.1:8080`
     - Adicione outros domínios conforme necessário
   - **URIs de redirecionamento autorizados**: (deixe vazio para aplicações SPA)
5. Clique em "Criar"
6. **Copie o Client ID** gerado

### 1.4 Troubleshooting - Erro redirect_uri_mismatch

Se você receber o erro **"Erro 400: redirect_uri_mismatch"**, siga estes passos:

1. **Acesse:** https://console.cloud.google.com/
2. **Vá para:** APIs e serviços > Credenciais
3. **Encontre** seu OAuth 2.0 Client ID
4. **Clique no ícone de edição** (lápis)
5. **Na seção "Origens JavaScript autorizadas"**, certifique-se de que estão incluídas:
   - `http://localhost:3000`
   - `http://localhost:5173`
   - `http://localhost:8080`
   - `http://127.0.0.1:8080`
6. **Clique em "Salvar"**
7. **Aguarde** alguns segundos para propagação
8. **Teste** novamente a autenticação

**Nota:** O erro ocorre quando a URL atual (`http://localhost:8080`) não está listada nas origens autorizadas do Google OAuth.

## 2. Configuração da Planilha Google Sheets

### 2.1 Criar a Planilha

1. Acesse [Google Sheets](https://sheets.google.com)
2. Crie uma nova planilha
3. Renomeie para "FinThrix Data" (ou nome de sua preferência)

### 2.2 Estrutura das Abas

#### Aba "Movimentações"
Colunas (A-F):
- **A**: Data (formato: DD/MM/AAAA)
- **B**: Transação (descrição)
- **C**: Categoria
- **D**: Entrada (valor numérico)
- **E**: Saída (valor numérico)
- **F**: Mês (formato: AAAA-MM)

#### Aba "Contas"
Colunas (A-D):
- **A**: Data Fatura (formato: DD/MM/AAAA)
- **B**: Número Fatura
- **C**: Total (valor numérico)
- **D**: Destinatário

### 2.3 Obter o Spreadsheet ID

1. Abra sua planilha no Google Sheets
2. Na URL, copie o ID entre `/d/` e `/edit`:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

## 3. Configuração do Projeto

### 3.1 Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto e adicione:

```env
# Configurações Google
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
VITE_GOOGLE_SPREADSHEET_ID=seu-spreadsheet-id

# Configurações Supabase (já existentes)
VITE_SUPABASE_URL=sua-url-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-supabase
```

### 3.2 Exemplo de Configuração

```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
VITE_GOOGLE_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

## 4. Configuração do Supabase (Edge Functions)

### 4.1 Função Google Sheets

Certifique-se de que a Edge Function `google-sheets` está configurada no Supabase para:
- Receber `access_token`, `spreadsheet_id` e `range`
- Fazer requisições para a Google Sheets API
- Retornar os dados formatados

### 4.2 Exemplo de Edge Function

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { access_token, spreadsheet_id, range } = await req.json()
  
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${range}`,
    {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    }
  )
  
  const data = await response.json()
  
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  })
})
```

## 5. Testando a Integração

### 5.1 Verificações

1. **Variáveis de ambiente**: Confirme que estão configuradas corretamente
2. **Planilha**: Verifique se as abas e colunas estão corretas
3. **Permissões**: Certifique-se de que a planilha está acessível

### 5.2 Teste no Aplicativo

1. Inicie o servidor de desenvolvimento: `npm run dev`
2. Acesse `http://localhost:8080`
3. Clique em "Conectar Google Sheets"
4. Autorize o acesso quando solicitado
5. Verifique se os dados são carregados corretamente

## 6. Solução de Problemas

### Erros Comuns

1. **"Google Client ID não configurado"**
   - Verifique se `VITE_GOOGLE_CLIENT_ID` está no `.env`
   - Reinicie o servidor de desenvolvimento

2. **"Google Spreadsheet ID não configurado"**
   - Verifique se `VITE_GOOGLE_SPREADSHEET_ID` está no `.env`
   - Confirme se o ID está correto

3. **"Acesso negado"**
   - Verifique se as APIs estão habilitadas no Google Cloud
   - Confirme se o domínio está nas origens autorizadas

4. **"Dados não carregam"**
   - Verifique se a planilha tem as abas corretas
   - Confirme se há dados nas planilhas
   - Verifique os logs do console do navegador

### Logs de Debug

Para debug, abra o console do navegador (F12) e verifique:
- Erros de autenticação
- Respostas da API
- Status das requisições

## 7. Segurança

### Boas Práticas

1. **Nunca commite** o arquivo `.env` no repositório
2. **Use domínios específicos** nas origens autorizadas
3. **Monitore o uso** das APIs no Google Cloud Console
4. **Revogue tokens** quando necessário

### Limitações da API

- Google Sheets API: 100 requisições por 100 segundos por usuário
- Quotas podem variar conforme o tipo de conta Google

## 8. Próximos Passos

Após a configuração:

1. Teste todas as funcionalidades
2. Configure ambientes de produção
3. Implemente cache para reduzir chamadas à API
4. Configure monitoramento de erros
5. Documente processos para a equipe

---

**Nota**: Mantenha suas credenciais seguras e nunca as compartilhe publicamente.