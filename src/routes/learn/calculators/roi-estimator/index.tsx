import { component$, useSignal, useComputed$, $ } from '@builder.io/qwik';
import type { DocumentHead } from '~/lib/qwik-city';
import { Link } from '~/lib/qwik-city';

// US average electricity rates by state region
const electricityRates: Record<string, { name: string; rate: number }> = {
  'california': { name: 'California', rate: 0.27 },
  'hawaii': { name: 'Hawaii', rate: 0.43 },
  'new-england': { name: 'New England (MA, CT, NH)', rate: 0.24 },
  'mid-atlantic': { name: 'Mid-Atlantic (NY, NJ, PA)', rate: 0.18 },
  'southeast': { name: 'Southeast (FL, GA, NC)', rate: 0.13 },
  'midwest': { name: 'Midwest (IL, OH, MI)', rate: 0.14 },
  'texas': { name: 'Texas', rate: 0.12 },
  'southwest': { name: 'Southwest (AZ, NV, NM)', rate: 0.13 },
  'mountain': { name: 'Mountain (CO, UT, MT)', rate: 0.12 },
  'pacific-nw': { name: 'Pacific Northwest (WA, OR)', rate: 0.11 },
  'custom': { name: 'Custom rate', rate: 0 },
};

export default component$(() => {
  const systemCost = useSignal(25000);
  const systemSizeKw = useSignal(8);
  const region = useSignal('new-england');
  const customRate = useSignal(0.15);
  const annualProduction = useSignal(10000);
  const useManualProduction = useSignal(false);
  const federalTaxCredit = useSignal(30);
  const stateTaxCredit = useSignal(0);
  const annualRateIncrease = useSignal(3);
  const panelDegradation = useSignal(0.5);
  const showResults = useSignal(false);
  const showLeadCapture = useSignal(false);
  const email = useSignal('');
  const emailSubmitted = useSignal(false);

  // Production estimates based on region (kWh per kW installed)
  const productionPerKw: Record<string, number> = {
    'california': 1600,
    'hawaii': 1700,
    'new-england': 1200,
    'mid-atlantic': 1250,
    'southeast': 1400,
    'midwest': 1300,
    'texas': 1500,
    'southwest': 1650,
    'mountain': 1450,
    'pacific-nw': 1100,
    'custom': 1300,
  };

  const electricityRate = useComputed$(() => {
    if (region.value === 'custom') {
      return customRate.value;
    }
    return electricityRates[region.value]?.rate || 0.15;
  });

  const estimatedAnnualProduction = useComputed$(() => {
    if (useManualProduction.value) {
      return annualProduction.value;
    }
    return systemSizeKw.value * (productionPerKw[region.value] || 1300);
  });

  const netSystemCost = useComputed$(() => {
    const federal = systemCost.value * (federalTaxCredit.value / 100);
    const state = systemCost.value * (stateTaxCredit.value / 100);
    return systemCost.value - federal - state;
  });

  const costPerWatt = useComputed$(() => {
    return systemCost.value / (systemSizeKw.value * 1000);
  });

  const netCostPerWatt = useComputed$(() => {
    return netSystemCost.value / (systemSizeKw.value * 1000);
  });

  // Calculate 25-year financials
  const financialProjection = useComputed$(() => {
    const years = 25;
    let cumulativeSavings = 0;
    let paybackYear = 0;
    let currentRate = electricityRate.value;
    let currentProduction = estimatedAnnualProduction.value;
    const yearlyData = [];

    for (let year = 1; year <= years; year++) {
      // Apply degradation
      if (year > 1) {
        currentProduction = currentProduction * (1 - panelDegradation.value / 100);
      }
      // Apply rate increase
      if (year > 1) {
        currentRate = currentRate * (1 + annualRateIncrease.value / 100);
      }

      const yearlySavings = currentProduction * currentRate;
      cumulativeSavings += yearlySavings;

      if (paybackYear === 0 && cumulativeSavings >= netSystemCost.value) {
        paybackYear = year;
      }

      yearlyData.push({
        year,
        production: Math.round(currentProduction),
        rate: currentRate,
        savings: yearlySavings,
        cumulative: cumulativeSavings,
      });
    }

    const totalSavings = cumulativeSavings;
    const netProfit = totalSavings - netSystemCost.value;
    const roi = (netProfit / netSystemCost.value) * 100;

    return {
      paybackYear: paybackYear || '>25',
      totalSavings,
      netProfit,
      roi,
      yearlyData,
      firstYearSavings: yearlyData[0].savings,
      year25Savings: yearlyData[24].savings,
    };
  });

  const calculate = $(() => {
    showResults.value = true;
  });

  const copyShareLink = $(() => {
    const params = new URLSearchParams();
    params.set('cost', systemCost.value.toString());
    params.set('size', systemSizeKw.value.toString());
    params.set('region', region.value);
    params.set('rate', customRate.value.toString());
    params.set('federal', federalTaxCredit.value.toString());
    params.set('state', stateTaxCredit.value.toString());
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  });

  const submitEmail = $(() => {
    if (email.value && email.value.includes('@')) {
      emailSubmitted.value = true;
    }
  });

  return (
    <div class="bg-white min-h-screen">
      {/* Hero */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 bg-[#c3a859]/20 text-[#c3a859] px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Calculator
            </div>
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-4">
              Solar ROI Estimator
            </h1>
            <p class="text-white/80 text-lg max-w-2xl">
              Calculate your solar system's payback period, lifetime savings, and return on investment based on local electricity rates and incentives.
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <section class="bg-[#f1f1f2] border-b border-gray-200 py-3">
        <div class="container mx-auto px-4">
          <nav class="flex items-center gap-2 text-sm">
            <Link href="/learn/" class="text-[#5974c3] hover:underline">Learning & Resources</Link>
            <span class="text-gray-400">/</span>
            <Link href="/learn/calculators/" class="text-[#5974c3] hover:underline">Calculators</Link>
            <span class="text-gray-400">/</span>
            <span class="text-gray-600">ROI Estimator</span>
          </nav>
        </div>
      </section>

      {/* Calculator */}
      <section class="py-10">
        <div class="container mx-auto px-4">
          <div class="max-w-5xl mx-auto">
            <div class="grid lg:grid-cols-5 gap-8">
              {/* Input Section */}
              <div class="lg:col-span-3 space-y-6">
                {/* System Details */}
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">System Details</h2>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-1.5">Total System Cost ($)</label>
                      <input
                        type="number"
                        value={systemCost.value}
                        onInput$={(e) => { systemCost.value = parseFloat((e.target as HTMLInputElement).value) || 0; }}
                        class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                      />
                      <p class="text-xs text-gray-400 mt-1">Before incentives</p>
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-1.5">System Size (kW)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={systemSizeKw.value}
                        onInput$={(e) => { systemSizeKw.value = parseFloat((e.target as HTMLInputElement).value) || 0; }}
                        class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                      />
                      <p class="text-xs text-gray-400 mt-1">${costPerWatt.value.toFixed(2)}/watt</p>
                    </div>
                  </div>

                  <div class="mt-4 pt-4 border-t border-gray-100">
                    <p class="text-sm text-gray-500 mb-2">Quick system presets:</p>
                    <div class="flex flex-wrap gap-2">
                      {[
                        { label: 'Small (5kW)', cost: 15000, size: 5 },
                        { label: 'Medium (8kW)', cost: 24000, size: 8 },
                        { label: 'Large (12kW)', cost: 34000, size: 12 },
                        { label: 'XL (20kW)', cost: 54000, size: 20 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick$={() => {
                            systemCost.value = preset.cost;
                            systemSizeKw.value = preset.size;
                          }}
                          class="px-3 py-1 rounded text-sm border bg-white text-gray-600 border-gray-300 hover:border-[#042e0d] transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Location & Rates */}
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Location & Electricity Rates</h2>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-1.5">Region</label>
                      <select
                        value={region.value}
                        onChange$={(e) => { region.value = (e.target as HTMLSelectElement).value; }}
                        class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                      >
                        {Object.entries(electricityRates).map(([key, data]) => (
                          <option key={key} value={key}>
                            {`${data.name}${key !== 'custom' ? ` ($${data.rate.toFixed(2)}/kWh)` : ''}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    {region.value === 'custom' && (
                      <div>
                        <label class="block text-sm font-bold text-[#042e0d] mb-1.5">Electricity Rate ($/kWh)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={customRate.value}
                          onInput$={(e) => { customRate.value = parseFloat((e.target as HTMLInputElement).value) || 0; }}
                          class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                        />
                      </div>
                    )}
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-1.5">Annual Rate Increase (%)</label>
                      <select
                        value={annualRateIncrease.value}
                        onChange$={(e) => { annualRateIncrease.value = parseInt((e.target as HTMLSelectElement).value); }}
                        class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                      >
                        <option value="0">0% (No increase)</option>
                        <option value="2">2% (Conservative)</option>
                        <option value="3">3% (Average)</option>
                        <option value="5">5% (Aggressive)</option>
                      </select>
                      <p class="text-xs text-gray-400 mt-1">Historical average ~3%/year</p>
                    </div>
                  </div>

                  <div class="mt-4 pt-4 border-t border-gray-100">
                    <div class="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        id="manualProduction"
                        checked={useManualProduction.value}
                        onChange$={(e) => { useManualProduction.value = (e.target as HTMLInputElement).checked; }}
                        class="rounded border-gray-300"
                      />
                      <label for="manualProduction" class="text-sm text-gray-600">Override estimated production</label>
                    </div>
                    {useManualProduction.value ? (
                      <div>
                        <label class="block text-sm font-bold text-[#042e0d] mb-1.5">Annual Production (kWh)</label>
                        <input
                          type="number"
                          value={annualProduction.value}
                          onInput$={(e) => { annualProduction.value = parseFloat((e.target as HTMLInputElement).value) || 0; }}
                          class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                        />
                      </div>
                    ) : (
                      <div class="bg-[#f1f1f2] rounded p-3">
                        <div class="flex justify-between items-center">
                          <span class="text-sm text-gray-600">Estimated Annual Production</span>
                          <span class="font-heading font-bold text-[#042e0d]">{estimatedAnnualProduction.value.toLocaleString()} kWh</span>
                        </div>
                        <p class="text-xs text-gray-400 mt-1">Based on {productionPerKw[region.value]} kWh/kW for your region</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Incentives */}
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Tax Credits & Incentives</h2>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-1.5">Federal Tax Credit (%)</label>
                      <select
                        value={federalTaxCredit.value}
                        onChange$={(e) => { federalTaxCredit.value = parseInt((e.target as HTMLSelectElement).value); }}
                        class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                      >
                        <option value="30">30% (2024-2032)</option>
                        <option value="26">26% (2033)</option>
                        <option value="22">22% (2034)</option>
                        <option value="0">0% (No credit)</option>
                      </select>
                      <p class="text-xs text-gray-400 mt-1">ITC under Inflation Reduction Act</p>
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-1.5">State/Local Incentives (%)</label>
                      <input
                        type="number"
                        value={stateTaxCredit.value}
                        onInput$={(e) => { stateTaxCredit.value = parseFloat((e.target as HTMLInputElement).value) || 0; }}
                        class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                        placeholder="0"
                      />
                      <p class="text-xs text-gray-400 mt-1">Check <a href="https://www.dsireusa.org" target="_blank" class="text-[#5974c3] hover:underline">DSIRE</a> for local incentives</p>
                    </div>
                  </div>

                  <div class="mt-4 bg-[#56c270]/10 border border-[#56c270]/30 rounded p-4">
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">Net System Cost (after incentives)</span>
                      <span class="font-heading font-bold text-xl text-[#042e0d]">${netSystemCost.value.toLocaleString()}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                      ${netCostPerWatt.value.toFixed(2)}/watt after incentives
                    </p>
                  </div>
                </div>

                {/* Calculate Button */}
                <button
                  onClick$={calculate}
                  class="w-full bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-4 rounded hover:bg-[#4ab362] transition-colors text-lg"
                >
                  Calculate ROI
                </button>
              </div>

              {/* Results Section */}
              <div class="lg:col-span-2">
                <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg p-6 sticky top-20">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Results</h2>

                  {!showResults.value ? (
                    <div class="text-center py-8">
                      <div class="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p class="text-gray-500 text-sm">Enter your system details to see ROI</p>
                    </div>
                  ) : (
                    <div class="space-y-4">
                      {/* Payback Period */}
                      <div class="bg-white border border-gray-200 rounded-lg p-4">
                        <div class="text-sm text-gray-500 mb-1">Payback Period</div>
                        <div class="font-heading font-extrabold text-3xl text-[#042e0d]">
                          {financialProjection.value.paybackYear} <span class="text-lg">years</span>
                        </div>
                      </div>

                      {/* ROI */}
                      <div class="bg-[#56c270]/10 border border-[#56c270]/30 rounded-lg p-4">
                        <div class="text-sm text-gray-600 mb-1">25-Year ROI</div>
                        <div class="font-heading font-bold text-2xl text-[#042e0d]">
                          {financialProjection.value.roi.toFixed(0)}%
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div class="text-sm space-y-3">
                        <div class="flex justify-between">
                          <span class="text-gray-500">Year 1 savings</span>
                          <span class="font-semibold text-[#042e0d]">${financialProjection.value.firstYearSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-500">Year 25 savings</span>
                          <span class="font-semibold text-[#042e0d]">${financialProjection.value.year25Savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div class="pt-2 border-t border-gray-200">
                          <div class="flex justify-between">
                            <span class="text-gray-500">25-year total savings</span>
                            <span class="font-semibold text-[#042e0d]">${financialProjection.value.totalSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-500">Net profit</span>
                          <span class="font-semibold text-[#56c270]">${financialProjection.value.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div class="flex gap-2 pt-2">
                        <button
                          onClick$={copyShareLink}
                          class="flex-1 bg-white border border-gray-300 text-[#042e0d] font-semibold px-3 py-2 rounded text-sm hover:border-[#042e0d] transition-colors flex items-center justify-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Share
                        </button>
                        <button
                          onClick$={() => { showLeadCapture.value = true; }}
                          class="flex-1 bg-white border border-gray-300 text-[#042e0d] font-semibold px-3 py-2 rounded text-sm hover:border-[#042e0d] transition-colors flex items-center justify-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Savings Projection Chart (Text-based) */}
            {showResults.value && (
              <div class="mt-8">
                <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-4">25-Year Savings Projection</h2>
                <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead class="bg-[#f1f1f2]">
                        <tr>
                          <th class="text-left px-4 py-3 font-bold text-[#042e0d]">Year</th>
                          <th class="text-right px-4 py-3 font-bold text-[#042e0d]">Production</th>
                          <th class="text-right px-4 py-3 font-bold text-[#042e0d]">Rate</th>
                          <th class="text-right px-4 py-3 font-bold text-[#042e0d]">Annual Savings</th>
                          <th class="text-right px-4 py-3 font-bold text-[#042e0d]">Cumulative</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        {[1, 5, 10, 15, 20, 25].map((year) => {
                          const data = financialProjection.value.yearlyData[year - 1];
                          const isPaybackYear = financialProjection.value.paybackYear === year;
                          return (
                            <tr key={year} class={isPaybackYear ? 'bg-[#56c270]/10' : ''}>
                              <td class="px-4 py-3 font-semibold">
                                {year}
                                {isPaybackYear && <span class="ml-2 text-xs text-[#56c270]">★ Payback</span>}
                              </td>
                              <td class="px-4 py-3 text-right text-gray-600">{data.production.toLocaleString()} kWh</td>
                              <td class="px-4 py-3 text-right text-gray-600">${data.rate.toFixed(3)}</td>
                              <td class="px-4 py-3 text-right text-gray-600">${data.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                              <td class="px-4 py-3 text-right font-semibold text-[#042e0d]">${data.cumulative.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Lead Capture Modal */}
            {showLeadCapture.value && (
              <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-lg p-6 max-w-md w-full">
                  <div class="flex justify-between items-start mb-4">
                    <h3 class="font-heading font-bold text-lg text-[#042e0d]">Save Your ROI Analysis</h3>
                    <button
                      onClick$={() => { showLeadCapture.value = false; }}
                      class="text-gray-400 hover:text-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {!emailSubmitted.value ? (
                    <>
                      <p class="text-sm text-gray-500 mb-4">
                        Enter your email to save this analysis and receive a detailed PDF report you can share with customers.
                      </p>
                      <input
                        type="email"
                        value={email.value}
                        onInput$={(e) => { email.value = (e.target as HTMLInputElement).value; }}
                        placeholder="your@email.com"
                        class="w-full border border-gray-300 px-4 py-3 rounded mb-4 focus:outline-none focus:border-[#042e0d]"
                      />
                      <button
                        onClick$={submitEmail}
                        class="w-full bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-[#4ab362] transition-colors"
                      >
                        Save & Email Report
                      </button>
                      <p class="text-xs text-gray-400 mt-3 text-center">
                        We'll send you the full analysis and occasional product updates. Unsubscribe anytime.
                      </p>
                    </>
                  ) : (
                    <div class="text-center py-4">
                      <div class="w-12 h-12 bg-[#56c270]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#56c270]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p class="text-[#042e0d] font-semibold">Saved!</p>
                      <p class="text-sm text-gray-500 mt-1">Check your email for the detailed report.</p>
                      <button
                        onClick$={() => { showLeadCapture.value = false; }}
                        class="mt-4 text-[#5974c3] font-semibold hover:underline"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section class="py-10 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto">
            <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-6">Understanding Solar ROI</h2>
            <div class="grid md:grid-cols-2 gap-6">
              <div class="bg-white border border-gray-200 rounded-lg p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-2">Federal Tax Credit (ITC)</h3>
                <p class="text-sm text-gray-500">
                  The Investment Tax Credit allows you to deduct 30% of solar installation costs from federal taxes through 2032. It steps down to 26% in 2033 and 22% in 2034.
                </p>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-2">Panel Degradation</h3>
                <p class="text-sm text-gray-500">
                  Solar panels typically degrade 0.3-0.5% per year. Quality panels are warranted to produce at least 80% of rated output after 25 years.
                </p>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-2">Electricity Rate Trends</h3>
                <p class="text-sm text-gray-500">
                  US electricity rates have historically increased 2-3% annually. Higher rate increases improve solar ROI as your locked-in savings grow over time.
                </p>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-2">Net Metering</h3>
                <p class="text-sm text-gray-500">
                  This calculator assumes full retail credit for excess production. Check your utility's net metering policy, as some offer reduced credits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Ready to get a quote?</h3>
              <p class="text-white/70 mt-1">We can provide an accurate proposal with product pricing and financing options.</p>
            </div>
            <div class="flex gap-3">
              <Link href="/quote-request/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors">
                Request Quote
              </Link>
              <a href="tel:978-451-6890" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Solar ROI Estimator | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Calculate your solar system payback period and 25-year return on investment. Factor in tax credits, electricity rates, and production estimates.',
    },
  ],
};
