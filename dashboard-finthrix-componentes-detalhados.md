# Dashboard FinThrix - Especificação Detalhada dos Componentes

## 1. Cabeçalho e Filtros Globais

### 1.1 Título Principal
- **Localização**: Topo da página, alinhado à esquerda
- **Texto**: "Dashboard FinThrix - Visão Geral"
- **Hierarquia**: H1 principal da página
- **Comportamento**: Estático, sempre visível

### 1.2 Filtros Globais
**Layout**: Dispostos horizontalmente no cabeçalho, alinhados à direita

#### Filtro de Período
- **Tipo**: Dropdown/Select
- **Opções Padrão**:
  - "Últimos 7 dias" (selecionado por padrão)
  - "Mês Atual" 
  - "Personalizado"
- **Comportamento Personalizado**:
  - Ao selecionar "Personalizado", exibir dois campos de data (De/Até)
  - Validação: Data "De" não pode ser posterior à data "Até"
  - Limite máximo: 2 anos de histórico

#### Filtro de Tipo de Movimentação
- **Tipo**: Dropdown/Select
- **Opções**:
  - "Todas" (selecionado por padrão)
  - "Entradas"
  - "Saídas"
- **Comportamento**: Afeta gráficos e tabelas, mas não os KPIs de saldo

#### Filtro de Categoria
- **Tipo**: Dropdown/Select com busca
- **Opções**: Dinâmicas baseadas nas categorias do usuário
- **Comportamento**: 
  - "Todas as Categorias" como primeira opção
  - Lista alfabética das categorias cadastradas
  - Campo de busca para filtrar categorias

### 1.3 Aplicação de Filtros
- **Trigger**: Mudança automática ao selecionar qualquer filtro
- **Feedback**: Indicador de carregamento durante aplicação
- **Persistência**: Filtros mantidos durante a sessão do usuário

## 2. KPIs Principais (Cartões de Destaque)

### 2.1 Layout dos Cartões
- **Disposição**: Grid responsivo (4 colunas em desktop, 2 em tablet, 1 em mobile)
- **Espaçamento**: Margem consistente entre cartões
- **Ordem**: Saldo Atual → Entradas → Saídas → Contas a Pagar → Contas Vencidas

### 2.2 Estrutura de Cada Cartão

#### Saldo Atual
- **Título**: "Saldo Atual"
- **Valor**: Formato monetário com símbolo da moeda
- **Cor**: Verde para positivo, vermelho para negativo, cinza para zero
- **Ícone**: Símbolo de balança ou carteira
- **Cálculo**: Σ(Entradas) - Σ(Saídas) de todo o histórico

#### Total de Entradas
- **Título**: "Entradas no Período"
- **Valor**: Formato monetário
- **Cor**: Verde
- **Ícone**: Seta para cima ou símbolo de +
- **Indicador**: Comparação com período anterior (% de variação)

#### Total de Saídas
- **Título**: "Saídas no Período"
- **Valor**: Formato monetário
- **Cor**: Vermelho
- **Ícone**: Seta para baixo ou símbolo de -
- **Indicador**: Comparação com período anterior (% de variação)

#### Contas a Pagar (Próximos 7 dias)
- **Título**: "A Pagar (7 dias)"
- **Valor**: Formato monetário
- **Cor**: Laranja/Amarelo
- **Ícone**: Relógio ou calendário
- **Contador**: Número de contas entre parênteses

#### Contas Vencidas
- **Título**: "Contas Vencidas"
- **Valor**: Formato monetário
- **Cor**: Vermelho intenso
- **Ícone**: Exclamação ou alerta
- **Comportamento**: Piscar ou destacar se houver valores

### 2.3 Interatividade dos Cartões
- **Hover**: Efeito de elevação sutil
- **Click**: Navegação para detalhamento específico (se aplicável)
- **Tooltip**: Informações adicionais sobre o cálculo

## 3. Gráficos Interativos

### 3.1 Gráfico de Tendência (Linhas)
- **Título**: "Tendência de Entradas e Saídas"
- **Tipo**: Gráfico de linhas duplas
- **Eixo X**: Tempo (dias, semanas ou meses conforme período)
- **Eixo Y**: Valores monetários
- **Linhas**:
  - Verde: Entradas
  - Vermelha: Saídas
- **Interatividade**:
  - Hover: Tooltip com valores exatos e data
  - Zoom: Permitir zoom em períodos específicos
  - Legenda: Clicável para mostrar/ocultar linhas

### 3.2 Gráfico de Distribuição por Categoria
- **Título**: "Distribuição de Saídas por Categoria"
- **Tipo**: Gráfico de rosca (donut) ou barras horizontais
- **Dados**: Apenas saídas agrupadas por categoria
- **Cores**: Paleta consistente para cada categoria
- **Interatividade**:
  - Hover: Percentual e valor absoluto
  - Click: Drill-down para movimentações da categoria
  - Legenda: Lista de categorias com cores correspondentes

### 3.3 Gráfico de Status das Contas
- **Título**: "Status das Contas a Pagar"
- **Tipo**: Gráfico de barras ou rosca
- **Categorias**:
  - Pendente (Azul)
  - Paga (Verde)
  - Vencida (Vermelho)
- **Interatividade**:
  - Hover: Quantidade e valor total
  - Click: Filtrar tabela de contas por status

### 3.4 Configurações Gerais dos Gráficos
- **Responsividade**: Adaptação automática ao tamanho da tela
- **Animações**: Transições suaves ao carregar e atualizar
- **Exportação**: Opção de salvar como imagem (PNG/SVG)
- **Acessibilidade**: Suporte a leitores de tela com descrições

## 4. Tabelas de Atividade Recente

### 4.1 Tabela de Últimas Movimentações

#### Estrutura das Colunas
1. **Data**: Formato DD/MM/AAAA, ordenação padrão (mais recente primeiro)
2. **Descrição**: Texto livre, máximo 50 caracteres visíveis
3. **Categoria**: Badge colorido com nome da categoria
4. **Tipo**: Ícone + texto (Entrada/Saída)
5. **Valor**: Formato monetário, cor verde/vermelha conforme tipo

#### Funcionalidades
- **Paginação**: 10 itens por página (configurável)
- **Ordenação**: Todas as colunas clicáveis
- **Busca**: Campo de busca global na tabela
- **Filtros**: Filtros rápidos por tipo e categoria
- **Ações**: Botões de editar/excluir por linha (se permitido)

### 4.2 Tabela de Próximas Contas a Pagar

#### Estrutura das Colunas
1. **Data de Vencimento**: Formato DD/MM/AAAA, destaque para vencidas
2. **Destinatário**: Nome da pessoa/empresa
3. **Valor Total**: Formato monetário
4. **Status**: Badge colorido (Pendente/Paga/Vencida)

#### Funcionalidades
- **Paginação**: 10 itens por página
- **Ordenação**: Por data de vencimento (padrão)
- **Filtros**: Por status e período de vencimento
- **Alertas**: Destaque visual para contas próximas ao vencimento
- **Ações**: Marcar como paga, editar, excluir

### 4.3 Comportamentos Comuns das Tabelas
- **Loading**: Skeleton loading durante carregamento
- **Empty State**: Mensagem amigável quando não há dados
- **Erro**: Tratamento de erros com opção de recarregar
- **Responsividade**: Scroll horizontal em telas pequenas
- **Seleção**: Checkbox para ações em lote (se aplicável)

## 5. Estados e Feedback do Sistema

### 5.1 Estados de Carregamento
- **Inicial**: Skeleton loading para todos os componentes
- **Filtros**: Spinner nos componentes afetados
- **Tabelas**: Loading overlay mantendo estrutura

### 5.2 Estados de Erro
- **Conexão**: Mensagem de erro com botão "Tentar Novamente"
- **Dados**: Fallback para dados em cache quando possível
- **Timeout**: Indicação clara de problema de conectividade

### 5.3 Estados Vazios
- **Sem Movimentações**: Ilustração + texto explicativo + CTA para adicionar
- **Sem Contas**: Orientação para cadastrar primeira conta
- **Filtros Sem Resultado**: Sugestão para ajustar filtros

### 5.4 Feedback de Ações
- **Sucesso**: Toast notifications discretas
- **Erro**: Mensagens claras com orientação de correção
- **Confirmação**: Modais para ações destrutivas

## 6. Responsividade e Adaptação

### 6.1 Breakpoints
- **Desktop**: > 1200px (layout completo)
- **Tablet**: 768px - 1199px (grid adaptado)
- **Mobile**: < 768px (layout empilhado)

### 6.2 Adaptações por Dispositivo
- **Mobile**: 
  - KPIs em coluna única
  - Gráficos com altura reduzida
  - Tabelas com scroll horizontal
  - Filtros em modal/drawer
- **Tablet**:
  - KPIs em 2 colunas
  - Gráficos lado a lado
  - Tabelas com paginação reduzida

### 6.3 Performance
- **Lazy Loading**: Gráficos carregados sob demanda
- **Debounce**: Filtros com delay para evitar requisições excessivas
- **Cache**: Dados frequentes mantidos em cache local
- **Otimização**: Imagens e ícones otimizados para diferentes densidades

## 7. Funcionalidades de Exportação

### 7.1 Botão de Exportação
- **Localização**: Cabeçalho da página, lado direito
- **Texto**: "Exportar Relatório"
- **Ícone**: Download icon (Lucide React)
- **Comportamento**: Abre modal com opções de exportação

### 7.2 Modal de Opções de Exportação
**Dimensões**: 320px de largura, altura automática
**Posicionamento**: Dropdown alinhado à direita do botão

#### Seleção de Formato
- **Opções Disponíveis**:
  - PDF: Para relatórios visuais com gráficos
  - Excel: Para análise de dados tabulares
- **Interface**: Botões toggle com ícones distintivos
- **Comportamento**: Seleção única, PDF como padrão

#### Opções de Conteúdo
**Checkboxes para incluir/excluir**:
- **Indicadores (KPIs)**: Sempre disponível
- **Gráficos**: Disponível apenas para PDF
- **Transações**: Lista completa de transações
- **Contas a Pagar**: Dados de contas pendentes

#### Estados do Botão
- **Normal**: Azul primário com ícone de download
- **Carregando**: Spinner animado + texto "Exportando..."
- **Erro**: Feedback via alert/toast
- **Sucesso**: Download automático do arquivo

### 7.3 Exportação PDF
**Características**:
- **Formato**: A4, orientação retrato
- **Cabeçalho**: Logo, título "Relatório Financeiro", data/hora
- **Conteúdo**: 
  - KPIs em grid responsivo
  - Gráficos capturados como imagens (html2canvas)
  - Tabelas formatadas com paginação automática
- **Rodapé**: Numeração de páginas, marca d'água

### 7.4 Exportação Excel
**Estrutura**:
- **Planilha "KPIs"**: Indicadores principais
- **Planilha "Transações"**: Lista completa com filtros aplicados
- **Planilha "Contas a Pagar"**: Dados de contas pendentes
- **Formatação**: Cabeçalhos em negrito, cores alternadas nas linhas

### 7.5 Tratamento de Erros
- **Validação**: Verificar se pelo menos uma opção está selecionada
- **Timeout**: Limite de 30 segundos para geração
- **Fallback**: Mensagem de erro amigável com opção de tentar novamente
- **Log**: Erros registrados no console para debugging

## 8. Gráficos Expandidos

### 8.1 Novos Tipos de Gráfico Implementados

#### Gráfico de Barras (BarChart)
- **Uso**: Comparação de categorias mensais
- **Localização**: Seção "Comparação Mensal por Categoria"
- **Dados**: Receitas e despesas por categoria
- **Interatividade**: Tooltips com valores formatados em moeda
- **Responsividade**: Altura adaptável, labels rotacionadas em mobile

#### Gráfico de Área (AreaChart)
- **Uso**: Visualização de fluxo de caixa acumulado
- **Localização**: Seção "Fluxo de Caixa Acumulado"
- **Dados**: Evolução temporal do saldo
- **Características**: 
  - Área preenchida com gradiente
  - Suporte a múltiplas séries (stacked)
  - Eixo Y formatado em moeda brasileira

#### Gráfico de Barras Horizontal
- **Uso**: Ranking de categorias de gastos
- **Localização**: Seção "Top Categorias de Gastos"
- **Dados**: Top 10 categorias por valor gasto
- **Layout**: Orientação horizontal para melhor legibilidade de labels

### 8.2 Configurações Comuns dos Gráficos
- **Biblioteca**: Chart.js com react-chartjs-2
- **Responsividade**: `maintainAspectRatio: false`
- **Tooltips**: Formatação em Real brasileiro (R$)
- **Cores**: Paleta consistente com design system
- **Animações**: Transições suaves de 750ms
- **Acessibilidade**: Labels descritivos para screen readers

### 8.3 Integração com Dados
- **Fonte**: Mock data estruturado em `mockData.ts`
- **Formato**: Compatível com Chart.js datasets
- **Atualização**: Reativa aos filtros aplicados
- **Performance**: Memoização para evitar re-renders desnecessários

## 9. PWA (Progressive Web App)

### 9.1 Service Worker
- **Arquivo**: `public/sw.js`
- **Estratégia**: Cache-first para assets estáticos
- **Funcionalidades**:
  - Cache de recursos críticos
  - Funcionamento offline básico
  - Atualizações automáticas

### 9.2 Manifest
- **Arquivo**: `public/manifest.json`
- **Configurações**:
  - Nome: "FinThrix Dashboard"
  - Tema: Azul primário (#3B82F6)
  - Ícones: Múltiplos tamanhos (72x72, 144x144, etc.)
  - Display: "standalone"

### 9.3 Ícones e Splash Screens
- **Formato**: SVG para escalabilidade
- **Tamanhos**: 72x72, 144x144, 192x192, 512x512
- **Design**: Logo circular com gráfico financeiro
- **Splash Screens**: Configurados para iOS e Android

### 9.4 Notificações
- **Componente**: `PWANotifications`
- **Funcionalidades**:
  - Prompt para instalação
  - Notificação de atualizações
  - Feedback de status offline/online