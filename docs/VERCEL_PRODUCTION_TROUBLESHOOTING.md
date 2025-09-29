# 🚨 Troubleshooting - Produção Vercel

## Problema: "Failed to send a request to the Edge Function"

### 🎯 **Causa Raiz**
A Edge Function do Supabase não está acessível ou não foi deployada corretamente.

### 🔧 **Soluções**

#### **1. Verificar Deploy da Edge Function**

```bash
# 1. Fazer login no Supabase
npx supabase login

# 2. Verificar se a função existe
npx supabase functions list

# 3. Re-deployar a função
npx supabase functions deploy google-sheets
```

#### **2. Testar a Edge Function Diretamente**

Teste a URL da função:
```
https://iiczfcfxgvuqvhqohnue.supabase.co/functions/v1/google-sheets
```

#### **3. Verificar Configuração de CORS**

A Edge Function deve ter headers CORS corretos:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

#### **4. Solução Alternativa - Implementação Direta**

Se a Edge Function não funcionar, use a implementação direta:

```typescript
// src/lib/google-sheets-direct.ts
export class GoogleSheetsDirectService {
  static async fetchData(accessToken: string, spreadsheetId: string, range: string) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      throw error;
    }
  }
}
```

### 🧪 **Teste Rápido**

1. **Acesse o Console do Supabase**: https://supabase.com/dashboard
2. **Vá em Edge Functions**
3. **Verifique se `google-sheets` está listada**
4. **Teste a função diretamente no painel**

### 📋 **Checklist de Verificação**

- [ ] Edge Function deployada no Supabase
- [ ] CORS configurado corretamente
- [ ] URL da função acessível
- [ ] Variáveis de ambiente corretas na Vercel
- [ ] Google Cloud Console com URLs corretas

### 🔄 **Deploy da Edge Function**

```bash
# No terminal local:
cd supabase/functions/google-sheets
npx supabase functions deploy google-sheets --project-ref iiczfcfxgvuqvhqohnue
```

### 🚀 **Solução Imediata**

Se precisar de uma solução rápida, modifique o serviço para usar a API direta do Google Sheets sem a Edge Function.