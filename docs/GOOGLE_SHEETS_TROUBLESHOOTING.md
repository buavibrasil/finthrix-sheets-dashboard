# Solução de Problemas: Google Sheets API

Este documento contém informações para solucionar problemas comuns na integração com Google Sheets.

## Problema: Falha na Conexão com Google Sheets

### Sintomas
- Não é possível autenticar com o Google
- Erro de redirecionamento ou origem não autorizada
- Dados não são carregados da planilha

### Solução: Configurar Origens JavaScript Autorizadas

O problema mais comum é a falta de configuração das URLs de desenvolvimento nas "Origens JavaScript autorizadas" do Google Cloud Console.

#### URLs que devem estar configuradas:

**Produção:**
- `https://finthrix-sheets-dashboard-2xrjqhdnu-andreferraro.vercel.app` (URL do seu deploy na Vercel)

**Desenvolvimento:**
- `http://localhost:8080` (servidor de desenvolvimento)
- `http://127.0.0.1:8080` (alternativa localhost)
- `http://localhost:4173` (servidor de preview/produção local)
- `http://127.0.0.1:4173` (alternativa localhost para preview)

#### Passo a passo para adicionar URLs:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Selecione seu projeto
3. Navegue para "APIs e Serviços" → "Credenciais"
4. Clique na sua credencial OAuth 2.0
5. Na seção "Origens JavaScript autorizadas", adicione as URLs necessárias
6. Clique em "SALVAR"
7. Aguarde alguns minutos para as alterações propagarem

## Ferramenta de Diagnóstico

A aplicação inclui uma ferramenta de diagnóstico para identificar problemas com a integração Google Sheets:

1. Acesse a aplicação em modo de desenvolvimento
2. Localize o card "Diagnóstico Google Sheets" no topo da página
3. Clique em "Executar Diagnóstico" para verificar a configuração
4. Clique em "Testar Autenticação" para testar a conexão real

## Outros Problemas Comuns

### Erro: "redirect_uri_mismatch"
- **Causa**: A URL de redirecionamento não está configurada corretamente
- **Solução**: Verifique as "URIs de redirecionamento autorizados" no Google Cloud Console

### Erro: "Planilha não encontrada"
- **Causa**: ID da planilha incorreto ou sem permissão
- **Solução**: Verifique o ID da planilha em `.env` e certifique-se de que a planilha está compartilhada com a conta que está acessando

### Erro: "Dados não encontrados"
- **Causa**: Estrutura da planilha não corresponde ao esperado
- **Solução**: Verifique se a planilha tem as abas "Movimentações" e "Contas" com a estrutura correta

## Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estão configuradas no arquivo `.env`:

```
VITE_GOOGLE_CLIENT_ID=seu-client-id-do-google
VITE_GOOGLE_SPREADSHEET_ID=id-da-sua-planilha
```

## Suporte à Edge Function

A aplicação utiliza uma Edge Function do Supabase para acessar a API do Google Sheets. Certifique-se de que:

1. A função `google-sheets` está deployada no Supabase
2. Você está logado no Supabase CLI (`npx supabase login`)
3. As variáveis de ambiente do Supabase estão configuradas corretamente

## Recursos Adicionais

- [Documentação do Google Sheets API](https://developers.google.com/sheets/api)
- [Guia de Configuração do OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Documentação do Supabase Edge Functions](https://supabase.com/docs/guides/functions)