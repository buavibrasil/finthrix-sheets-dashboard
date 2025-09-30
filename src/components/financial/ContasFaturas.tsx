import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileText, Download, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Dados simulados das faturas - LIMPOS
const mockFaturas: Array<{
  dataFatura: string;
  numeroFatura: string;
  total: number;
  destinatario: string;
  status: string;
  mes: string;
}> = [];

export const ContasFaturas = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Dados para o gráfico de evolução
  const chartData = mockFaturas.reduce((acc, fatura) => {
    const existing = acc.find(item => item.mes === fatura.mes);
    if (existing) {
      existing.total += fatura.total;
    } else {
      acc.push({ mes: fatura.mes, total: fatura.total });
    }
    return acc;
  }, [] as { mes: string; total: number }[]);

  // Filtro por status
  const filteredFaturas = filterStatus === "all" 
    ? mockFaturas 
    : mockFaturas.filter(fatura => fatura.status.toLowerCase() === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pago":
        return "bg-success text-success-foreground";
      case "pendente":
        return "bg-yellow-500 text-white";
      case "vencido":
        return "bg-danger text-danger-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const totalFaturas = filteredFaturas.reduce((sum, fatura) => sum + fatura.total, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-primary">Contas e Faturas</h2>
        <div className="flex items-center space-x-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumo rápido */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total do Período</p>
                <p className="text-xl font-bold text-primary">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalFaturas)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturas Pagas</p>
                <p className="text-xl font-bold text-success">
                  {mockFaturas.filter(f => f.status === "Pago").length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-success"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-xl font-bold text-yellow-600">
                  {mockFaturas.filter(f => f.status === "Pendente").length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencidas</p>
                <p className="text-xl font-bold text-danger">
                  {mockFaturas.filter(f => f.status === "Vencido").length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-danger/20 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-danger"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-primary">Evolução do Valor Total das Faturas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value) => [
                  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value)),
                  "Total"
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de Faturas */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-primary">Lista de Faturas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data da Fatura</TableHead>
                <TableHead>Número da Fatura</TableHead>
                <TableHead>Destinatário</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaturas.map((fatura) => (
                <TableRow key={fatura.numeroFatura} className="hover:bg-muted/50">
                  <TableCell>
                    {new Date(fatura.dataFatura).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="font-mono">{fatura.numeroFatura}</TableCell>
                  <TableCell>{fatura.destinatario}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(fatura.total)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(fatura.status)}>
                      {fatura.status}
                    </Badge>
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