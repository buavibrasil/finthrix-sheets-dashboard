import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configuração de CORS mais restritiva e segura
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://finthrix-sheets-dashboard-2xrjqhdnu-andreferraro.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400', // Cache preflight por 24h
  // Headers de segurança
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'none'; script-src 'none'"
}

// Rate limiting simples (em produção, usar Redis ou similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const MAX_REQUESTS = 100
const WINDOW_MS = 15 * 60 * 1000 // 15 minutos

/**
 * Valida e sanitiza parâmetros de entrada
 */
function validateAndSanitizeInput(data: any) {
  const { access_token, spreadsheet_id, range } = data

  // Validação de presença
  if (!access_token || !spreadsheet_id || !range) {
    throw new Error('Parâmetros obrigatórios ausentes: access_token, spreadsheet_id, range')
  }

  // Validação de tipos
  if (typeof access_token !== 'string' || typeof spreadsheet_id !== 'string' || typeof range !== 'string') {
    throw new Error('Todos os parâmetros devem ser strings')
  }

  // Validação de formato do token
  if (!/^[A-Za-z0-9._-]{50,}$/.test(access_token)) {
    throw new Error('Token de acesso inválido')
  }

  // Validação de formato do spreadsheet_id
  if (!/^[A-Za-z0-9_-]{44}$/.test(spreadsheet_id)) {
    throw new Error('ID da planilha inválido')
  }

  // Validação de formato do range
  if (!/^[A-Za-z0-9!:]+$/.test(range)) {
    throw new Error('Range inválido')
  }

  // Sanitização (remoção de caracteres perigosos)
  return {
    access_token: access_token.trim(),
    spreadsheet_id: spreadsheet_id.trim(),
    range: range.trim()
  }
}

/**
 * Implementa rate limiting básico
 */
function checkRateLimit(clientIP: string): boolean {
  const now = Date.now()
  const userRequests = rateLimitMap.get(clientIP)

  if (!userRequests || now > userRequests.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + WINDOW_MS })
    return true
  }

  if (userRequests.count >= MAX_REQUESTS) {
    return false
  }

  userRequests.count++
  return true
}

/**
 * Log seguro que remove dados sensíveis
 */
function secureLog(level: 'info' | 'error', message: string, data?: any) {
  const sanitizedData = data ? JSON.parse(JSON.stringify(data, (key, value) => {
    const sensitiveFields = ['access_token', 'token', 'authorization', 'bearer']
    return sensitiveFields.some(field => key.toLowerCase().includes(field)) ? '[REDACTED]' : value
  })) : undefined

  const logEntry = {
    level,
    message,
    data: sanitizedData,
    timestamp: new Date().toISOString()
  }

  if (level === 'error') {
    console.error(logEntry)
  } else {
    console.log(logEntry)
  }
}

serve(async (req) => {
  // Tratamento de preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Apenas aceita POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(clientIP)) {
      secureLog('error', 'Rate limit excedido', { clientIP })
      return new Response(
        JSON.stringify({ error: 'Muitas requisições. Tente novamente em 15 minutos.' }),
        { 
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '900' // 15 minutos
          }
        }
      )
    }

    // Parse e validação do JSON
    let requestData
    try {
      requestData = await req.json()
    } catch (error) {
      throw new Error('JSON inválido')
    }

    // Validação e sanitização dos parâmetros
    const { access_token, spreadsheet_id, range } = validateAndSanitizeInput(requestData)

    secureLog('info', 'Requisição validada', { spreadsheet_id, range, clientIP })

    // Construção segura da URL
    const baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets'
    const url = `${baseUrl}/${encodeURIComponent(spreadsheet_id)}/values/${encodeURIComponent(range)}`
    
    // Requisição para Google Sheets API com timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'FinThrix-Dashboard/1.0'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      secureLog('error', 'Erro da API Google Sheets', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorText.substring(0, 200) // Limita tamanho do log
      })
      
      // Não expor detalhes internos da API
      const userMessage = response.status === 403 
        ? 'Acesso negado. Verifique as permissões da planilha.'
        : response.status === 404
        ? 'Planilha ou range não encontrado.'
        : 'Erro ao acessar Google Sheets.'
        
      throw new Error(userMessage)
    }

    const data = await response.json()
    
    // Validação básica da resposta
    if (!data || typeof data !== 'object') {
      throw new Error('Resposta inválida da API Google Sheets')
    }

    secureLog('info', 'Requisição bem-sucedida', { 
      rowCount: data.values?.length || 0,
      clientIP 
    })
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=300' // Cache por 5 minutos
        }
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
    
    secureLog('error', 'Erro na função google-sheets', { 
      error: errorMessage,
      stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined
    })
    
    // Determina o status code apropriado
    let statusCode = 500
    if (errorMessage.includes('inválido') || errorMessage.includes('ausentes')) {
      statusCode = 400
    } else if (errorMessage.includes('Acesso negado')) {
      statusCode = 403
    } else if (errorMessage.includes('não encontrado')) {
      statusCode = 404
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})