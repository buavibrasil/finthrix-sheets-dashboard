# Dashboard FinThrix - Clarificações e Definições

## Clarificações Resolvidas

### 1. Níveis de Permissão de Usuário
**Definição**: Sistema com permissões baseadas em perfis de usuário

#### Perfis de Usuário:
- **Usuário Básico**: 
  - Visualiza apenas seus próprios dados financeiros
  - Acesso completo ao dashboard pessoal
  - Não pode visualizar dados de outros usuários

- **Usuário Familiar**: 
  - Visualiza dados da família/grupo compartilhado
  - Pode alternar entre visão pessoal e familiar
  - Filtro adicional "Minha Conta" vs "Conta Familiar"

- **Administrador**: 
  - Acesso a relatórios consolidados (se aplicável)
  - Gestão de usuários e permissões
  - Configurações globais do sistema

#### Implementação no Dashboard:
- Filtro de "Conta" no cabeçalho (apenas para usuários com múltiplas contas)
- Dados sempre filtrados por permissão do usuário logado
- Indicador visual do perfil ativo no cabeçalho

### 2. Fonte de Dados em Tempo Real
**Definição**: Sistema de atualização híbrida com cache inteligente

#### Frequência de Atualização:
- **KPIs Principais**: Atualização a cada 30 segundos
- **Gráficos**: Atualização a cada 2 minutos
- **Tabelas**: Atualização a cada 1 minuto
- **Ações do Usuário**: Atualização imediata (otimistic updates)

#### Estratégia de Cache:
- **Cache Local**: 5 minutos para dados estáticos (categorias, configurações)
- **Cache de Sessão**: Dados do dashboard atual
- **Invalidação**: Automática após ações de CRUD
- **Fallback**: Dados em cache quando offline

#### Indicadores de Status:
- **Ícone de Sincronização**: Verde (atualizado), Amarelo (sincronizando), Vermelho (erro)
- **Timestamp**: "Última atualização: há 2 minutos"
- **Modo Offline**: Banner informativo quando desconectado

### 3. Configurações de Paginação
**Definição**: Paginação configurável com padrões otimizados

#### Configurações Padrão:
- **Tabela de Movimentações**: 15 itens por página
- **Tabela de Contas a Pagar**: 10 itens por página
- **Opções Disponíveis**: 10, 15, 25, 50 itens por página

#### Funcionalidades:
- **Paginação Inteligente**: Carregamento progressivo (infinite scroll) como opção
- **Navegação**: Primeira, Anterior, Próxima, Última página
- **Indicador**: "Mostrando 1-15 de 247 registros"
- **Persistência**: Configuração salva por usuário

#### Responsividade:
- **Mobile**: Máximo 10 itens por página
- **Tablet**: Máximo 15 itens por página
- **Desktop**: Todas as opções disponíveis

### 4. Nível de Drill-down nos Gráficos
**Definição**: Sistema de navegação hierárquica nos gráficos

#### Gráfico de Tendência (Linhas):
- **Nível 1**: Visão geral do período selecionado
- **Nível 2**: Zoom em período específico (click + drag)
- **Nível 3**: Detalhes do dia específico (click no ponto)
- **Ação**: Modal com lista de movimentações do dia

#### Gráfico de Distribuição por Categoria:
- **Nível 1**: Distribuição geral por categoria
- **Nível 2**: Click na fatia/barra → Subcategorias (se existirem)
- **Nível 3**: Click na subcategoria → Lista de movimentações
- **Navegação**: Breadcrumb para voltar aos níveis anteriores

#### Gráfico de Status das Contas:
- **Nível 1**: Distribuição por status
- **Nível 2**: Click na barra → Filtrar tabela de contas por status
- **Nível 3**: Click na linha da tabela → Detalhes da conta
- **Integração**: Sincronização com filtros da tabela

#### Funcionalidades Gerais:
- **Breadcrumb**: Navegação clara entre níveis
- **Botão Voltar**: Retorno ao nível anterior
- **Contexto**: Manutenção dos filtros globais em todos os níveis
- **Performance**: Lazy loading para dados de drill-down

## Impacto nas Especificações

### Atualizações nos Requisitos Funcionais:

#### Novos Requisitos:
- **FR-020**: Sistema DEVE implementar controle de acesso baseado em perfis de usuário
- **FR-021**: Sistema DEVE atualizar KPIs a cada 30 segundos automaticamente
- **FR-022**: Sistema DEVE permitir configuração de itens por página (10, 15, 25, 50)
- **FR-023**: Gráficos DEVEM suportar drill-down em até 3 níveis de profundidade
- **FR-024**: Sistema DEVE manter cache local com invalidação inteligente
- **FR-025**: Sistema DEVE exibir indicadores de status de sincronização

#### Requisitos Atualizados:
- **FR-014**: Gráficos DEVEM ser interativos com drill-down hierárquico (3 níveis)
- **FR-017**: Tabelas DEVEM suportar paginação configurável (padrão: 15 movimentações, 10 contas)
- **FR-019**: Sistema DEVE atualizar dados conforme frequências definidas por componente

### Novas Entidades:
- **Perfil de Usuário**: Define permissões e acessos do usuário
- **Cache de Sessão**: Armazena dados temporários para performance
- **Configuração de Usuário**: Preferências pessoais (paginação, layout)
- **Log de Sincronização**: Histórico de atualizações e status

## Considerações Técnicas

### Performance:
- Implementar WebSockets para atualizações em tempo real
- Cache Redis para dados compartilhados
- Otimização de queries para drill-down
- Lazy loading para componentes pesados

### Segurança:
- Validação de permissões em todas as requisições
- Criptografia de dados sensíveis em cache
- Logs de auditoria para acessos a dados financeiros
- Rate limiting para APIs de atualização

### Experiência do Usuário:
- Feedback visual durante carregamentos
- Transições suaves entre níveis de drill-down
- Persistência de estado durante navegação
- Modo offline com sincronização automática

## Status das Clarificações
- ✅ **Níveis de permissão**: Definido sistema de perfis
- ✅ **Atualização em tempo real**: Definidas frequências por componente
- ✅ **Paginação**: Configurações padrão e opções estabelecidas
- ✅ **Drill-down**: Sistema hierárquico de 3 níveis especificado

**Próximo Passo**: Criação de wireframes baseados nas especificações completas