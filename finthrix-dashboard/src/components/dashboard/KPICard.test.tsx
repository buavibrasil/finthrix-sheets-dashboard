import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/utils'
import { KPICard } from './KPICard'

describe('KPICard', () => {
  const mockKPI = {
    id: '1',
    title: 'Saldo Atual',
    value: 15000,
    change: 5.2,
    trend: 'up' as const,
    icon: 'wallet',
  }

  it('deve renderizar o KPI corretamente', () => {
    render(<KPICard kpi={mockKPI} />)
    
    expect(screen.getByText('Saldo Atual')).toBeInTheDocument()
    expect(screen.getByText('R$ 15.000,00')).toBeInTheDocument()
    expect(screen.getByText('+5,2%')).toBeInTheDocument()
  })

  it('deve mostrar trend negativo corretamente', () => {
    const kpiNegativo = {
      ...mockKPI,
      change: -3.5,
      trend: 'down' as const,
    }
    
    render(<KPICard kpi={kpiNegativo} />)
    
    expect(screen.getByText('-3,5%')).toBeInTheDocument()
  })

  it('deve mostrar trend neutro corretamente', () => {
    const kpiNeutro = {
      ...mockKPI,
      change: 0,
      trend: 'neutral' as const,
    }
    
    render(<KPICard kpi={kpiNeutro} />)
    
    expect(screen.getByText('0,0%')).toBeInTheDocument()
  })

  it('deve aplicar classes CSS corretas para trend up', () => {
    render(<KPICard kpi={mockKPI} />)
    
    const changeElement = screen.getByText('+5,2%')
    expect(changeElement).toHaveClass('text-green-600')
  })

  it('deve aplicar classes CSS corretas para trend down', () => {
    const kpiNegativo = {
      ...mockKPI,
      change: -3.5,
      trend: 'down' as const,
    }
    
    render(<KPICard kpi={kpiNegativo} />)
    
    const changeElement = screen.getByText('-3,5%')
    expect(changeElement).toHaveClass('text-red-600')
  })

  it('deve formatar valores grandes corretamente', () => {
    const kpiGrande = {
      ...mockKPI,
      value: 1500000,
    }
    
    render(<KPICard kpi={kpiGrande} />)
    
    expect(screen.getByText('R$ 1.500.000,00')).toBeInTheDocument()
  })
})