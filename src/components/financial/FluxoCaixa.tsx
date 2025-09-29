import { useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Filter, Download, Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useFilters, useComputedData, useFinancialActions } from "@/store/useFinancialStore";
import { useInitializeStore } from "@/hooks/useInitializeStore";

export const FluxoCaixa = () => {
  // Inicializar store com dados mock
  useInitializeStore();

  // Usar hooks do store
  const filters = useFilters();
  const { filteredMovimentacoes, availableMonths, availableCategories } = useComputedData();
  const { setFilters } = useFinancialActions();

  // Aplicar debounce no termo de busca para evitar filtros excessivos
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  // Atualizar filtros quando o debounced search term mudar
  useEffect(() => {
    if (debouncedSearchTerm !== filters.searchTerm) {
      setFilters({ searchTerm: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, filters.searchTerm, setFilters]);

  // Dados para o gráfico de área
  const chartData = useMemo(() => {
    const dataMap = new Map();
    
    filteredMovimentacoes.forEach(mov => {
      const date = mov.data;
      if (!dataMap.has(date)) {
        dataMap.set(date, { data: date, entradas: 0, saidas: 0, saldo: 0 });
      }
      
      const entry = dataMap.get(date);
      entry.entradas += mov.entrada;
      entry.saidas += mov.saida;
    });
    
    // Calcular saldo acumulado
    const sortedData = Array.from(dataMap.values()).sort((a, b) => 
      new Date(a.data).getTime() - new Date(b.data).getTime()
    );
    
    let saldoAcumulado = 0;
    return sortedData.map(item => {
      saldoAcumulado += item.entradas - item.saidas;
      return {
        ...item,
        saldo: saldoAcumulado,
        dataFormatada: new Date(item.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
      };
    });
  }, [filteredMovimentacoes]);

  // Calcular totais
  const totals = useMemo(() => {
    const totalEntradas = filteredMovimentacoes.reduce((sum, mov) => sum + mov.entrada, 0);
    const totalSaidas = filteredMovimentacoes.reduce((sum, mov) => sum + mov.saida, 0);
    const saldoTotal = totalEntradas - totalSaidas;
    
    return { totalEntradas, totalSaidas, saldoTotal };
  }, [filteredMovimentacoes]);

  const { totalEntradas, totalSaidas, saldoTotal } = totals;

  const clearFilters = () => {
    setFilters({ month: "all", category: "all", searchTerm: "" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-primary">Fluxo de Caixa</h2>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Filtros */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transação..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ searchTerm: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.month} onValueChange={(value) => setFilters({ month: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {availableMonths.map(month => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => setFilters({ category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {availableCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo do Período */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-success shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-success-foreground/80">Total de Entradas</p>
                <p className="text-2xl font-bold text-success-foreground">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalEntradas)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-primary shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-foreground/80">Total de Saídas</p>
                <p className="text-2xl font-bold text-primary-foreground">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalSaidas)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-primary-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className={`shadow-card ${saldoTotal >= 0 ? 'bg-gradient-success' : 'bg-gradient-primary'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${saldoTotal >= 0 ? 'text-success-foreground/80' : 'text-primary-foreground/80'}`}>
                  Saldo do Período
                </p>
                <p className={`text-2xl font-bold ${saldoTotal >= 0 ? 'text-success-foreground' : 'text-primary-foreground'}`}>
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(saldoTotal)}
                </p>
              </div>
              {saldoTotal >= 0 ? (
                <TrendingUp className="h-8 w-8 text-success-foreground" />
              ) : (
                <TrendingDown className="h-8 w-8 text-primary-foreground" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução do Saldo */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-primary">Evolução do Saldo Acumulado</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="dataFormatada" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value) => [
                  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value)),
                  "Saldo"
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="saldo" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorSaldo)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de Movimentações */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-primary">
            Histórico de Movimentações 
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredMovimentacoes.length} transações)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Transação</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Entrada</TableHead>
                <TableHead className="text-right">Saída</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovimentacoes
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .map((mov, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell>
                    {new Date(mov.data).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="font-medium">{mov.transacao}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{mov.categoria}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {mov.entrada > 0 && (
                      <span className="font-semibold text-success">
                        +{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(mov.entrada)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {mov.saida > 0 && (
                      <span className="font-semibold text-danger">
                        -{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(mov.saida)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {mov.entrada > 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-success" />
                          <span className="text-success text-sm">Entrada</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-4 w-4 text-danger" />
                          <span className="text-danger text-sm">Saída</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};