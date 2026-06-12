'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { exportToCSV } from '@/lib/csv-export';

export default function ExplorerPage() {
  const [stations, setStations] = useState<any[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showParamFilter, setShowParamFilter] = useState(false);
  const [visibleParams, setVisibleParams] = useState({
    ph: true,
    turbidity: true,
    dissolved_oxygen: true,
    temperature: true,
    specific_conductance: true,
    flow_rate: true
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/water-quality');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setStations(json.data);
          setSelectedStationId(json.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching water quality data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeStation = stations.find(s => s.id === selectedStationId) || stations[0] || null;

  const ph = activeStation?.metrics?.ph ?? 7.4;
  const temp = activeStation?.metrics?.temperature ?? 18.4;
  const do2 = activeStation?.metrics?.dissolved_oxygen ?? 8.5;
  const turbidity = activeStation?.metrics?.turbidity ?? 2.1;
  const specific_conductance = activeStation?.metrics?.specific_conductance ?? 340;
  const flow_rate = activeStation?.metrics?.flow_rate ?? null;

  const lat = activeStation?.coordinates?.lat ?? 40.7128;
  const lng = activeStation?.coordinates?.lng ?? -74.0060;
  const qualityScore = activeStation?.quality_score ?? 90;

  // Derive biological indicators dynamically from active station quality score
  const isCritical = qualityScore < 70;
  const coliformValue = qualityScore < 70 ? '250 MPN/100mL' : qualityScore < 85 ? '110 MPN/100mL' : '45 MPN/100mL';
  const coliformStatus = qualityScore < 70 ? 'Warning' : 'Safe';
  const coliformDot = qualityScore < 70 ? 'bg-secondary' : 'bg-[#10b981]';
  const coliformHighlight = qualityScore < 70;

  const ecoliValue = qualityScore < 60 ? '45 CFU/100mL' : '< 10 CFU/100mL';
  const ecoliStatus = qualityScore < 60 ? 'Warning' : 'Safe';
  const ecoliDot = qualityScore < 60 ? 'bg-secondary' : 'bg-[#10b981]';
  const ecoliHighlight = qualityScore < 60;

  const enterococciValue = qualityScore < 70 ? '80 CFU/100mL' : '15 CFU/100mL';
  const enterococciStatus = qualityScore < 70 ? 'Warning' : 'Safe';
  const enterococciDot = qualityScore < 70 ? 'bg-secondary' : 'bg-[#10b981]';
  const enterococciHighlight = qualityScore < 70;

  const cyanobacteriaValue = qualityScore < 55 ? 'High count (Warning)' : 'Low cell count';
  const cyanobacteriaStatus = qualityScore < 55 ? 'Warning' : 'Safe';
  const cyanobacteriaDot = qualityScore < 55 ? 'bg-secondary' : 'bg-[#10b981]';
  const cyanobacteriaHighlight = qualityScore < 55;

  const handleExport = () => {
    if (!activeStation) {
      alert('No data available to export.');
      return;
    }
    const headers = [
      'Station ID', 'Location', 'State', 'Region', 'Latitude', 'Longitude', 
      'pH', 'Temperature (C)', 'Dissolved Oxygen (mg/L)', 'Turbidity (NTU)', 
      'Specific Conductance', 'Flow Rate', 'E. Coli', 'Total Coliforms', 'Enterococci', 'Cyanobacteria',
      'Quality Score', 'Status', 'Last Updated'
    ];
    const rows = [[
      activeStation.id || 'N/A',
      activeStation.location || 'N/A',
      activeStation.state || 'N/A',
      activeStation.region || 'N/A',
      lat,
      lng,
      ph,
      temp,
      do2,
      turbidity,
      specific_conductance,
      flow_rate !== null ? flow_rate : '',
      ecoliValue,
      coliformValue,
      enterococciValue,
      cyanobacteriaValue,
      qualityScore,
      activeStation.status || 'Excellent',
      activeStation.lastUpdated || new Date().toISOString()
    ]];
    exportToCSV(`station_${activeStation.id || 'export'}_telemetry.csv`, headers, rows);
  };

  const activeParamsCount = Object.values(visibleParams).filter(Boolean).length;

  return (
    <div className="flex-1 p-lg h-full overflow-y-auto">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col mb-lg gap-md border-b border-outline-variant pb-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Water Monitoring Station</h2>
              <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${loading ? 'bg-yellow-500' : 'bg-[#10b981]'}`}></span> 
                {loading ? 'Initializing Data Stream...' : `Active Station: ${activeStation?.location}`}
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-center mt-2 sm:mt-0 relative">
            {/* Parameters Filter Trigger */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowParamFilter(!showParamFilter)}
                className="px-3 py-2 border border-outline-variant rounded font-label-lg text-label-lg text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2 h-fit text-xs font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Parameters ({activeParamsCount})
              </motion.button>

              {showParamFilter && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-outline-variant rounded-lg p-md shadow-xl z-50 flex flex-col gap-sm">
                  <h5 className="font-label-md text-label-md font-bold border-b border-outline-variant pb-xs text-xs text-zinc-950 uppercase">Toggle Parameters</h5>
                  {Object.keys(visibleParams).map((key) => (
                    <label key={key} className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-zinc-700 hover:text-zinc-950">
                      <input
                        type="checkbox"
                        checked={visibleParams[key as keyof typeof visibleParams]}
                        onChange={() => setVisibleParams(prev => ({
                          ...prev,
                          [key]: !prev[key as keyof typeof visibleParams]
                        }))}
                        className="rounded border-outline-variant text-zinc-900 focus:ring-zinc-900 h-4 w-4"
                      />
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                  <button 
                    onClick={() => setShowParamFilter(false)}
                    className="mt-1 w-full bg-zinc-900 text-white text-[10px] py-1 rounded font-bold hover:bg-zinc-800 transition-colors uppercase"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            {/* Export Log Button */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="px-3 py-2 bg-primary rounded font-label-lg text-label-lg text-on-primary hover:bg-on-surface transition-colors flex items-center gap-2 h-fit text-xs font-bold shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Log
            </motion.button>
          </div>
        </div>

        {/* Station Selector Dropdown (Aligned below the Title and Action Buttons) */}
        {!loading && (
          <div className="relative w-full max-w-[500px]">
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="w-full bg-surface border border-outline-variant text-on-surface text-xs p-sm rounded-lg focus:outline-none focus:border-primary pr-10 appearance-none cursor-pointer font-bold shadow-sm"
            >
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.region === 'India' ? '🇮🇳 ' : station.region === 'USA' ? '🇺🇸 ' : '🌐 '}
                  {station.location} ({station.status})
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[16px]">expand_more</span>
          </div>
        )}
      </motion.div>

      {/* Dashboard Bento Grid */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Interactive Map Panel (Spans 8 cols) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 lg:col-span-8 border border-outline-variant bg-surface rounded overflow-hidden relative min-h-[500px] hover:shadow-lg transition-shadow flex flex-col justify-end"
        >
          <div className="absolute inset-0 bg-zinc-900 overflow-hidden">
            <motion.img 
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzptoObpt-XhKhJOzRj97CScT0Z9SeU4IaSv7GMBBliKm059kwFczKQJU-yYNEiQLq0sVnw22E4f8UMPZCTgHL3T2-f8ckdcK2KVkXXyS6z4SYTeXVAsxMT2CIm7DUJ7iFYHcFUCHcPRf9zbRO56XEhXWSfWCGWd5QIAUFt0takgEJA9q4CVANTTWVelmPJ4QNzO2PXEO2phBioJRCFnVGVkLr3MLOBC36cZY7aUm5GrcDy56u64dNRx3ImI9XNj1knbo61H0WIzNu"
            />
            {/* Map UI Overlay Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent to-zinc-950/80 pointer-events-none"></div>
            
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-4 left-4 flex gap-2 z-10"
            >
              <span className="px-2.5 py-1 bg-white/10 backdrop-blur border border-white/20 text-white font-label-md text-label-md rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">my_location</span>
                {loading ? 'Locating...' : `${lat.toFixed(4)}°N ${lng.toFixed(4)}°E`}
              </span>
              <span className="px-2.5 py-1 bg-white/10 backdrop-blur border border-white/20 text-white font-label-md text-label-md rounded">
                Region: {activeStation?.region || 'N/A'}
              </span>
            </motion.div>

            {/* Target Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center group cursor-crosshair">
              <div className="w-32 h-32 border border-cyan-400/30 rounded-full animate-[spin_10s_linear_infinite] absolute"></div>
              <div className="w-8 h-8 border-2 border-cyan-400 flex items-center justify-center relative">
                <div className="w-1.5 h-1.5 bg-cyan-400"></div>
              </div>
              {/* Tooltip */}
              <div 
                className="absolute top-full mt-3 bg-zinc-950 border border-zinc-700 text-white p-3 rounded-lg shadow-2xl w-64 z-20 backdrop-blur-md opacity-100 transition-opacity"
              >
                <div className="font-label-md text-label-md text-zinc-300 mb-1 border-b border-zinc-700 pb-1 truncate font-bold text-xs uppercase">{activeStation?.location || 'Select Station'}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-body-md text-[11px] text-zinc-400">Quality Score</span>
                  <span className="font-label-md text-[12px] text-cyan-400 font-bold">{qualityScore} AQI</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-[11px] text-zinc-400">Status</span>
                  <span className="font-label-md text-[12px] text-cyan-400 font-bold">{activeStation?.status || 'Active'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-[11px] text-zinc-400">Last Sync</span>
                  <span className="font-label-md text-[12px] text-cyan-400 font-bold">
                    {activeStation?.lastUpdated ? new Date(activeStation.lastUpdated).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Real-time Quality Metrics Grid (Spans 4 cols) */}
        <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-gutter max-h-[500px] overflow-y-auto">
          {activeParamsCount === 0 ? (
            <div className="col-span-2 border border-outline-variant bg-surface rounded p-lg text-center text-on-surface-variant font-body-md text-sm">
              <span className="material-symbols-outlined text-[36px] text-outline mb-sm block">filter_alt_off</span>
              No parameters selected. Toggle parameters to monitor telemetry.
            </div>
          ) : (
            <>
              {/* Metric 1: pH */}
              {visibleParams.ph && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-outline-variant bg-surface rounded p-md flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">pH Level</span>
                    <span className="material-symbols-outlined text-[16px] text-outline">science</span>
                  </div>
                  <div className="my-2 h-8 flex items-end gap-0.5">
                    {[40,30,35,32,33,31,60,50,70,85].map((h, i) => (
                      <div 
                        key={i} 
                        className={`w-full ${i===9 ? 'bg-[#10b981]' : i>5 ? 'bg-[#10b981]/20' : 'bg-outline-variant/20'} rounded-t-[2px]`} 
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="font-headline-lg text-headline-lg text-on-surface mb-1 font-bold text-xl">{ph.toFixed(2)}</div>
                    <div className={`flex items-center gap-1 font-label-md text-label-md ${ph >= 6.5 && ph <= 8.5 ? 'text-[#10b981]' : 'text-secondary'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {ph >= 6.5 && ph <= 8.5 ? 'check_circle' : 'warning'}
                      </span>
                      <span>{ph >= 6.5 && ph <= 8.5 ? 'Optimal' : 'Skewed'}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Metric 2: Turbidity */}
              {visibleParams.turbidity && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-outline-variant bg-surface rounded p-md flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">Turbidity</span>
                    <span className="material-symbols-outlined text-[16px] text-outline">blur_on</span>
                  </div>
                  <div className="my-2 h-8 flex items-end gap-0.5">
                    {[30,35,32,33,31,60,55,65,75,80].map((h, i) => (
                      <div 
                        key={i} 
                        className={`w-full ${i===9 ? 'bg-[#10b981]' : i>4 ? 'bg-[#10b981]/20' : 'bg-outline-variant/20'} rounded-t-[2px]`} 
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="font-headline-lg text-headline-lg text-on-surface mb-1 font-bold text-xl">
                      {turbidity.toFixed(1)}
                      <span className="text-xs font-normal text-on-surface-variant ml-1 font-sans">NTU</span>
                    </div>
                    <div className={`flex items-center gap-1 font-label-md text-label-md ${turbidity < 5.0 ? 'text-[#10b981]' : 'text-secondary'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {turbidity < 5.0 ? 'check_circle' : 'warning'}
                      </span>
                      <span>{turbidity < 5.0 ? 'Clear' : 'Turbid'}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Metric 3: Dissolved Oxygen */}
              {visibleParams.dissolved_oxygen && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-outline-variant bg-surface rounded p-md flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">Dissolved O2</span>
                    <span className="material-symbols-outlined text-[16px] text-outline">air</span>
                  </div>
                  <div className="my-2 h-8 flex items-end gap-0.5">
                    {[60,55,65,75,80,30,35,32,33,31].map((h, i) => (
                      <div 
                        key={i} 
                        className={`w-full ${i===4 ? 'bg-[#10b981]' : i<5 ? 'bg-[#10b981]/20' : 'bg-outline-variant/20'} rounded-t-[2px]`} 
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="font-headline-lg text-headline-lg text-on-surface mb-1 font-bold text-xl">
                      {do2.toFixed(1)}
                      <span className="text-xs font-normal text-on-surface-variant ml-1 font-sans">mg/L</span>
                    </div>
                    <div className={`flex items-center gap-1 font-label-md text-label-md ${do2 >= 6.5 ? 'text-[#10b981]' : 'text-secondary'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {do2 >= 6.5 ? 'check_circle' : 'warning'}
                      </span>
                      <span>{do2 >= 6.5 ? 'Healthy' : 'Hypoxic'}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Metric 4: Temperature */}
              {visibleParams.temperature && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-outline-variant bg-surface rounded p-md flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">Temperature</span>
                    <span className="material-symbols-outlined text-[16px] text-outline">thermostat</span>
                  </div>
                  <div className="my-2 h-8 flex items-end gap-0.5">
                    {[40,50,65,80,95,30,35,32,33,31].map((h, i) => (
                      <div 
                        key={i} 
                        className={`w-full ${i===4 ? 'bg-secondary' : i<5 ? 'bg-secondary/20' : 'bg-outline-variant/20'} rounded-t-[2px]`} 
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="font-headline-lg text-headline-lg text-on-surface mb-1 font-bold text-xl">
                      {temp.toFixed(1)}
                      <span className="text-xs font-normal text-on-surface-variant ml-1 font-sans">°C</span>
                    </div>
                    <div className="flex items-center gap-1 font-label-md text-label-md text-zinc-500">
                      <span className="material-symbols-outlined text-[14px]">device_thermostat</span>
                      <span>{temp < 15 ? 'Cold' : temp < 25 ? 'Cool' : 'Warm'}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Metric 5: Specific Conductance */}
              {visibleParams.specific_conductance && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-outline-variant bg-surface rounded p-md flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">Conductance</span>
                    <span className="material-symbols-outlined text-[16px] text-outline">electric_bolt</span>
                  </div>
                  <div className="my-2 h-8 flex items-end gap-0.5">
                    {[50,45,60,70,80,75,90,85,60,55].map((h, i) => (
                      <div 
                        key={i} 
                        className={`w-full ${i===6 ? 'bg-zinc-700' : 'bg-zinc-300/30'} rounded-t-[2px]`} 
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="font-headline-lg text-headline-lg text-on-surface mb-1 font-bold text-xl">
                      {specific_conductance}
                      <span className="text-xs font-normal text-on-surface-variant ml-1 font-sans">µS/cm</span>
                    </div>
                    <div className={`flex items-center gap-1 font-label-md text-label-md ${specific_conductance < 800 ? 'text-[#10b981]' : 'text-secondary'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {specific_conductance < 800 ? 'check_circle' : 'warning'}
                      </span>
                      <span>{specific_conductance < 800 ? 'Normal TDS' : 'High TDS'}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Metric 6: Flow Rate */}
              {visibleParams.flow_rate && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-outline-variant bg-surface rounded p-md flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">Flow Rate</span>
                    <span className="material-symbols-outlined text-[16px] text-outline">waves</span>
                  </div>
                  <div className="my-2 h-8 flex items-end gap-0.5">
                    {[30,40,50,45,35,60,70,85,90,95].map((h, i) => (
                      <div 
                        key={i} 
                        className={`w-full ${i===9 ? 'bg-blue-600' : 'bg-blue-200/30'} rounded-t-[2px]`} 
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="font-headline-lg text-headline-lg text-on-surface mb-1 font-bold text-xl">
                      {flow_rate !== null ? flow_rate.toLocaleString() : 'N/A'}
                      <span className="text-xs font-normal text-on-surface-variant ml-1 font-sans">m³/s</span>
                    </div>
                    <div className="flex items-center gap-1 font-label-md text-label-md text-zinc-500">
                      <span className="material-symbols-outlined text-[14px]">waves</span>
                      <span>Active Flow</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Pathogen Tracking Indicators (Spans 12 cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-12 border border-outline-variant bg-surface rounded flex flex-col hover:shadow-md transition-shadow"
        >
          <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
            <h3 className="font-label-lg text-label-lg text-on-surface uppercase tracking-wide flex items-center gap-2 text-xs font-bold">
              <span className="material-symbols-outlined text-[18px]">bug_report</span>
              Biological Threat Indicators
            </h3>
            <span className="font-label-md text-label-md text-on-surface-variant text-xs font-semibold">
              Last scan: {activeStation?.lastUpdated ? new Date(activeStation.lastUpdated).toLocaleTimeString() : 'Just now'}
            </span>
          </div>
          <div className="flex-1 p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-outline-variant/50 bg-surface-bright">
                  <th className="font-label-md text-label-md text-on-surface-variant p-3 font-medium w-1/2 text-xs uppercase font-bold">Indicator</th>
                  <th className="font-label-md text-label-md text-on-surface-variant p-3 font-medium text-xs uppercase font-bold">Concentration</th>
                  <th className="font-label-md text-label-md text-on-surface-variant p-3 font-medium text-right text-xs uppercase font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Escherichia coli (E. coli)', value: ecoliValue, status: ecoliStatus, dot: ecoliDot, highlight: ecoliHighlight },
                  { name: 'Total Coliforms', value: coliformValue, status: coliformStatus, dot: coliformDot, highlight: coliformHighlight },
                  { name: 'Enterococci', value: enterococciValue, status: enterococciStatus, dot: enterococciDot, highlight: enterococciHighlight },
                  { name: 'Cyanobacteria', value: cyanobacteriaValue, status: cyanobacteriaStatus, dot: cyanobacteriaDot, highlight: cyanobacteriaHighlight }
                ].map((row, idx) => (
                  <tr 
                    key={idx}
                    className={`border-b border-outline-variant/30 transition-colors ${row.highlight ? 'bg-red-50/20' : ''} hover:bg-zinc-50/50`}
                  >
                    <td className="p-3 font-body-md text-[14px] text-on-surface flex items-center gap-2 text-sm font-semibold">
                      <div className={`w-1.5 h-1.5 rounded-full ${row.dot}`}></div>
                      {row.name}
                    </td>
                    <td className="p-3 font-label-md text-[13px] text-on-surface-variant text-sm font-semibold">{row.value}</td>
                    <td className="p-3 text-right">
                      <span className={`inline-block px-2.5 py-1 font-label-md text-[11px] rounded font-bold uppercase ${
                        row.highlight 
                          ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse' 
                          : 'bg-zinc-100 border border-zinc-200 text-zinc-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
