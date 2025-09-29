import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Calculator } from "lucide-react";

// Dados simulados - em produção viriam do Google Sheets
const mockData = {
  movimentacoes: [
    { data: "2024-01-15", transacao: "Salário", categoria: "Renda", entrada: 5000, saida: 0, mes: "Janeiro" },
    { data: "2024-01-20", transacao: "Aluguel", categoria: "Moradia", entrada: 0, saida: 1200, mes: "Janeiro" },
    { data: "2024-01-25", transacao: "Supermercado", categoria: "Alimentação", entrada: 0, saida: 800, mes: "Janeiro" },
    { data: "2024-02-15", transacao: "Salário", categoria: "Renda", entrada: 5000, saida: 0, mes: "Fevereiro" },
    { data: "2024-02-20", transacao: "Aluguel", categoria: "Moradia", entrada: 0, saida: 1200, mes: "Fevereiro" },
    { data: "2024-02-25", transacao: "Supermercado", categoria: "Alimentação", entrada: 0, saida: 600, mes: "Fevereiro" },
    { data: "2024-03-15", transacao: "Salário", categoria: "Renda", entrada: 5200, saida: 0, mes: "Março" },
    { data: "2024-03-20", transacao: "Aluguel", categoria: "Moradia", entrada: 0, saida: 1200, mes: "Março" },
    { data: "2024-03-25", transacao: "Supermercado", categoria: "Alimentação", entrada: 0, saida: 750, mes: "Março" },
  ]
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--danger))", "#8884d8", "#82ca9d"];

export const ResumoFinanceiro = () => {
  const [selectedMonth, setSelectedMonth] = useState("Março");

  const { monthlyData, categoryData, currentMonthMetrics } = useMemo(() => {
    // Agrupamento por mês
    const monthlyGroups = mockData.movimentacoes.reduce((acc, mov) => {
      const month = mov.mes;
      if (!acc[month]) {
        acc[month] = { mes: month, entradas: 0, saidas: 0 };
      }
      acc[month].entradas += mov.entrada;
      acc[month].saidas += mov.saida;
      return acc;
    }, {} as Record<string, { mes: string; entradas: number; saidas: number }>);

    const monthlyData = Object.values(monthlyGroups);

    // Dados do mês selecionado
    const currentMonthData = mockData.movimentacoes.filter(mov => mov.mes === selectedMonth);
    
    const receita = currentMonthData.reduce((sum, mov) => sum + mov.entrada, 0);
    const despesa = currentMonthData.reduce((sum, mov) => sum + mov.saida, 0);
    const saldo = receita - despesa;

    // Agrupamento por categoria (apenas saídas)
    const categoryGroups = currentMonthData
      .filter(mov => mov.saida > 0)
      .reduce((acc, mov) => {
        const categoria = mov.categoria;
        if (!acc[categoria]) {
          acc[categoria] = { categoria, valor: 0 };
        }
        acc[categoria].valor += mov.saida;
        return acc;
      }, {} as Record<string, { categoria: string; valor: number }>);

    const categoryData = Object.values(categoryGroups);

    return {
      monthlyData,
      categoryData,
      currentMonthMetrics: { receita, despesa, saldo }
    };
  }, [selectedMonth]);

  const availableMonths = Array.from(new Set(mockData.movimentacoes.map(mov => mov.mes)));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-primary">Resumo Financeiro</h2>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
          icon={<Calculator className="h-5 w-5" />}
          trend={currentMonthMetrics.saldo > 0 ? "up" : "down"}
          trendValue={8.3}
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
              <BarChart data={monthlyData}>
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