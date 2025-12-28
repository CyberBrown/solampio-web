import { component$, useSignal, useComputed$, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

interface Load {
  id: number;
  name: string;
  watts: number;
  hoursPerDay: number;
}

const defaultLoads: Load[] = [
  { id: 1, name: 'LED Lights', watts: 50, hoursPerDay: 6 },
  { id: 2, name: 'Refrigerator', watts: 150, hoursPerDay: 24 },
  { id: 3, name: 'Phone Charger', watts: 10, hoursPerDay: 2 },
];

const batteryProducts = [
  {
    name: 'Fortress Power eFlex 5.4',
    capacity: 5.4,
    voltage: 48,
    chemistry: 'LiFePO4',
    slug: 'fortress-power-eflex-5-4',
  },
  {
    name: 'EG4 LL-S 48V 100Ah',
    capacity: 5.12,
    voltage: 48,
    chemistry: 'LiFePO4',
    slug: 'eg4-ll-s-48v-100ah',
  },
  {
    name: 'SimpliPhi PHI 3.8',
    capacity: 3.8,
    voltage: 48,
    chemistry: 'LiFePO4',
    slug: 'simpliphi-phi-3-8',
  },
  {
    name: 'Fortress Power eVault 18.5',
    capacity: 18.5,
    voltage: 48,
    chemistry: 'LiFePO4',
    slug: 'fortress-power-evault-18-5',
  },
];

export default component$(() => {
  const loads = useSignal<Load[]>(defaultLoads);
  const nextId = useSignal(4);
  const daysOfAutonomy = useSignal(1);
  const depthOfDischarge = useSignal(80);
  const systemVoltage = useSignal(48);
  const showResults = useSignal(false);
  const showLeadCapture = useSignal(false);
  const email = useSignal('');
  const emailSubmitted = useSignal(false);

  const totalDailyWh = useComputed$(() => {
    return loads.value.reduce((sum, load) => sum + (load.watts * load.hoursPerDay), 0);
  });

  const requiredCapacityWh = useComputed$(() => {
    return (totalDailyWh.value * daysOfAutonomy.value) / (depthOfDischarge.value / 100);
  });

  const requiredCapacityAh = useComputed$(() => {
    return requiredCapacityWh.value / systemVoltage.value;
  });

  const requiredCapacityKwh = useComputed$(() => {
    return requiredCapacityWh.value / 1000;
  });

  const recommendedProducts = useComputed$(() => {
    const required = requiredCapacityKwh.value;
    return batteryProducts
      .filter(p => p.voltage === systemVoltage.value)
      .map(product => {
        const unitsNeeded = Math.ceil(required / product.capacity);
        const totalCapacity = unitsNeeded * product.capacity;
        return {
          ...product,
          unitsNeeded,
          totalCapacity,
          meetsRequirement: totalCapacity >= required,
        };
      })
      .filter(p => p.unitsNeeded >= 1)
      .sort((a, b) => a.unitsNeeded - b.unitsNeeded)
      .slice(0, 3);
  });

  const addLoad = $(() => {
    loads.value = [...loads.value, { id: nextId.value, name: '', watts: 0, hoursPerDay: 0 }];
    nextId.value++;
  });

  const removeLoad = $((id: number) => {
    loads.value = loads.value.filter(load => load.id !== id);
  });

  const updateLoad = $((id: number, field: keyof Load, value: string | number) => {
    loads.value = loads.value.map(load => {
      if (load.id === id) {
        return { ...load, [field]: typeof value === 'string' && field !== 'name' ? parseFloat(value) || 0 : value };
      }
      return load;
    });
  });

  const calculate = $(() => {
    showResults.value = true;
  });

  const copyShareLink = $(() => {
    const params = new URLSearchParams();
    params.set('loads', JSON.stringify(loads.value.map(l => ({ n: l.name, w: l.watts, h: l.hoursPerDay }))));
    params.set('days', daysOfAutonomy.value.toString());
    params.set('dod', depthOfDischarge.value.toString());
    params.set('v', systemVoltage.value.toString());
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  });

  const submitEmail = $(() => {
    if (email.value && email.value.includes('@')) {
      emailSubmitted.value = true;
      // In production, this would submit to an API
    }
  });

  return (
    <div class="bg-white min-h-screen">
      {/* Hero */}
      <section class="bg-[#5974c3] py-10">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculator
            </div>
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-4">
              Battery Sizing Calculator
            </h1>
            <p class="text-white/80 text-lg max-w-2xl">
              Calculate the optimal battery bank capacity for your off-grid or backup system based on your daily loads and autonomy requirements.
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
            <span class="text-gray-600">Battery Sizing</span>
          </nav>
        </div>
      </section>

      {/* Calculator */}
      <section class="py-10">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto">
            <div class="grid lg:grid-cols-5 gap-8">
              {/* Input Section */}
              <div class="lg:col-span-3 space-y-6">
                {/* Loads */}
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <div class="flex justify-between items-center mb-4">
                    <h2 class="font-heading font-bold text-lg text-[#042e0d]">Daily Loads</h2>
                    <button
                      onClick$={addLoad}
                      class="text-sm text-[#5974c3] font-semibold hover:underline flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Add Load
                    </button>
                  </div>

                  <div class="space-y-3">
                    <div class="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase px-1">
                      <div class="col-span-5">Appliance</div>
                      <div class="col-span-3">Watts</div>
                      <div class="col-span-3">Hours/Day</div>
                      <div class="col-span-1"></div>
                    </div>
                    {loads.value.map((load) => (
                      <div key={load.id} class="grid grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          value={load.name}
                          onInput$={(e) => updateLoad(load.id, 'name', (e.target as HTMLInputElement).value)}
                          placeholder="Appliance name"
                          class="col-span-5 border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:border-[#042e0d]"
                        />
                        <input
                          type="number"
                          value={load.watts || ''}
                          onInput$={(e) => updateLoad(load.id, 'watts', (e.target as HTMLInputElement).value)}
                          placeholder="0"
                          class="col-span-3 border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:border-[#042e0d]"
                        />
                        <input
                          type="number"
                          value={load.hoursPerDay || ''}
                          onInput$={(e) => updateLoad(load.id, 'hoursPerDay', (e.target as HTMLInputElement).value)}
                          placeholder="0"
                          class="col-span-3 border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:border-[#042e0d]"
                        />
                        <button
                          onClick$={() => removeLoad(load.id)}
                          class="col-span-1 text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span class="text-sm text-gray-500">Total Daily Energy</span>
                    <span class="font-heading font-bold text-[#042e0d]">{totalDailyWh.value.toLocaleString()} Wh/day</span>
                  </div>
                </div>

                {/* System Parameters */}
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">System Parameters</h2>
                  <div class="grid md:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-1.5">Days of Autonomy</label>
                      <select
                        value={daysOfAutonomy.value}
                        onChange$={(e) => { daysOfAutonomy.value = parseInt((e.target as HTMLSelectElement).value); }}
                        class="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:border-[#042e0d]"
                      >
                        <option value="0.5">0.5 days (12 hours)</option>
                        <option value="1">1 day</option>
                        <option value="2">2 days</option>
                        <option value="3">3 days</option>
                        <option value="5">5 days</option>
                        <option value="7">7 days</option>
                      </select>
                      <p class="text-xs text-gray-400 mt-1">Backup duration without solar</p>
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-1.5">Depth of Discharge</label>
                      <select
                        value={depthOfDischarge.value}
                        onChange$={(e) => { depthOfDischarge.value = parseInt((e.target as HTMLSelectElement).value); }}
                        class="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:border-[#042e0d]"
                      >
                        <option value="50">50% (Lead Acid)</option>
                        <option value="80">80% (LiFePO4 Standard)</option>
                        <option value="90">90% (LiFePO4 Max)</option>
                        <option value="100">100% (Theoretical)</option>
                      </select>
                      <p class="text-xs text-gray-400 mt-1">Max recommended discharge</p>
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-1.5">System Voltage</label>
                      <select
                        value={systemVoltage.value}
                        onChange$={(e) => { systemVoltage.value = parseInt((e.target as HTMLSelectElement).value); }}
                        class="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:border-[#042e0d]"
                      >
                        <option value="12">12V</option>
                        <option value="24">24V</option>
                        <option value="48">48V</option>
                      </select>
                      <p class="text-xs text-gray-400 mt-1">Battery bank voltage</p>
                    </div>
                  </div>
                </div>

                {/* Calculate Button */}
                <button
                  onClick$={calculate}
                  class="w-full bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-4 rounded hover:bg-[#4ab362] transition-colors text-lg"
                >
                  Calculate Battery Size
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
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p class="text-gray-500 text-sm">Enter your loads and click calculate to see results</p>
                    </div>
                  ) : (
                    <div class="space-y-4">
                      {/* Key Metrics */}
                      <div class="bg-white border border-gray-200 rounded-lg p-4">
                        <div class="text-sm text-gray-500 mb-1">Required Capacity</div>
                        <div class="font-heading font-extrabold text-3xl text-[#042e0d]">
                          {requiredCapacityKwh.value.toFixed(1)} <span class="text-lg">kWh</span>
                        </div>
                        <div class="text-sm text-gray-400 mt-1">
                          {requiredCapacityAh.value.toFixed(0)} Ah @ {systemVoltage.value}V
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div class="text-sm space-y-2">
                        <div class="flex justify-between">
                          <span class="text-gray-500">Daily usage</span>
                          <span class="font-semibold text-[#042e0d]">{(totalDailyWh.value / 1000).toFixed(2)} kWh</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-500">× Days of autonomy</span>
                          <span class="font-semibold text-[#042e0d]">{daysOfAutonomy.value}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-500">÷ DoD ({depthOfDischarge.value}%)</span>
                          <span class="font-semibold text-[#042e0d]">{(depthOfDischarge.value / 100).toFixed(2)}</span>
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

            {/* Product Recommendations */}
            {showResults.value && (
              <div class="mt-8">
                <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-4">Recommended Batteries</h2>
                <div class="grid md:grid-cols-3 gap-4">
                  {recommendedProducts.value.map((product) => (
                    <Link
                      key={product.slug}
                      href={`/products/${product.slug}/`}
                      class="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-[#042e0d] transition-all group"
                    >
                      <div class="flex items-center gap-2 mb-3">
                        <span class="text-xs font-bold px-2 py-1 rounded bg-[#56c270]/10 text-[#042e0d]">
                          {product.chemistry}
                        </span>
                        <span class="text-xs text-gray-400">{product.voltage}V</span>
                      </div>
                      <h3 class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors mb-2">
                        {product.name}
                      </h3>
                      <p class="text-sm text-gray-500 mb-3">
                        {product.capacity} kWh per unit
                      </p>
                      <div class="bg-[#f1f1f2] rounded p-3 text-center">
                        <div class="text-xs text-gray-500">Quantity needed</div>
                        <div class="font-heading font-bold text-xl text-[#042e0d]">{product.unitsNeeded}</div>
                        <div class="text-xs text-gray-400">{product.totalCapacity.toFixed(1)} kWh total</div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div class="mt-4 text-center">
                  <Link href="/products/category/batteries/" class="text-[#5974c3] font-semibold hover:underline">
                    View all batteries →
                  </Link>
                </div>
              </div>
            )}

            {/* Lead Capture Modal */}
            {showLeadCapture.value && (
              <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-lg p-6 max-w-md w-full">
                  <div class="flex justify-between items-start mb-4">
                    <h3 class="font-heading font-bold text-lg text-[#042e0d]">Save Your Calculation</h3>
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
                        Enter your email to save this calculation and receive a PDF summary with product recommendations.
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
                        Save & Email Results
                      </button>
                      <p class="text-xs text-gray-400 mt-3 text-center">
                        We'll send you the calculation and occasional product updates. Unsubscribe anytime.
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
                      <p class="text-sm text-gray-500 mt-1">Check your email for the calculation summary.</p>
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
            <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-6">How to Use This Calculator</h2>
            <div class="grid md:grid-cols-2 gap-6">
              <div class="bg-white border border-gray-200 rounded-lg p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-2">1. List Your Loads</h3>
                <p class="text-sm text-gray-500">
                  Add each appliance you want to power, with its wattage and daily hours of use. Check appliance labels or use a kill-a-watt meter for accurate readings.
                </p>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-2">2. Set Autonomy Days</h3>
                <p class="text-sm text-gray-500">
                  Choose how many days of backup you need without solar charging. 1-2 days is typical for grid-tie backup; 3-5 days for off-grid.
                </p>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-2">3. Choose Battery Type</h3>
                <p class="text-sm text-gray-500">
                  Lead acid batteries should only be discharged to 50%. LiFePO4 batteries can safely discharge to 80-90% for more usable capacity.
                </p>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-2">4. Select System Voltage</h3>
                <p class="text-sm text-gray-500">
                  48V is standard for most residential systems. 12V and 24V are common for smaller off-grid or RV applications.
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
              <h3 class="font-heading font-extrabold text-2xl text-white">Need help sizing your battery bank?</h3>
              <p class="text-white/70 mt-1">Our engineers can review your loads and recommend the right solution.</p>
            </div>
            <a href="tel:978-451-6890" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call 978-451-6890
            </a>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Battery Sizing Calculator | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Calculate battery bank capacity for off-grid and backup solar systems. Get Ah and kWh recommendations based on your daily loads.',
    },
  ],
};
