#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para análise de bundle size e otimizações
 */

const DIST_DIR = path.join(__dirname, '../dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundle() {
  console.log('🔍 Analisando bundle size...\n');

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Diretório dist não encontrado. Execute "npm run build" primeiro.');
    process.exit(1);
  }

  const stats = {
    totalSize: 0,
    jsFiles: [],
    cssFiles: [],
    otherFiles: [],
    chunks: {}
  };

  function analyzeDirectory(dir, prefix = '') {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        analyzeDirectory(filePath, prefix + file + '/');
      } else {
        const size = stat.size;
        stats.totalSize += size;
        
        const fileInfo = {
          name: prefix + file,
          size: size,
          formattedSize: formatBytes(size)
        };

        if (file.endsWith('.js')) {
          stats.jsFiles.push(fileInfo);
          
          // Identificar chunks
          if (file.includes('-')) {
            const chunkName = file.split('-')[0];
            if (!stats.chunks[chunkName]) {
              stats.chunks[chunkName] = { files: [], totalSize: 0 };
            }
            stats.chunks[chunkName].files.push(fileInfo);
            stats.chunks[chunkName].totalSize += size;
          }
        } else if (file.endsWith('.css')) {
          stats.cssFiles.push(fileInfo);
        } else {
          stats.otherFiles.push(fileInfo);
        }
      }
    });
  }

  analyzeDirectory(DIST_DIR);

  // Ordenar por tamanho
  stats.jsFiles.sort((a, b) => b.size - a.size);
  stats.cssFiles.sort((a, b) => b.size - a.size);
  stats.otherFiles.sort((a, b) => b.size - a.size);

  // Relatório
  console.log('📊 RELATÓRIO DE BUNDLE SIZE');
  console.log('=' .repeat(50));
  console.log(`📦 Tamanho total: ${formatBytes(stats.totalSize)}`);
  console.log();

  // JavaScript files
  console.log('📄 Arquivos JavaScript:');
  stats.jsFiles.forEach(file => {
    const percentage = ((file.size / stats.totalSize) * 100).toFixed(1);
    console.log(`  ${file.name.padEnd(30)} ${file.formattedSize.padStart(10)} (${percentage}%)`);
  });
  console.log();

  // CSS files
  if (stats.cssFiles.length > 0) {
    console.log('🎨 Arquivos CSS:');
    stats.cssFiles.forEach(file => {
      const percentage = ((file.size / stats.totalSize) * 100).toFixed(1);
      console.log(`  ${file.name.padEnd(30)} ${file.formattedSize.padStart(10)} (${percentage}%)`);
    });
    console.log();
  }

  // Chunks analysis
  console.log('🧩 Análise de Chunks:');
  Object.entries(stats.chunks).forEach(([chunkName, chunk]) => {
    const percentage = ((chunk.totalSize / stats.totalSize) * 100).toFixed(1);
    console.log(`  ${chunkName.padEnd(20)} ${formatBytes(chunk.totalSize).padStart(10)} (${percentage}%)`);
    chunk.files.forEach(file => {
      console.log(`    └─ ${file.name}`);
    });
  });
  console.log();

  // Recomendações
  console.log('💡 RECOMENDAÇÕES:');
  console.log('=' .repeat(50));

  const largestJS = stats.jsFiles[0];
  if (largestJS && largestJS.size > 500 * 1024) { // 500KB
    console.log(`⚠️  Arquivo JS muito grande: ${largestJS.name} (${largestJS.formattedSize})`);
    console.log('   Considere dividir em chunks menores');
  }

  const totalJS = stats.jsFiles.reduce((sum, file) => sum + file.size, 0);
  if (totalJS > 1024 * 1024) { // 1MB
    console.log(`⚠️  Total de JS muito alto: ${formatBytes(totalJS)}`);
    console.log('   Considere lazy loading adicional');
  }

  if (Object.keys(stats.chunks).length < 3) {
    console.log('⚠️  Poucos chunks detectados');
    console.log('   Considere implementar mais code splitting');
  }

  const gzipEstimate = stats.totalSize * 0.3; // Estimativa de compressão gzip
  console.log();
  console.log(`📈 Estimativa com gzip: ${formatBytes(gzipEstimate)}`);
  
  if (gzipEstimate < 200 * 1024) {
    console.log('✅ Excelente! Bundle otimizado');
  } else if (gzipEstimate < 500 * 1024) {
    console.log('👍 Bom tamanho de bundle');
  } else {
    console.log('⚠️  Bundle pode ser otimizado');
  }
}

analyzeBundle();