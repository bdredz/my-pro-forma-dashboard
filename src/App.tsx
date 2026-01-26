import { useState, useMemo } from 'react';
import type { ProformaInput } from './domain/proforma';
import {
  calculateProforma,
  getExampleProformaInput,
  getBlankProformaInput,
  autoFillInterestPayments,
} from './domain/proforma';
import { formatCurrency, formatPercent } from './utils/formatting';
import { NumberField } from './components/NumberField';
import { DealBadge } from './components/DealBadge';
import { KpiCard } from './components/KpiCard';
import './App.css';

function App() {
  // Initialize with example data for "instant wow"
  const [input, setInput] = useState<ProformaInput>(getExampleProformaInput());

  // Calculate derived values
  const derived = useMemo(() => calculateProforma(input), [input]);

  // Helper to update a single field
  const updateField = <K extends keyof ProformaInput>(field: K, value: ProformaInput[K]) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  // Reset to example defaults
  const handleReset = () => {
    setInput(getExampleProformaInput());
  };

  // Start fresh (blank)
  const handleStartFresh = () => {
    setInput(getBlankProformaInput());
  };

  // Auto-fill interest payments
  const handleAutoFillInterest = () => {
    const payments = autoFillInterestPayments(input);
    setInput((prev) => ({ ...prev, ...payments }));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Proforma Dashboard</h1>
        <div className="header-actions">
          <button onClick={handleStartFresh} className="btn btn-secondary">
            Start Fresh
          </button>
          <button onClick={handleReset} className="btn btn-primary">
            Reset to Example
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* Left Column: Inputs */}
        <div className="inputs-section">
          <section className="card">
            <h2>Property Details</h2>
            <div className="form-group">
              <label htmlFor="propertyAddress">Property Address</label>
              <input
                id="propertyAddress"
                type="text"
                value={input.propertyAddress}
                onChange={(e) => updateField('propertyAddress', e.target.value)}
                placeholder="Enter property address"
                className="text-input"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lotSize">Lot Size</label>
                <input
                  id="lotSize"
                  type="text"
                  value={input.lotSize}
                  onChange={(e) => updateField('lotSize', e.target.value)}
                  placeholder="Optional"
                  className="text-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lotZoning">Lot Zoning</label>
                <input
                  id="lotZoning"
                  type="text"
                  value={input.lotZoning}
                  onChange={(e) => updateField('lotZoning', e.target.value)}
                  placeholder="Optional"
                  className="text-input"
                />
              </div>
            </div>
          </section>

          <section className="card">
            <h2>Core Variables</h2>
            <div className="form-grid">
              <NumberField
                label="How Many Build (Qty)"
                value={input.howManyBuild}
                onChange={(v) => updateField('howManyBuild', v)}
                type="number"
                min={1}
                required
              />
              <NumberField
                label="Proposed Sq Ft"
                value={input.proposedSqFt}
                onChange={(v) => updateField('proposedSqFt', v)}
                type="number"
                required
              />
              <NumberField
                label="Build Cost per Sq Ft"
                value={input.buildCostPerSqFt}
                onChange={(v) => updateField('buildCostPerSqFt', v)}
                type="currency"
                required
              />
              <NumberField
                label="Sale Price per Sq Ft"
                value={input.salePricePerSqFt}
                onChange={(v) => updateField('salePricePerSqFt', v)}
                type="currency"
                required
              />
              <NumberField
                label="Cost of Land"
                value={input.costOfLand}
                onChange={(v) => updateField('costOfLand', v)}
                type="currency"
                required
              />
              <NumberField
                label="Estimated Closing Cost"
                value={input.estimatedClosingCost}
                onChange={(v) => updateField('estimatedClosingCost', v)}
                type="currency"
              />
              <NumberField
                label="Real Estate Commission %"
                value={input.realEstateCommissionRate}
                onChange={(v) => updateField('realEstateCommissionRate', v)}
                type="percent"
                max={100}
              />
              <NumberField
                label="Interest Rate %"
                value={input.interestRate}
                onChange={(v) => updateField('interestRate', v)}
                type="percent"
                max={100}
              />
              <NumberField
                label="Loan Points Rate %"
                value={input.loanPointsRate}
                onChange={(v) => updateField('loanPointsRate', v)}
                type="percent"
                max={100}
              />
            </div>
          </section>

          <section className="card">
            <div className="section-header">
              <h2>Interest Payments</h2>
              <button onClick={handleAutoFillInterest} className="btn btn-sm btn-secondary">
                Auto-fill from Rate
              </button>
            </div>
            <div className="form-grid">
              <NumberField
                label="Payment 1"
                value={input.payment1}
                onChange={(v) => updateField('payment1', v)}
                type="currency"
              />
              <NumberField
                label="Payment 2"
                value={input.payment2}
                onChange={(v) => updateField('payment2', v)}
                type="currency"
              />
              <NumberField
                label="Payment 3"
                value={input.payment3}
                onChange={(v) => updateField('payment3', v)}
                type="currency"
              />
              <NumberField
                label="Payment 4"
                value={input.payment4}
                onChange={(v) => updateField('payment4', v)}
                type="currency"
              />
              <NumberField
                label="Payment 5"
                value={input.payment5}
                onChange={(v) => updateField('payment5', v)}
                type="currency"
              />
              <NumberField
                label="Payment 6"
                value={input.payment6}
                onChange={(v) => updateField('payment6', v)}
                type="currency"
              />
            </div>
            <div className="total-line">
              <span>Total Interest Payments:</span>
              <strong>{formatCurrency(derived.totalInterestPayments)}</strong>
            </div>
          </section>

          <section className="card">
            <h2>Extra Expenses</h2>
            <div className="form-grid">
              <NumberField
                label="Sidewalks"
                value={input.sidewalks}
                onChange={(v) => updateField('sidewalks', v)}
                type="currency"
              />
              <NumberField
                label="Sewer"
                value={input.sewer}
                onChange={(v) => updateField('sewer', v)}
                type="currency"
              />
              <NumberField
                label="Water"
                value={input.water}
                onChange={(v) => updateField('water', v)}
                type="currency"
              />
              <NumberField
                label="Re-Platt"
                value={input.rePlatt}
                onChange={(v) => updateField('rePlatt', v)}
                type="currency"
              />
              <NumberField
                label="Grinder Pumps"
                value={input.grinderPumps}
                onChange={(v) => updateField('grinderPumps', v)}
                type="currency"
              />
              <NumberField
                label="Builder Fee"
                value={input.builderFee}
                onChange={(v) => updateField('builderFee', v)}
                type="currency"
              />
            </div>
            <div className="total-line">
              <span>Total Extra Expenses:</span>
              <strong>{formatCurrency(derived.extraExpensesTotal)}</strong>
            </div>
          </section>
        </div>

        {/* Right Column: Results */}
        <div className="results-section">
          {/* Deal Badge */}
          <div className="card">
            <DealBadge badge={derived.dealBadge} profitPercentage={derived.profitPercentage} />
            {derived.arv === 0 && (
              <div className="warning-message">
                Enter Sale Price per Sq Ft and Proposed Sq Ft to calculate deal metrics
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="card">
            <h2>Key Metrics</h2>
            <div className="kpi-grid">
              <KpiCard
                label="Total Profit"
                value={formatCurrency(derived.totalProfit)}
                highlight
              />
              <KpiCard
                label="Profit Percentage"
                value={derived.arv > 0 ? formatPercent(derived.profitPercentage, 1) : '—'}
                highlight
              />
              <KpiCard label="ARV" value={formatCurrency(derived.arv)} />
              <KpiCard label="Total Build Cost" value={formatCurrency(derived.totalBuildCost)} />
              <KpiCard label="Total Points" value={formatCurrency(derived.totalPoints)} />
              <KpiCard
                label="RE Commission"
                value={formatCurrency(derived.realEstateCommissionAmount)}
              />
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="card">
            <h2>Cost Breakdown</h2>
            <div className="breakdown-list">
              <div className="breakdown-item">
                <span>Build Cost</span>
                <span>{formatCurrency(derived.totalBuildCost)}</span>
              </div>
              <div className="breakdown-item">
                <span>Land Cost</span>
                <span>{formatCurrency(input.costOfLand)}</span>
              </div>
              <div className="breakdown-item">
                <span>Closing Cost</span>
                <span>{formatCurrency(input.estimatedClosingCost)}</span>
              </div>
              <div className="breakdown-item">
                <span>Extra Expenses</span>
                <span>{formatCurrency(derived.extraExpensesTotal)}</span>
              </div>
              <div className="breakdown-item">
                <span>Loan Points</span>
                <span>{formatCurrency(derived.totalPoints)}</span>
              </div>
              <div className="breakdown-item">
                <span>Interest Payments</span>
                <span>{formatCurrency(derived.totalInterestPayments)}</span>
              </div>
              <div className="breakdown-item">
                <span>RE Commission</span>
                <span>{formatCurrency(derived.realEstateCommissionAmount)}</span>
              </div>
              <div className="breakdown-item total-item">
                <span>Total Costs</span>
                <strong>
                  {formatCurrency(
                    derived.totalBuildCost +
                    input.costOfLand +
                    input.estimatedClosingCost +
                    derived.extraExpensesTotal +
                    derived.totalPoints +
                    derived.totalInterestPayments +
                    derived.realEstateCommissionAmount
                  )}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
