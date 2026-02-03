import React, { useState, useEffect } from 'react'
import './index.css'

// Project Types
const PROJECT_TYPES = {
  sales: {
    name: 'Sales Uplift',
    icon: '📈',
    description: 'Increase in sales revenue',
    inputs: [
      { key: 'stores', label: 'Number of Stores', default: 1, hint: 'Stores impacted' },
      { key: 'weeks', label: 'Duration (Weeks)', default: 12, hint: 'Campaign duration' },
      { key: 'baseSales', label: 'Base Sales per Store/Week ($)', default: 10000, hint: 'Current weekly sales' },
      { key: 'uplift', label: 'Expected Uplift (%)', default: 5, hint: 'Sales increase %' },
      { key: 'grossMargin', label: 'Gross Margin (%)', default: 30, hint: 'Profit margin' },
    ],
    calculate: (vals: any) => {
      const incrementalSales = vals.stores * vals.weeks * vals.baseSales * (vals.uplift / 100)
      const grossProfit = incrementalSales * (vals.grossMargin / 100)
      return { incrementalSales, grossProfit, total: grossProfit }
    }
  },
  productivity: {
    name: 'Productivity Improvement',
    icon: '⚡',
    description: 'Cost reduction through efficiency',
    inputs: [
      { key: 'stores', label: 'Number of Locations', default: 1, hint: 'Sites impacted' },
      { key: 'weeks', label: 'Duration (Weeks)', default: 52, hint: 'Annual impact' },
      { key: 'hoursSaved', label: 'Hours Saved per Location/Week', default: 2, hint: 'Time saved per week' },
      { key: 'laborRate', label: 'Labor Cost per Hour ($)', default: 25, hint: 'Hourly rate' },
      { key: 'otherSavings', label: 'Other Savings ($)', default: 0, hint: 'Additional cost reductions' },
    ],
    calculate: (vals: any) => {
      const laborSavings = vals.stores * vals.weeks * vals.hoursSaved * vals.laborRate
      const total = laborSavings + vals.otherSavings
      return { laborSavings, otherSavings: vals.otherSavings, total }
    }
  },
  employee: {
    name: 'Employee Experience',
    icon: '👥',
    description: 'Retention and productivity gains',
    inputs: [
      { key: 'employees', label: 'Number of Employees', default: 100, hint: 'Team size' },
      { key: 'turnoverReduction', label: 'Turnover Reduction (%)', default: 5, hint: 'Fewer people leaving' },
      { key: 'costPerHire', label: 'Cost per Hire ($)', default: 5000, hint: 'Onboarding cost' },
      { key: 'productivityGain', label: 'Productivity Gain (%)', default: 2, hint: 'Efficiency improvement' },
      { key: 'avgSalary', label: 'Average Salary ($)', default: 65000, hint: 'Annual salary' },
    ],
    calculate: (vals: any) => {
      const retentionSavings = vals.employees * (vals.turnoverReduction / 100) * vals.costPerHire
      const productivityValue = vals.employees * (vals.productivityGain / 100) * vals.avgSalary / 52 * vals.weeks || 0
      const total = retentionSavings + productivityValue
      return { retentionSavings, productivityValue, total }
    }
  },
  nps: {
    name: 'NPS Improvement',
    icon: '⭐',
    description: 'Customer satisfaction impact',
    inputs: [
      { key: 'customers', label: 'Number of Customers', default: 10000, hint: 'Affected customers' },
      { key: 'currentNPS', label: 'Current NPS', default: 30, hint: 'Starting NPS score' },
      { key: 'targetNPS', label: 'Target NPS', default: 40, hint: 'Goal NPS score' },
      { key: 'valuePerNPS', label: 'Value per NPS Point ($)', default: 1000, hint: 'Revenue per point' },
      { key: 'conversionImpact', label: 'Conversion Impact ($)', default: 0, hint: 'Additional revenue' },
    ],
    calculate: (vals: any) => {
      const npsIncrease = vals.targetNPS - vals.currentNPS
      const npsValue = npsIncrease * vals.valuePerNPS
      const total = npsValue + vals.conversionImpact
      return { npsIncrease, npsValue, conversionImpact: vals.conversionImpact, total }
    }
  }
}

// Auth Component
function Auth({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'kmart2026' || password === 'team') {
      localStorage.setItem('benefits_calc_auth', 'true')
      onAuth()
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Benefits Calculator V2</h1>
        <p className="text-gray-600 mb-6">Enter the team password to continue</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
            Access Calculator
          </button>
        </form>
      </div>
    </div>
  )
}

// Input Component
interface NumberInputProps {
  label: string
  value: number
  onChange: (v: number) => void
  hint?: string
  min?: number
  max?: number
  step?: number
}

function NumberInput({ label, value, onChange, hint, min, max, step = 1 }: NumberInputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}

// Results Display
function Results({ projectType, calculation }: any) {
  const confidenceLevels = [50, 75, 90, 100, 110, 125]
  const formatCurrency = (v: number) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(v || 0)

  const copyTable = () => {
    let text = `${projectType.name} Results\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    if (calculation.incrementalSales !== undefined) text += `Incremental Sales: ${formatCurrency(calculation.incrementalSales)}\n`
    if (calculation.grossProfit !== undefined) text += `Gross Profit: ${formatCurrency(calculation.grossProfit)}\n`
    if (calculation.laborSavings !== undefined) text += `Labor Savings: ${formatCurrency(calculation.laborSavings)}\n`
    if (calculation.retentionSavings !== undefined) text += `Retention Savings: ${formatCurrency(calculation.retentionSavings)}\n`
    if (calculation.productivityValue !== undefined) text += `Productivity Value: ${formatCurrency(calculation.productivityValue)}\n`
    if (calculation.npsValue !== undefined) text += `NPS Value: ${formatCurrency(calculation.npsValue)}\n`
    if (calculation.conversionImpact !== undefined) text += `Conversion Impact: ${formatCurrency(calculation.conversionImpact)}\n`
    if (calculation.otherSavings !== undefined && calculation.otherSavings > 0) text += `Other Savings: ${formatCurrency(calculation.otherSavings)}\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    text += `TOTAL EBIT IMPACT: ${formatCurrency(calculation.total)}\n\n`
    text += `Confidence Analysis:\n`
    confidenceLevels.forEach(level => {
      text += `${level}% confidence: ${formatCurrency(calculation.total * level / 100)}\n`
    })
    navigator.clipboard.writeText(text)
    alert('Results copied to clipboard!')
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Results</h3>
        <button onClick={copyTable} className="text-sm text-blue-600 hover:text-blue-700">📋 Copy for Presentation</button>
      </div>
      
      <div className="space-y-3 mb-6">
        {calculation.incrementalSales !== undefined && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Incremental Sales:</span>
            <span className="font-medium">{formatCurrency(calculation.incrementalSales)}</span>
          </div>
        )}
        {calculation.grossProfit !== undefined && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gross Profit:</span>
            <span className="font-medium">{formatCurrency(calculation.grossProfit)}</span>
          </div>
        )}
        {calculation.laborSavings !== undefined && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Labor Savings:</span>
            <span className="font-medium">{formatCurrency(calculation.laborSavings)}</span>
          </div>
        )}
        {calculation.retentionSavings !== undefined && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Retention Savings:</span>
            <span className="font-medium">{formatCurrency(calculation.retentionSavings)}</span>
          </div>
        )}
        {calculation.productivityValue !== undefined && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Productivity Value:</span>
            <span className="font-medium">{formatCurrency(calculation.productivityValue)}</span>
          </div>
        )}
        {calculation.npsValue !== undefined && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">NPS Value:</span>
            <span className="font-medium">{formatCurrency(calculation.npsValue)}</span>
          </div>
        )}
        {calculation.conversionImpact !== undefined && calculation.conversionImpact > 0 && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Conversion Impact:</span>
            <span className="font-medium">{formatCurrency(calculation.conversionImpact)}</span>
          </div>
        )}
        {calculation.otherSavings !== undefined && calculation.otherSavings > 0 && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Other Savings:</span>
            <span className="font-medium">{formatCurrency(calculation.otherSavings)}</span>
          </div>
        )}
        <div className="flex justify-between py-3 bg-blue-50 px-4 rounded-lg">
          <span className="font-semibold text-blue-900">TOTAL EBIT IMPACT:</span>
          <span className="font-bold text-lg text-blue-900">{formatCurrency(calculation.total)}</span>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Confidence Analysis</h4>
        <div className="space-y-2">
          {confidenceLevels.map(level => (
            <div key={level} className="flex justify-between text-sm">
              <span className="text-gray-600">{level}%:</span>
              <span className="font-medium">{formatCurrency(calculation.total * level / 100)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main App
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [projectType, setProjectType] = useState('sales')
  const [values, setValues] = useState<Record<string, number>>({})

  useEffect(() => {
    const auth = localStorage.getItem('benefits_calc_auth')
    if (auth) setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    const defaults = PROJECT_TYPES[projectType as keyof typeof PROJECT_TYPES].inputs.reduce((acc, input) => {
      acc[input.key] = input.default
      return acc
    }, {} as Record<string, number>)
    setValues(defaults)
  }, [projectType])

  if (!isAuthenticated) {
    return <Auth onAuth={() => setIsAuthenticated(true)} />
  }

  const type = PROJECT_TYPES[projectType as keyof typeof PROJECT_TYPES]
  const calculation = type.calculate(values)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Benefits Calculator V2</h1>
        <p className="text-gray-600">Calculate and present business case impacts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Project Type</h3>
          <div className="space-y-2">
            {Object.entries(PROJECT_TYPES).map(([key, type]) => (
              <button
                key={key}
                onClick={() => setProjectType(key)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  projectType === key 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg mr-2">{type.icon}</span>
                <span className="font-medium">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{type.name}</h3>
            <p className="text-gray-600 mb-4">{type.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {type.inputs.map((input) => (
                <NumberInput
                  key={input.key}
                  label={input.label}
                  value={values[input.key] || 0}
                  onChange={(v: number) => setValues({ ...values, [input.key]: v })}
                  hint={input.hint}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Results projectType={type} calculation={calculation} />
    </div>
  )
}

export default App
