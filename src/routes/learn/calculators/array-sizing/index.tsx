import { component$, useSignal, useComputed$, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

// Peak sun hours by US region (annual average)
const sunHoursData: Record<string, { name: string; hours: number }> = {
  'southwest': { name: 'Southwest (AZ, NV, NM)', hours: 6.5 },
  'california': { name: 'California', hours: 5.5 },
  'southeast': { name: 'Southeast (FL, GA, SC)', hours: 5.0 },
  'midwest': { name: 'Midwest (TX, OK, KS)', hours: 5.0 },
  'midatlantic': { name: 'Mid-Atlantic (NC, VA, MD)', hours: 4.5 },
  'northeast': { name: 'Northeast (NY, MA, PA)', hours: 4.0 },
  'northwest': { name: 'Pacific Northwest (WA, OR)', hours: 3.5 },
  'mountains': { name: 'Mountain States (CO, UT)', hours: 5.5 },
  'custom': { name: 'Custom (enter below)', hours: 0 },
};

const panelProducts = [
  {
    name: 'ZNShine 550W Mono',
    wattage: 550,
    efficiency: 21.3,
    type: 'Monocrystalline',
    slug: 'znshine-550w-mono',
  },
  {
    name: 'ZNShine 450W Mono',
    wattage: 450,
    efficiency: 20.5,
    type: 'Monocrystalline',
    slug: 'znshine-450w-mono',
  },
  {
    name: 'ZNShine 400W Mono',
    wattage: 400,
    efficiency: 20.1,
    type: 'Monocrystalline',
    slug: 'znshine-400w-mono',
  },
];

export default component$(() => {
  const dailyUsageKwh = useSignal(30);
  const region = useSignal('northeast');
  const customSunHours = useSignal(4.5);
  const systemLosses = useSignal(20);
  const showResults = useSignal(false);
  const showLeadCapture = useSignal(false);
  const email = useSignal('');
  const emailSubmitted = useSignal(false);

  const effectiveSunHours = useComputed$(() => {
    if (region.value === 'custom') {
      return customSunHours.value;
    }
    return sunHoursData[region.value]?.hours || 4.5;
  });

  const systemEfficiency = useComputed$(() => {
    return (100 - systemLosses.value) / 100;
  });

  const requiredDailyProduction = useComputed$(() => {
    return dailyUsageKwh.value / systemEfficiency.value;
  });

  const requiredArrayWattage = useComputed$(() => {
    return (requiredDailyProduction.value / effectiveSunHours.value) * 1000;
  });

  const recommendedPanels = useComputed$(() => {
    const required = requiredArrayWattage.value;
    return panelProducts.map(panel => {
      const panelsNeeded = Math.ceil(required / panel.wattage);
      const totalWattage = panelsNeeded * panel.wattage;
      const dailyProduction = (totalWattage / 1000) * effectiveSunHours.value * systemEfficiency.value;
      return {
        ...panel,
        panelsNeeded,
        totalWattage,
        dailyProduction,
      };
    });
  });

  const calculate = $(() => {
    showResults.value = true;
  });

  const copyShareLink = $(() => {
    const params = new URLSearchParams();
    params.set('usage', dailyUsageKwh.value.toString());
    params.set('region', region.value);
    params.set('sunhours', customSunHours.value.toString());
    params.set('losses', systemLosses.value.toString());
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
      <section class="bg-[#c3a859] py-10">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Calculator
            </div>
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-4">
              Solar Array Sizing Calculator
            </h1>
            <p class="text-white/90 text-lg max-w-2xl">
              Determine the solar panel wattage needed to meet your energy needs based on your location's sun hours and system efficiency.
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
            <span class="text-gray-600">Solar Array Sizing</span>
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
                {/* Energy Usage */}
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Daily Energy Usage</h2>
                  <div>
                    <label class="block text-sm font-bold text-[#042e0d] mb-1.5">Average Daily Usage (kWh)</label>
                    <input
                      type="number"
                      value={dailyUsageKwh.value}
                      onInput$={(e) => { dailyUsageKwh.value = parseFloat((e.target as HTMLInputElement).value) || 0; }}
                      class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                    />
                    <p class="text-xs text-gray-400 mt-1">Check your utility bill for average daily kWh usage</p>
                  </div>

                  <div class="mt-4 pt-4 border-t border-gray-100">
                    <p class="text-sm text-gray-500 mb-2">Quick reference (US averages):</p>
                    <div class="flex flex-wrap gap-2">
                      {[
                        { label: 'Small home', value: 20 },
                        { label: 'Average home', value: 30 },
                        { label: 'Large home', value: 50 },
                        { label: 'Small business', value: 100 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick$={() => { dailyUsageKwh.value = preset.value; }}
                          class={`px-3 py-1 rounded text-sm border transition-colors ${
                            dailyUsageKwh.value === preset.value
                              ? 'bg-[#042e0d] text-white border-[#042e0d]'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-[#042e0d]'
                          }`}
                        >
                          {preset.label} ({preset.value} kWh)
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Location & Sun Hours</h2>
                  <div>
                    <label class="block text-sm font-bold text-[#042e0d] mb-1.5">Region</label>
                    <select
                      value={region.value}
                      onChange$={(e) => { region.value = (e.target as HTMLSelectElement).value; }}
                      class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                    >
                      {Object.entries(sunHoursData).map(([key, data]) => (
                        <option key={key} value={key}>
                          {`${data.name}${key !== 'custom' ? ` (${data.hours} hrs/day)` : ''}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {region.value === 'custom' && (
                    <div class="mt-4">
                      <label class="block text-sm font-bold text-[#042e0d] mb-1.5">Peak Sun Hours per Day</label>
                      <input
                        type="number"
                        step="0.1"
                        value={customSunHours.value}
                        onInput$={(e) => { customSunHours.value = parseFloat((e.target as HTMLInputElement).value) || 0; }}
                        class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                      />
                      <p class="text-xs text-gray-400 mt-1">
                        Find your local peak sun hours at <a href="https://pvwatts.nrel.gov" target="_blank" class="text-[#5974c3] hover:underline">PVWatts</a>
                      </p>
                    </div>
                  )}

                  <div class="mt-4 bg-[#f1f1f2] rounded p-3">
                    <div class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c3a859]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span class="font-semibold text-[#042e0d]">{effectiveSunHours.value} peak sun hours/day</span>
                    </div>
                  </div>
                </div>

                {/* System Losses */}
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">System Efficiency</h2>
                  <div>
                    <label class="block text-sm font-bold text-[#042e0d] mb-1.5">System Losses (%)</label>
                    <select
                      value={systemLosses.value}
                      onChange$={(e) => { systemLosses.value = parseInt((e.target as HTMLSelectElement).value); }}
                      class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                    >
                      <option value="15">15% (Optimal - new system, ideal conditions)</option>
                      <option value="20">20% (Typical - standard installation)</option>
                      <option value="25">25% (Higher losses - shading, older equipment)</option>
                      <option value="30">30% (Significant losses - partial shading)</option>
                    </select>
                    <p class="text-xs text-gray-400 mt-1">Accounts for inverter efficiency, wiring, temperature, and soiling</p>
                  </div>
                </div>

                {/* Calculate Button */}
                <button
                  onClick$={calculate}
                  class="w-full bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-4 rounded hover:bg-[#4ab362] transition-colors text-lg"
                >
                  Calculate Array Size
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
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <p class="text-gray-500 text-sm">Enter your usage and location to see results</p>
                    </div>
                  ) : (
                    <div class="space-y-4">
                      {/* Key Metrics */}
                      <div class="bg-white border border-gray-200 rounded-lg p-4">
                        <div class="text-sm text-gray-500 mb-1">Recommended Array Size</div>
                        <div class="font-heading font-extrabold text-3xl text-[#042e0d]">
                          {(requiredArrayWattage.value / 1000).toFixed(1)} <span class="text-lg">kW</span>
                        </div>
                        <div class="text-sm text-gray-400 mt-1">
                          {requiredArrayWattage.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} watts
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div class="text-sm space-y-2">
                        <div class="flex justify-between">
                          <span class="text-gray-500">Daily usage</span>
                          <span class="font-semibold text-[#042e0d]">{dailyUsageKwh.value} kWh</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-500">After losses ({systemLosses.value}%)</span>
                          <span class="font-semibold text-[#042e0d]">{requiredDailyProduction.value.toFixed(1)} kWh</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-500">÷ Sun hours</span>
                          <span class="font-semibold text-[#042e0d]">{effectiveSunHours.value} hrs</span>
                        </div>
                      </div>

                      {/* Annual Production */}
                      <div class="bg-[#56c270]/10 border border-[#56c270]/30 rounded-lg p-3">
                        <div class="text-sm text-gray-600">Estimated Annual Production</div>
                        <div class="font-heading font-bold text-lg text-[#042e0d]">
                          {(dailyUsageKwh.value * 365).toLocaleString()} kWh/year
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
                <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-4">Recommended Panels</h2>
                <div class="grid md:grid-cols-3 gap-4">
                  {recommendedPanels.value.map((panel) => (
                    <Link
                      key={panel.slug}
                      href={`/products/${panel.slug}/`}
                      class="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-[#042e0d] transition-all group"
                    >
                      <div class="flex items-center gap-2 mb-3">
                        <span class="text-xs font-bold px-2 py-1 rounded bg-[#c3a859]/10 text-[#c3a859]">
                          {panel.type}
                        </span>
                        <span class="text-xs text-gray-400">{panel.efficiency}% eff.</span>
                      </div>
                      <h3 class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors mb-2">
                        {panel.name}
                      </h3>
                      <p class="text-sm text-gray-500 mb-3">
                        {panel.wattage}W per panel
                      </p>
                      <div class="bg-[#f1f1f2] rounded p-3 text-center">
                        <div class="text-xs text-gray-500">Panels needed</div>
                        <div class="font-heading font-bold text-xl text-[#042e0d]">{panel.panelsNeeded}</div>
                        <div class="text-xs text-gray-400">{(panel.totalWattage / 1000).toFixed(1)} kW total</div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div class="mt-4 text-center">
                  <Link href="/categories/solar-panels/" class="text-[#5974c3] font-semibold hover:underline">
                    View all solar panels →
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
            <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-6">Understanding Array Sizing</h2>
            <div class="grid md:grid-cols-2 gap-6">
              <div class="bg-white border border-gray-200 rounded-lg p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-2">Peak Sun Hours</h3>
                <p class="text-sm text-gray-500">
                  Peak sun hours represent the equivalent number of hours at 1,000 W/m² solar irradiance. This varies significantly by location and season.
                </p>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-2">System Losses</h3>
                <p class="text-sm text-gray-500">
                  Real-world systems lose 15-25% of rated output due to inverter efficiency, wiring, temperature derating, soiling, and shading.
                </p>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-2">Oversizing</h3>
                <p class="text-sm text-gray-500">
                  Many installers oversize by 10-20% to account for panel degradation and ensure production meets expectations year-round.
                </p>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-2">Net Metering</h3>
                <p class="text-sm text-gray-500">
                  If your utility offers net metering, consider sizing to 100-110% of annual usage to maximize bill credits during sunny months.
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
              <h3 class="font-heading font-extrabold text-2xl text-white">Need a detailed site assessment?</h3>
              <p class="text-white/70 mt-1">Our team can help with shading analysis and optimized system design.</p>
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
  title: 'Solar Array Sizing Calculator | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Calculate the solar panel wattage needed for your location. Factor in sun hours, system losses, and daily energy usage.',
    },
  ],
};
