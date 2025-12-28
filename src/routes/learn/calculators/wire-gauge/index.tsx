import { component$, useSignal, useComputed$, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

// AWG wire gauge data: [gauge, diameter_mm, copper_resistance_ohm_per_1000ft, ampacity_75C]
const awgData = [
  { gauge: '14', diameterMm: 1.63, resistancePerKft: 2.525, ampacity: 15 },
  { gauge: '12', diameterMm: 2.05, resistancePerKft: 1.588, ampacity: 20 },
  { gauge: '10', diameterMm: 2.59, resistancePerKft: 0.999, ampacity: 30 },
  { gauge: '8', diameterMm: 3.26, resistancePerKft: 0.628, ampacity: 40 },
  { gauge: '6', diameterMm: 4.11, resistancePerKft: 0.395, ampacity: 55 },
  { gauge: '4', diameterMm: 5.19, resistancePerKft: 0.249, ampacity: 70 },
  { gauge: '3', diameterMm: 5.83, resistancePerKft: 0.197, ampacity: 85 },
  { gauge: '2', diameterMm: 6.54, resistancePerKft: 0.156, ampacity: 95 },
  { gauge: '1', diameterMm: 7.35, resistancePerKft: 0.124, ampacity: 110 },
  { gauge: '1/0', diameterMm: 8.25, resistancePerKft: 0.098, ampacity: 125 },
  { gauge: '2/0', diameterMm: 9.27, resistancePerKft: 0.078, ampacity: 145 },
  { gauge: '3/0', diameterMm: 10.40, resistancePerKft: 0.062, ampacity: 165 },
  { gauge: '4/0', diameterMm: 11.68, resistancePerKft: 0.049, ampacity: 195 },
];

export default component$(() => {
  const current = useSignal(30);
  const distance = useSignal(50);
  const voltage = useSignal(48);
  const maxVoltageDrop = useSignal(3);
  const wireType = useSignal('copper');
  const showResults = useSignal(false);
  const showLeadCapture = useSignal(false);
  const email = useSignal('');
  const emailSubmitted = useSignal(false);

  // Round trip distance (wire goes and returns)
  const roundTripDistance = useComputed$(() => distance.value * 2);

  // Calculate required wire gauge based on voltage drop
  const calculateResults = useComputed$(() => {
    const I = current.value;
    const L = roundTripDistance.value; // in feet
    const V = voltage.value;
    const maxDrop = maxVoltageDrop.value / 100;

    // Allowed voltage drop in volts
    const allowedDropVolts = V * maxDrop;

    // Maximum resistance allowed: R = V_drop / I
    // Resistance per 1000ft: R_1000 = R / (L/1000) = (V_drop * 1000) / (I * L)
    const maxResistancePerKft = (allowedDropVolts * 1000) / (I * L);

    // Aluminum has ~1.6x the resistance of copper
    const resistanceMultiplier = wireType.value === 'aluminum' ? 1.6 : 1.0;

    // Find the smallest gauge that meets both voltage drop and ampacity requirements
    let recommendedGauge = null;
    let alternativeGauges: typeof awgData = [];

    for (let i = awgData.length - 1; i >= 0; i--) {
      const wire = awgData[i];
      const effectiveResistance = wire.resistancePerKft * resistanceMultiplier;
      const actualVoltageDrop = (I * L * effectiveResistance) / 1000;
      const voltageDropPercent = (actualVoltageDrop / V) * 100;

      // Check ampacity (derate aluminum by 0.84 factor)
      const effectiveAmpacity = wireType.value === 'aluminum' ? wire.ampacity * 0.84 : wire.ampacity;

      if (effectiveResistance <= maxResistancePerKft && effectiveAmpacity >= I) {
        if (!recommendedGauge) {
          recommendedGauge = {
            ...wire,
            voltageDropVolts: actualVoltageDrop,
            voltageDropPercent,
            effectiveAmpacity,
            warning: false,
          };
        } else {
          alternativeGauges.push(wire);
        }
      }
    }

    // If no gauge found, recommend the largest available
    if (!recommendedGauge) {
      const largest = awgData[0];
      const effectiveResistance = largest.resistancePerKft * resistanceMultiplier;
      const actualVoltageDrop = (I * L * effectiveResistance) / 1000;
      recommendedGauge = {
        ...largest,
        voltageDropVolts: actualVoltageDrop,
        voltageDropPercent: (actualVoltageDrop / V) * 100,
        effectiveAmpacity: wireType.value === 'aluminum' ? largest.ampacity * 0.84 : largest.ampacity,
        warning: true,
      };
    }

    return {
      recommended: recommendedGauge,
      alternatives: alternativeGauges.slice(0, 2),
      allowedDropVolts,
    };
  });

  const calculate = $(() => {
    showResults.value = true;
  });

  const copyShareLink = $(() => {
    const params = new URLSearchParams();
    params.set('amps', current.value.toString());
    params.set('dist', distance.value.toString());
    params.set('v', voltage.value.toString());
    params.set('drop', maxVoltageDrop.value.toString());
    params.set('type', wireType.value);
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
      <section class="bg-[#56c270] py-10">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Calculator
            </div>
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-4">
              Wire Gauge Calculator
            </h1>
            <p class="text-white/90 text-lg max-w-2xl">
              Determine the correct AWG wire size based on current, distance, and acceptable voltage drop for safe and efficient solar installations.
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
            <span class="text-gray-600">Wire Gauge</span>
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
                {/* Circuit Parameters */}
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Circuit Parameters</h2>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-1.5">Current (Amps)</label>
                      <input
                        type="number"
                        value={current.value}
                        onInput$={(e) => { current.value = parseFloat((e.target as HTMLInputElement).value) || 0; }}
                        class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                      />
                      <p class="text-xs text-gray-400 mt-1">Maximum expected current</p>
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-1.5">One-Way Distance (feet)</label>
                      <input
                        type="number"
                        value={distance.value}
                        onInput$={(e) => { distance.value = parseFloat((e.target as HTMLInputElement).value) || 0; }}
                        class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                      />
                      <p class="text-xs text-gray-400 mt-1">Distance from source to load</p>
                    </div>
                  </div>
                </div>

                {/* System Settings */}
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">System Settings</h2>
                  <div class="grid md:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-1.5">System Voltage</label>
                      <select
                        value={voltage.value}
                        onChange$={(e) => { voltage.value = parseInt((e.target as HTMLSelectElement).value); }}
                        class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                      >
                        <option value="12">12V DC</option>
                        <option value="24">24V DC</option>
                        <option value="48">48V DC</option>
                        <option value="120">120V AC</option>
                        <option value="240">240V AC</option>
                        <option value="480">480V AC</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-1.5">Max Voltage Drop</label>
                      <select
                        value={maxVoltageDrop.value}
                        onChange$={(e) => { maxVoltageDrop.value = parseInt((e.target as HTMLSelectElement).value); }}
                        class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                      >
                        <option value="2">2% (NEC recommended)</option>
                        <option value="3">3% (Standard)</option>
                        <option value="5">5% (Maximum allowed)</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-1.5">Wire Type</label>
                      <select
                        value={wireType.value}
                        onChange$={(e) => { wireType.value = (e.target as HTMLSelectElement).value; }}
                        class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                      >
                        <option value="copper">Copper</option>
                        <option value="aluminum">Aluminum</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div class="bg-[#f1f1f2] border border-gray-200 rounded-lg p-4">
                  <p class="text-sm text-gray-600 mb-3 font-semibold">Common scenarios:</p>
                  <div class="flex flex-wrap gap-2">
                    {[
                      { label: 'Panel to combiner', amps: 10, dist: 30, v: 48 },
                      { label: 'Combiner to inverter', amps: 50, dist: 20, v: 48 },
                      { label: 'Battery to inverter', amps: 100, dist: 6, v: 48 },
                      { label: 'AC subpanel run', amps: 60, dist: 100, v: 240 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick$={() => {
                          current.value = preset.amps;
                          distance.value = preset.dist;
                          voltage.value = preset.v;
                        }}
                        class="px-3 py-1.5 rounded text-sm border bg-white text-gray-600 border-gray-300 hover:border-[#042e0d] transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculate Button */}
                <button
                  onClick$={calculate}
                  class="w-full bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-4 rounded hover:bg-[#4ab362] transition-colors text-lg"
                >
                  Calculate Wire Size
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
                          <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <p class="text-gray-500 text-sm">Enter your parameters to see results</p>
                    </div>
                  ) : (
                    <div class="space-y-4">
                      {/* Recommended Gauge */}
                      <div class="bg-white border border-gray-200 rounded-lg p-4">
                        <div class="text-sm text-gray-500 mb-1">Recommended Wire</div>
                        <div class="font-heading font-extrabold text-3xl text-[#042e0d]">
                          {calculateResults.value.recommended.gauge} <span class="text-lg">AWG</span>
                        </div>
                        <div class="text-sm text-gray-400 mt-1">
                          {wireType.value.charAt(0).toUpperCase() + wireType.value.slice(1)}
                        </div>
                        {calculateResults.value.recommended.warning && (
                          <div class="mt-2 bg-[#c3a859]/10 border border-[#c3a859]/30 rounded p-2 text-xs text-[#c3a859]">
                            Warning: May exceed voltage drop limit. Consider reducing distance or increasing voltage.
                          </div>
                        )}
                      </div>

                      {/* Voltage Drop */}
                      <div class={`rounded-lg p-3 ${
                        calculateResults.value.recommended.voltageDropPercent <= maxVoltageDrop.value
                          ? 'bg-[#56c270]/10 border border-[#56c270]/30'
                          : 'bg-[#c3a859]/10 border border-[#c3a859]/30'
                      }`}>
                        <div class="flex justify-between items-center">
                          <span class="text-sm text-gray-600">Voltage Drop</span>
                          <span class="font-heading font-bold text-[#042e0d]">
                            {calculateResults.value.recommended.voltageDropPercent.toFixed(2)}%
                          </span>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                          {calculateResults.value.recommended.voltageDropVolts.toFixed(2)}V of {voltage.value}V
                        </div>
                      </div>

                      {/* Wire Details */}
                      <div class="text-sm space-y-2">
                        <div class="flex justify-between">
                          <span class="text-gray-500">Ampacity (75°C)</span>
                          <span class="font-semibold text-[#042e0d]">{calculateResults.value.recommended.effectiveAmpacity.toFixed(0)}A</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-500">Round-trip distance</span>
                          <span class="font-semibold text-[#042e0d]">{roundTripDistance.value} ft</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-500">Wire diameter</span>
                          <span class="font-semibold text-[#042e0d]">{calculateResults.value.recommended.diameterMm} mm</span>
                        </div>
                      </div>

                      {/* Alternative Gauges */}
                      {calculateResults.value.alternatives.length > 0 && (
                        <div class="pt-2 border-t border-gray-200">
                          <p class="text-xs text-gray-500 mb-2">Larger alternatives:</p>
                          <div class="flex gap-2">
                            {calculateResults.value.alternatives.map((alt) => (
                              <span key={alt.gauge} class="text-sm bg-white border border-gray-300 rounded px-2 py-1">
                                {alt.gauge} AWG
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

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

            {/* Wire Gauge Reference Table */}
            {showResults.value && (
              <div class="mt-8">
                <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-4">Wire Gauge Reference</h2>
                <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead class="bg-[#f1f1f2]">
                        <tr>
                          <th class="text-left px-4 py-3 font-bold text-[#042e0d]">AWG</th>
                          <th class="text-left px-4 py-3 font-bold text-[#042e0d]">Diameter</th>
                          <th class="text-left px-4 py-3 font-bold text-[#042e0d]">Ampacity (75°C)</th>
                          <th class="text-left px-4 py-3 font-bold text-[#042e0d]">Typical Use</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        {awgData.slice(0, 8).map((wire) => (
                          <tr key={wire.gauge} class={calculateResults.value.recommended.gauge === wire.gauge ? 'bg-[#56c270]/10' : ''}>
                            <td class="px-4 py-3 font-semibold">{wire.gauge}</td>
                            <td class="px-4 py-3 text-gray-600">{wire.diameterMm} mm</td>
                            <td class="px-4 py-3 text-gray-600">{wire.ampacity}A</td>
                            <td class="px-4 py-3 text-gray-500 text-xs">
                              {wire.gauge === '14' && 'Light circuits, 15A breakers'}
                              {wire.gauge === '12' && 'General circuits, 20A breakers'}
                              {wire.gauge === '10' && 'Large appliances, 30A circuits'}
                              {wire.gauge === '8' && 'Subpanels, EV chargers'}
                              {wire.gauge === '6' && 'AC disconnects, larger loads'}
                              {wire.gauge === '4' && 'Service entrance, battery cables'}
                              {wire.gauge === '3' && 'Large inverter connections'}
                              {wire.gauge === '2' && 'High-current battery banks'}
                            </td>
                          </tr>
                        ))}
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
                        Enter your email to save this calculation and receive a PDF summary.
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
            <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-6">Wire Sizing Fundamentals</h2>
            <div class="grid md:grid-cols-2 gap-6">
              <div class="bg-white border border-gray-200 rounded-lg p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-2">Voltage Drop</h3>
                <p class="text-sm text-gray-500">
                  NEC recommends keeping voltage drop under 3% for branch circuits and 5% total for the entire system. Lower voltage drop means less energy loss and better equipment performance.
                </p>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-2">Ampacity</h3>
                <p class="text-sm text-gray-500">
                  Wire ampacity is the maximum current a conductor can carry continuously without exceeding its temperature rating. Always size for 80% of breaker rating.
                </p>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-2">Copper vs Aluminum</h3>
                <p class="text-sm text-gray-500">
                  Copper has lower resistance and higher ampacity but costs more. Aluminum requires larger gauges but is more economical for long runs and large conductors.
                </p>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-2">Temperature Rating</h3>
                <p class="text-sm text-gray-500">
                  This calculator uses 75°C (THHN/THWN) ratings. Higher temperature rated wire can carry more current. Always match wire rating to equipment terminals.
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
              <h3 class="font-heading font-extrabold text-2xl text-white">Need help with wiring design?</h3>
              <p class="text-white/70 mt-1">Our engineers can review your layout and recommend the right wire and conduit.</p>
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
  title: 'Wire Gauge Calculator | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Calculate the correct AWG wire size for your solar installation based on current, distance, and voltage drop requirements.',
    },
  ],
};
