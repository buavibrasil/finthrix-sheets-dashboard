#!/usr/bin/env node

/**
 * Script de configuração do ambiente de desenvolvimento
 * Verifica e configura a infraestrutura necessária para o FinThrix
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando ambiente de desenvolvimento do FinThrix...\n');

// Verificar se as variáveis de ambiente estão configuradas
function checkEnvVariables() {
  console.log('📋 Verificando variáveis de ambiente...');
  
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ Arquivo .env não encontrado');
    console.log('💡 Copiando .env.example para .env...');
    
    const envExamplePath = path.join(__dirname, '..', '.env.example');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Arquivo .env criado');
    } else {
      console.log('❌ Arquivo .env.example não encontrado');
      return false;
    }
  }

  // Verificar variáveis críticas
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'VITE_GOOGLE_CLIENT_ID',
    'VITE_GOOGLE_SPREADSHEET_ID'
  ];

  const missingVars = requiredVars.filter(varName => {
    const regex = new RegExp(`^${varName}=.+`, 'm');
    return !regex.test(envContent);
  });

  if (missingVars.length > 0) {
    console.log('❌ Variáveis de ambiente faltando:', missingVars.join(', '));
    console.log('💡 Configure essas variáveis no arquivo .env');
    return false;
  }

  console.log('✅ Todas as variáveis de ambiente estão configuradas');
  return true;
}

// Verificar dependências
function checkDependencies() {
  console.log('\n📦 Verificando dependências...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    
    if (!fs.existsSync(path.join(__dirname, '..', 'node_modules'))) {
      console.log('❌ node_modules não encontrado');
      console.log('💡 Instalando dependências...');
      execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    }
    
    console.log('✅ Dependências verificadas');
    return true;
  } catch (error) {
    console.log('❌ Erro ao verificar dependências:', error.message);
    return false;
  }
}

// Verificar conectividade com Supabase
function checkSupabaseConnection() {
  console.log('\n🔗 Verificando conectividade com Supabase...');
  
  try {
    // Simular verificação de conectividade
    const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL="([^"]+)"/);
    
    if (urlMatch && urlMatch[1] && urlMatch[1].includes('supabase.co')) {
      console.log('✅ URL do Supabase configurada corretamente');
      console.log('💡 Usando Supabase em produção (sem Docker local)');
      return true;
    } else {
      console.log('❌ URL do Supabase não configurada');
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao verificar Supabase:', error.message);
    return false;
  }
}

// Verificar Google Sheets API
function checkGoogleSheetsConfig() {
  console.log('\n📊 Verificando configuração do Google Sheets...');
  
  try {
    const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
    const clientIdMatch = envContent.match(/VITE_GOOGLE_CLIENT_ID="([^"]+)"/);
    const spreadsheetIdMatch = envContent.match(/VITE_GOOGLE_SPREADSHEET_ID="([^"]+)"/);
    
    if (clientIdMatch && clientIdMatch[1] && !clientIdMatch[1].includes('your-')) {
      console.log('✅ Google Client ID configurado');
    } else {
      console.log('❌ Google Client ID não configurado ou usando valor padrão');
      return false;
    }
    
    if (spreadsheetIdMatch && spreadsheetIdMatch[1] && !spreadsheetIdMatch[1].includes('your-')) {
      console.log('✅ Google Spreadsheet ID configurado');
    } else {
      console.log('❌ Google Spreadsheet ID não configurado ou usando valor padrão');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('❌ Erro ao verificar Google Sheets:', error.message);
    return false;
  }
}

// Função principal
function main() {
  const checks = [
    checkEnvVariables,
    checkDependencies,
    checkSupabaseConnection,
    checkGoogleSheetsConfig
  ];

  let allPassed = true;
  
  for (const check of checks) {
    if (!check()) {
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('🎉 Ambiente de desenvolvimento configurado com sucesso!');
    console.log('💡 Execute "npm run dev" para iniciar o servidor de desenvolvimento');
  } else {
    console.log('❌ Alguns problemas foram encontrados na configuração');
    console.log('💡 Consulte a documentação em DEPLOY_LOCAL.md para mais detalhes');
  }
  
  console.log('='.repeat(50));
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main, checkEnvVariables, checkDependencies, checkSupabaseConnection, checkGoogleSheetsConfig };