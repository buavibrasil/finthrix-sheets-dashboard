import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useFinancialActions, useMovimentacoes, useMetrics } from '@/store/useFinancialStore';

/**
 * Componente temporário para limpeza de dados
 * Este componente permite limpar todos os dados de lançamentos, contas e faturas
 */
export const DataCleaner = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [clearResult, setClearResult] = useState<{
    success: boolean;
    message: string;
    clearedCount: number;
  } | null>(null);

  const { clearAllData } = useFinancialActions();
  const movimentacoes = useMovimentacoes();
  const metrics = useMetrics();

  const handleClearData = async () => {
    setIsClearing(true);
    setClearResult(null);

    try {
      const countBeforeClear = movimentacoes.length;
      
      console.log('🧹 Iniciando limpeza de dados...');
      console.log(`📊 Dados antes da limpeza: ${countBeforeClear} movimentações`);
      
      // Executar limpeza
      clearAllData();
      
      console.log('✅ Limpeza concluída!');
      
      setClearResult({
        success: true,
        message: 'Todos os dados de lançamentos, contas e faturas foram limpos com sucesso!',
        clearedCount: countBeforeClear
      });
      
    } catch (error) {
      console.error('❌ Erro durante a limpeza:', error);
      setClearResult({
        success: false,
        message: 'Erro ao limpar os dados. Verifique o console para mais detalhes.',
        clearedCount: 0
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearMovimentacoes = async () => {
    setIsClearing(true);
    setClearResult(null);

    try {
      const countBeforeClear = movimentacoes.length;
      
      console.log('🧹 Iniciando limpeza do histórico de movimentações...');
      console.log(`📊 Movimentações antes da limpeza: ${countBeforeClear}`);
      
      // Executar limpeza apenas das movimentações
      clearAllData();
      
      console.log('✅ Limpeza do histórico concluída!');
      
      setClearResult({
        success: true,
        message: 'Histórico de movimentações foi limpo com sucesso!',
        clearedCount: countBeforeClear
      });
      
    } catch (error) {
      console.error('❌ Erro durante a limpeza do histórico:', error);
      setClearResult({
        success: false,
        message: 'Erro ao limpar o histórico de movimentações. Verifique o console para mais detalhes.',
        clearedCount: 0
      });
    } finally {
      setIsClearing(false);
    }
  };

  const dataStats = {
    movimentacoes: movimentacoes.length,
    totalReceitas: metrics.totalReceitas,
    totalDespesas: metrics.totalDespesas,
    saldoTotal: metrics.saldoTotal
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Limpeza de Dados Financeiros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status atual dos dados */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Status Atual dos Dados:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Movimentações:</span> {dataStats.movimentacoes}
            </div>
            <div>
              <span className="font-medium">Total Receitas:</span> R$ {dataStats.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div>
              <span className="font-medium">Total Despesas:</span> R$ {dataStats.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div>
              <span className="font-medium">Saldo Total:</span> R$ {dataStats.saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Aviso */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> Esta ação irá remover permanentemente todos os dados de:
            <ul className="list-disc list-inside mt-2 ml-4">
              <li>Movimentações financeiras</li>
              <li>Métricas calculadas</li>
              <li>Filtros aplicados</li>
              <li>Histórico de sincronização</li>
            </ul>
            Esta ação não pode ser desfeita.
          </AlertDescription>
        </Alert>

        {/* Resultado da limpeza */}
        {clearResult && (
          <Alert className={clearResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {clearResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={clearResult.success ? 'text-green-800' : 'text-red-800'}>
              {clearResult.message}
              {clearResult.success && clearResult.clearedCount > 0 && (
                <div className="mt-1 text-sm">
                  {clearResult.clearedCount} movimentações foram removidas.
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Botões de limpeza */}
        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleClearMovimentacoes}
            disabled={isClearing || dataStats.movimentacoes === 0}
            variant="outline"
            size="lg"
            className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            {isClearing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-700 mr-2"></div>
                Limpando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Histórico de Movimentações
              </>
            )}
          </Button>
          
          <Button
            onClick={handleClearData}
            disabled={isClearing || dataStats.movimentacoes === 0}
            variant="destructive"
            size="lg"
            className="w-full"
          >
            {isClearing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Limpando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Todos os Dados
              </>
            )}
          </Button>
        </div>

        {dataStats.movimentacoes === 0 && (
          <p className="text-center text-gray-500 text-sm">
            Não há dados para limpar.
          </p>
        )}
      </CardContent>
    </Card>
  );
};