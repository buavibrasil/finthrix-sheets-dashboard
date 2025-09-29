import { useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useFinancialStore, useFilters, useMetrics, useComputedData, useFinancialActions } from "@/store/useFinancialStore";
import { useInitializeStore } from "@/hooks/useInitializeStore";

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--danger))", "#8884d8", "#82ca9d"];

export const ResumoFinanceiro = () => {
  // Inicializar store com dados mock
  useInitializeStore();

  // Usar hooks do store
  const filters = useFilters();
  const metrics = useMetrics();
  const { monthlyData, availableMonths } = useComputedData();
  const { setFilters, calculateMetrics } = useFinancialActions();

  // Transformar dados agrupados para o formato do gráfico
  const monthlyChartData = useMemo(() => {
    return Object.entries(monthlyData).map(([mes, movimentacoes]) => ({
      mes,
      entradas: movimentacoes.reduce((sum, mov) => sum + mov.entrada, 0),
      saidas: movimentacoes.reduce((sum, mov) => sum + mov.saida, 0)
    }));
  }, [monthlyData]);

  // Filtrar dados do mês selecionado
  const currentMonthData = useMemo(() => {
    if (filters.selectedMonth === 'all') return [];
    return monthlyData[filters.selectedMonth] || [];
  }, [monthlyData, filters.selectedMonth]);

  // Cálculos para o mês atual
  const currentMonthMetrics = useMemo(() => {
    const receita = currentMonthData.reduce((sum, mov) => sum + mov.entrada, 0);
    const despesa = currentMonthData.reduce((sum, mov) => sum + mov.saida, 0);
    const saldo = receita - despesa;
    return { receita, despesa, saldo };
  }, [currentMonthData]);

  // Agrupamento por categoria (apenas saídas)
  const categoryData = useMemo(() => {
    const expenseData = currentMonthData.filter(mov => mov.saida > 0);
    const categoryGroups = expenseData.reduce((acc, mov) => {
      if (!acc[mov.categoria]) {
        acc[mov.categoria] = [];
      }
      acc[mov.categoria].push(mov);
      return acc;
    }, {} as Record<string, any[]>);
    
    return Object.entries(categoryGroups).map(([categoria, movimentacoes]) => ({
      categoria,
      valor: movimentacoes.reduce((sum, mov) => sum + mov.saida, 0)
    }));
  }, [currentMonthData]);

  // Recalcular métricas quando os filtros mudarem
  useEffect(() => {
    calculateMetrics();
  }, [filters, calculateMetrics]);

  const handleMonthChange = (month: string) => {
    setFilters({ selectedMonth: month });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-primary">Resumo Financeiro</h2>
        <Select value={filters.selectedMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Receita Total do Mês"
          value={currentMonthMetrics.receita}
          icon={<TrendingUp className="h-5 w-5" />}
          trend="up"
          trendValue={5.2}
        />
        <MetricCard
          title="Despesa Total do Mês"
          value={currentMonthMetrics.despesa}
          icon={<TrendingDown className="h-5 w-5" />}
          trend="down"
          trendValue={-2.1}
        />
        <MetricCard
          title="Saldo do Mês"
          value={currentMonthMetrics.saldo}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={currentMonthMetrics.saldo >= 0 ? "up" : "down"}
          trendValue={currentMonthMetrics.saldo >= 0 ? 8.1 : -3.2}
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de Barras - Entradas x Saídas */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-primary">Entradas x Saídas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value) => [
                    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value)),
                    ""
                  ]}
                />
                <Bar dataKey="entradas" fill="hsl(var(--success))" name="Entradas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saidas" fill="hsl(var(--danger))" name="Saídas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição por Categoria */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-primary">Distribuição de Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ categoria, valor }) => `${categoria}: ${((valor / currentMonthMetrics.despesa) * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [
                  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value)),
                  "Valor"
                ]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};