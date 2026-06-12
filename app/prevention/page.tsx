'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Predefined list of lakes with their coordinates (lat, lng)
const LAKES_DB = [
  // India
  { name: "Dal Lake, Srinagar", lat: 34.11, lng: 74.87, region: "India" },
  { name: "Vembanad Lake, Kerala", lat: 9.58, lng: 76.40, region: "India" },
  { name: "Chilika Lake, Odisha", lat: 19.67, lng: 85.33, region: "India" },
  { name: "Wular Lake, Jammu & Kashmir", lat: 34.35, lng: 74.58, region: "India" },
  { name: "Loktak Lake, Manipur", lat: 24.55, lng: 93.80, region: "India" },
  { name: "Lonar Lake, Maharashtra", lat: 19.97, lng: 76.51, region: "India" },
  { name: "Pangong Tso, Ladakh", lat: 33.75, lng: 78.67, region: "India" },
  { name: "Lake Pichola, Rajasthan", lat: 24.57, lng: 73.68, region: "India" },
  // USA
  { name: "Lake Tahoe, California/Nevada", lat: 39.09, lng: -120.04, region: "USA" },
  { name: "Crater Lake, Oregon", lat: 42.94, lng: -122.10, region: "USA" },
  { name: "Lake Michigan", lat: 44.00, lng: -87.00, region: "USA" },
  { name: "Lake Superior", lat: 47.70, lng: -87.50, region: "USA" },
  { name: "Lake Huron", lat: 44.80, lng: -82.40, region: "USA" },
  { name: "Lake Erie", lat: 42.20, lng: -80.80, region: "USA" },
  { name: "Lake Ontario", lat: 43.70, lng: -77.90, region: "USA" },
  { name: "Lake Okeechobee, Florida", lat: 26.93, lng: -80.80, region: "USA" },
  { name: "Lake Mead, Nevada/Arizona", lat: 36.15, lng: -114.40, region: "USA" },
  { name: "Lake Powell, Utah/Arizona", lat: 37.07, lng: -111.24, region: "USA" },
  // World
  { name: "Lake Baikal, Russia", lat: 53.50, lng: 108.00, region: "World" },
  { name: "Lake Victoria, East Africa", lat: -1.00, lng: 33.00, region: "World" },
  { name: "Lake Tanganyika, East Africa", lat: -6.20, lng: 29.50, region: "World" },
  { name: "Lake Geneva, Switzerland/France", lat: 46.43, lng: 6.45, region: "World" },
  { name: "Loch Ness, Scotland", lat: 57.30, lng: -4.45, region: "World" },
  { name: "Lake Titicaca, Peru/Bolivia", lat: -15.80, lng: -69.40, region: "World" },
  { name: "Caspian Sea", lat: 42.00, lng: 50.50, region: "World" }
];

function parseCoordinates(input: string) {
  const cleaned = input.replace(/[°'"]/g, '');
  const regex = /(-?\d+(?:\.\d+)?)\s*([NSns])?,?\s*(-?\d+(?:\.\d+)?)\s*([EWew])?/;
  const match = cleaned.match(regex);
  if (!match) return null;
  
  let lat = parseFloat(match[1]);
  let lng = parseFloat(match[3]);
  
  const latDir = match[2];
  const lngDir = match[4];
  
  if (latDir && latDir.toUpperCase() === 'S') lat = -lat;
  if (lngDir && lngDir.toUpperCase() === 'W') lng = -lng;
  
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

function findMatchedLake(input: string) {
  if (!input || input.trim().length < 2) return null;
  
  const lowerInput = input.toLowerCase().trim();
  for (const lake of LAKES_DB) {
    const nameParts = lake.name.toLowerCase().split(',');
    const simpleName = nameParts[0].trim();
    if (
      lowerInput.includes(simpleName) || 
      simpleName.includes(lowerInput) ||
      lake.name.toLowerCase().includes(lowerInput)
    ) {
      if (lowerInput.length >= 3 || simpleName === lowerInput) {
        return lake;
      }
    }
  }
  
  const coords = parseCoordinates(input);
  if (coords) {
    let minDistance = Infinity;
    let closestLake = null;
    
    for (const lake of LAKES_DB) {
      const dLat = lake.lat - coords.lat;
      const dLng = lake.lng - coords.lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < minDistance) {
        minDistance = dist;
        closestLake = lake;
      }
    }
    
    if (closestLake && minDistance < 12) {
      return closestLake;
    }
  }
  
  return null;
}

export default function PreventionPage() {
  const [data, setData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for Incident Log
  const [vector, setVector] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [severity, setSeverity] = useState('ELEVATED');
  const [notes, setNotes] = useState('');
  const [submittingLog, setSubmittingLog] = useState(false);

  const detectedLake = findMatchedLake(coordinates);

  // Form states for Add Directive
  const [showAddDirective, setShowAddDirective] = useState(false);
  const [dirTitle, setDirTitle] = useState('');
  const [dirStatus, setDirStatus] = useState('Drafting');
  const [dirEnforcement, setDirEnforcement] = useState('');
  const [submittingDir, setSubmittingDir] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [directivesRes, logsRes] = await Promise.all([
        fetch('/api/directives'),
        fetch('/api/incident-logs')
      ]);
      const directivesJson = await directivesRes.json();
      const logsJson = await logsRes.json();
      if (directivesJson.success) setData(directivesJson.data);
      if (logsJson.success) setLogs(logsJson.data);
    } catch (err) {
      console.error('Error fetching prevention data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vector || vector === 'Select Vector...' || !coordinates || !notes) {
      alert('Please fill in all fields.');
      return;
    }
    setSubmittingLog(true);

    const finalCoordinates = detectedLake && !coordinates.toLowerCase().includes(detectedLake.name.split(',')[0].toLowerCase())
      ? `${coordinates} (${detectedLake.name})`
      : coordinates;

    try {
      const res = await fetch('/api/incident-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vector, coordinates: finalCoordinates, severity, notes })
      });
      const json = await res.json();
      if (json.success) {
        setLogs(prev => [...prev, json.data]);
        // Reset form
        setVector('');
        setCoordinates('');
        setSeverity('ELEVATED');
        setNotes('');
      } else {
        alert('Failed to log incident: ' + json.error);
      }
    } catch (err) {
      console.error('Error logging incident', err);
    } finally {
      setSubmittingLog(false);
    }
  };

  const handleDirectiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirTitle) {
      alert('Please enter a directive title.');
      return;
    }
    setSubmittingDir(true);
    try {
      const res = await fetch('/api/directives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: dirTitle, status: dirStatus, enforcement: dirEnforcement })
      });
      const json = await res.json();
      if (json.success) {
        setData((prev: any) => ({
          ...prev,
          systemicDirectives: [...prev.systemicDirectives, json.data]
        }));
        // Reset form
        setDirTitle('');
        setDirStatus('Drafting');
        setDirEnforcement('');
        setShowAddDirective(false);
      } else {
        alert('Failed to add directive: ' + json.error);
      }
    } catch (err) {
      console.error('Error adding directive', err);
    } finally {
      setSubmittingDir(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-1 w-full p-xl h-full overflow-y-auto">
      <div className="max-w-[1280px] mx-auto w-full">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md border-b border-outline-variant pb-md"
        >
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-background mb-sm">Prevention Center</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                Operational intelligence for hazard mitigation. Review systemic directives and log active incidents for immediate algorithmic processing.
            </p>
          </div>
          <div className="flex gap-sm">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="font-label-lg text-label-lg px-md py-sm border border-outline text-on-surface rounded-lg hover:bg-surface-container transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Matrix
            </motion.button>
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column: Matrices & Directives (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-lg">
            {/* Section: Action Matrix */}
            <motion.section 
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <div className="flex items-center gap-2 mb-md">
                <span className="material-symbols-outlined text-primary">grid_view</span>
                <h3 className="font-headline-md text-headline-md text-on-background text-xl">Action Matrix (Individuals)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                {/* Matrix Card 1 */}
                <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md hover:bg-surface-container-low transition-colors group cursor-pointer shadow-sm hover:shadow-md">
                  <div className="flex justify-between items-start mb-md">
                    <div className="w-10 h-10 bg-surface-container border border-outline-variant rounded flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      <span className="material-symbols-outlined">filter_alt</span>
                    </div>
                    <span className="font-label-md text-label-md bg-tertiary-fixed text-on-tertiary-fixed px-2 py-1 rounded">ACTIVE</span>
                  </div>
                  <h4 className="font-label-lg text-label-lg text-on-background mb-xs">{loading ? 'POU Filtration Optimization' : data?.actionMatrix[0]?.title || 'POU Filtration Optimization'}</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-md line-clamp-2">{loading ? 'Deploy sub-micron filtration systems at point-of-use for residential mitigation of industrial heavy metal runoff.' : data?.actionMatrix[0]?.description || 'Deploy sub-micron filtration systems at point-of-use...'}</p>
                  <div className="flex gap-2">
                    <span className="font-label-md text-label-md bg-surface border border-outline-variant text-on-surface-variant px-2 py-1 rounded">{loading ? 'Efficacy: 98.4%' : data?.actionMatrix[0]?.metrics[0] || 'Efficacy: 98.4%'}</span>
                    <span className="font-label-md text-label-md bg-surface border border-outline-variant text-on-surface-variant px-2 py-1 rounded">{loading ? 'Cost: Low' : data?.actionMatrix[0]?.metrics[1] || 'Cost: Low'}</span>
                  </div>
                </motion.div>

                {/* Matrix Card 2 */}
                <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md hover:bg-surface-container-low transition-colors group cursor-pointer shadow-sm hover:shadow-md">
                  <div className="flex justify-between items-start mb-md">
                    <div className="w-10 h-10 bg-surface-container border border-outline-variant rounded flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      <span className="material-symbols-outlined">science</span>
                    </div>
                    <span className="font-label-md text-label-md bg-secondary-fixed text-on-secondary-fixed px-2 py-1 rounded">CRITICAL</span>
                  </div>
                  <h4 className="font-label-lg text-label-lg text-on-background mb-xs">{loading ? 'Contaminant Baselining' : data?.actionMatrix[1]?.title || 'Contaminant Baselining'}</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-md line-clamp-2">{loading ? 'Mandatory bi-weekly testing protocol utilizing provided spectrophotometric assay kits for municipal tap sources.' : data?.actionMatrix[1]?.description}</p>
                  <div className="flex gap-2">
                    <span className="font-label-md text-label-md bg-surface border border-outline-variant text-on-surface-variant px-2 py-1 rounded">{loading ? 'Kit ID: TX-892' : data?.actionMatrix[1]?.metrics[0] || 'Kit ID: TX-892'}</span>
                  </div>
                </motion.div>

                {/* Matrix Card 3 */}
                <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm hover:bg-surface-container-low transition-colors group cursor-pointer md:col-span-2 shadow-sm hover:shadow-md">
                  <div className="flex justify-between items-center mb-sm">
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 bg-surface-container border border-outline-variant rounded flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">water_damage</span>
                      </div>
                      <h4 className="font-label-lg text-label-lg text-on-background">{loading ? 'Microplastic Intake Minimization' : data?.actionMatrix[2]?.title || 'Microplastic Intake Minimization'}</h4>
                    </div>
                    <span className="font-label-md text-label-md bg-surface-dim text-on-surface px-2 py-1 rounded border border-outline-variant">MONITORING</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant text-xs max-w-2xl line-clamp-1">{loading ? 'Implement reverse osmosis layering in secondary holding tanks. Awaiting regional supply chain validation before escalating to active directive status.' : data?.actionMatrix[2]?.description}</p>
                </motion.div>
              </div>
            </motion.section>

            {/* Section: Systemic Directives */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-md"
            >
              <div className="flex items-center justify-between mb-md">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">gavel</span>
                  <h3 className="font-headline-md text-headline-md text-on-background text-xl">Systemic Policy Directives</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAddDirective(!showAddDirective)}
                    className="font-label-md text-label-md bg-zinc-900 text-white hover:bg-zinc-800 transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer font-bold text-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">{showAddDirective ? 'close' : 'add'}</span>
                    {showAddDirective ? 'CANCEL' : 'ADD DIRECTIVE'}
                  </button>
                </div>
              </div>

              {/* Add Directive Inline Form */}
              {showAddDirective && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-zinc-50 border border-outline-variant p-md rounded-lg mb-md shadow-inner"
                >
                  <h4 className="font-label-lg text-label-lg font-bold text-on-background mb-sm text-sm uppercase">Create Systemic Directive</h4>
                  <form onSubmit={handleDirectiveSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-md items-end">
                    <div className="md:col-span-2 flex flex-col gap-xs">
                      <label className="text-xs uppercase font-label-md text-on-surface font-semibold">Target Policy Title</label>
                      <input 
                        type="text"
                        value={dirTitle}
                        onChange={e => setDirTitle(e.target.value)}
                        placeholder="e.g. Municipal Water Lead Filtration Cap"
                        className="bg-white border border-outline-variant text-on-surface text-sm p-sm rounded-lg focus:outline-none focus:border-primary w-full"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="text-xs uppercase font-label-md text-on-surface font-semibold">Status</label>
                      <select 
                        value={dirStatus}
                        onChange={e => setDirStatus(e.target.value)}
                        className="bg-white border border-outline-variant text-on-surface text-sm p-sm rounded-lg focus:outline-none focus:border-primary w-full"
                      >
                        <option>Drafting</option>
                        <option>Enforced</option>
                        <option>Auditing</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="text-xs uppercase font-label-md text-on-surface font-semibold">Enforcement Timeline</label>
                      <input 
                        type="text"
                        value={dirEnforcement}
                        onChange={e => setDirEnforcement(e.target.value)}
                        placeholder="e.g. Q4 2026 or TBD"
                        className="bg-white border border-outline-variant text-on-surface text-sm p-sm rounded-lg focus:outline-none focus:border-primary w-full"
                      />
                    </div>
                    <div className="md:col-span-3 flex gap-sm justify-end">
                      <button 
                        type="button"
                        onClick={() => setShowAddDirective(false)}
                        className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-label-lg text-on-surface hover:bg-zinc-150 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={submittingDir}
                        className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-label-lg hover:bg-zinc-800 transition-colors disabled:opacity-55 font-bold"
                      >
                        {submittingDir ? 'Saving...' : 'Save Directive'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-sm p-sm bg-surface border-b border-outline-variant font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  <div className="col-span-3">Directive ID</div>
                  <div className="col-span-5">Target Policy</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Enforcement</div>
                </div>
                {/* Rows */}
                {loading ? (
                  <div className="p-md text-center text-on-surface-variant font-body-md text-sm">Loading systemic directives...</div>
                ) : !data || data.systemicDirectives?.length === 0 ? (
                  <div className="p-md text-center text-on-surface-variant font-body-md text-sm">No systemic directives logged.</div>
                ) : (
                  data.systemicDirectives.map((dir: any, idx: number) => (
                    <motion.div 
                      key={dir.id || idx}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }} 
                      className="grid grid-cols-12 gap-sm p-sm items-center border-b border-outline-variant last:border-b-0 transition-colors font-body-md text-body-md text-sm cursor-pointer"
                    >
                      <div className="col-span-3 font-label-lg text-on-background font-bold">{dir.id}</div>
                      <div className="col-span-5 text-on-surface line-clamp-1" title={dir.title}>{dir.title}</div>
                      <div className="col-span-2 flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${dir.statusDot}`}></span>{dir.status}
                      </div>
                      <div className="col-span-2 text-right font-label-md text-on-surface-variant">{dir.enforcement}</div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.section>

            {/* Section: Logged Incident Telemetry */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-lg"
            >
              <div className="flex items-center gap-2 mb-md">
                <span className="material-symbols-outlined text-secondary">assignment_late</span>
                <h3 className="font-headline-md text-headline-md text-on-background text-xl">Logged Incident Telemetry</h3>
              </div>
              <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-sm p-sm bg-surface border-b border-outline-variant font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  <div className="col-span-3">Log ID</div>
                  <div className="col-span-3">Vector</div>
                  <div className="col-span-2">Severity</div>
                  <div className="col-span-2">Coordinates</div>
                  <div className="col-span-2 text-right">Timestamp</div>
                </div>
                {/* Rows */}
                {loading ? (
                  <div className="p-md text-center text-on-surface-variant font-body-md text-sm">Loading incident telemetry...</div>
                ) : logs.length === 0 ? (
                  <div className="p-md text-center text-on-surface-variant font-body-md text-sm">No incidents initiated. Submit the form on the right to start logging.</div>
                ) : (
                  [...logs].reverse().map((log: any, idx: number) => (
                    <div 
                      key={log.id || idx}
                      className="grid grid-cols-12 gap-sm p-sm items-center border-b border-outline-variant/30 last:border-b-0 font-body-md text-body-md text-sm"
                    >
                      <div className="col-span-3 font-label-lg text-on-background font-bold text-xs truncate" title={log.id}>{log.id}</div>
                      <div className="col-span-3 text-on-surface truncate font-semibold" title={log.vector}>{log.vector}</div>
                      <div className="col-span-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' :
                          log.severity === 'ELEVATED' ? 'bg-yellow-100 text-yellow-800 border border-yellow-250' :
                          'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {log.severity}
                        </span>
                      </div>
                      <div className="col-span-2 text-on-surface-variant text-xs truncate" title={log.coordinates}>{log.coordinates}</div>
                      <div className="col-span-2 text-right font-label-md text-on-surface-variant text-xs">{new Date(log.timestamp).toLocaleTimeString()}</div>
                      {log.notes && (
                        <div className="col-span-12 mt-1 bg-zinc-50 p-2 rounded text-xs text-zinc-650 border border-zinc-150">
                          <strong>Field Notes:</strong> {log.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.section>
          </div>

          {/* Right Column: Form (4 Cols) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-4"
          >
            <div className="bg-surface border border-outline-variant rounded-lg p-lg sticky top-24 shadow-md">
              <div className="flex items-center gap-2 mb-md border-b border-outline-variant pb-sm">
                <span className="material-symbols-outlined text-secondary">report</span>
                <h3 className="font-headline-md text-headline-md text-xl text-on-background">Log Incident</h3>
              </div>
              <p className="font-body-md text-body-md text-sm text-on-surface-variant mb-md">
                Submit raw field data for immediate heuristic analysis. High-severity reports bypass standard queue.
              </p>
              
              <form onSubmit={handleLogSubmit} className="flex flex-col gap-md">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-xs uppercase tracking-wider">Classification Vector</label>
                  <div className="relative">
                    <select 
                      value={vector}
                      onChange={e => setVector(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md p-sm rounded-lg appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      required
                    >
                      <option value="">Select Vector...</option>
                      <option value="Biological Contamination">Biological Contamination (Pathogens, Coliforms)</option>
                      <option value="Chemical/Industrial Spill">Chemical/Industrial Spill (Heavy Metals, Solvents)</option>
                      <option value="Infrastructure Failure">Infrastructure Failure (Pipe Burst, Treatment Bypass)</option>
                      <option value="Anomalous Reading (Sensor)">Anomalous Reading (Sensor Drift, Out-of-bounds pH)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                  </div>
                </div>
                
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-xs uppercase tracking-wider">Geospatial Coordinates</label>
                  <input 
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md p-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline-variant" 
                    placeholder="e.g. 40.7128° N, 74.0060° W or Address" 
                    type="text" 
                    value={coordinates}
                    onChange={e => setCoordinates(e.target.value)}
                    required
                  />
                  {detectedLake && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-xs text-xs bg-zinc-50 border border-zinc-150 p-sm rounded-lg flex items-center gap-1.5 font-semibold text-zinc-700"
                    >
                      <span className="material-symbols-outlined text-[15px] text-teal-600">water</span>
                      <span>Auto-detected Water Body: <strong className="text-zinc-950 font-bold">{detectedLake.name}</strong></span>
                    </motion.div>
                  )}
                </div>
                
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-xs uppercase tracking-wider">Severity Matrix</label>
                  <div className="flex gap-2 flex-wrap">
                    <label className="cursor-pointer">
                      <input 
                        className="peer sr-only" 
                        name="severity" 
                        type="radio" 
                        value="LOW"
                        checked={severity === 'LOW'}
                        onChange={() => setSeverity('LOW')}
                      />
                      <span className="font-label-md text-label-md px-3 py-1.5 border border-outline-variant rounded bg-surface-container-lowest text-on-surface peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition-colors block">LOW</span>
                    </label>
                    <label className="cursor-pointer">
                      <input 
                        className="peer sr-only" 
                        name="severity" 
                        type="radio" 
                        value="ELEVATED"
                        checked={severity === 'ELEVATED'}
                        onChange={() => setSeverity('ELEVATED')}
                      />
                      <span className="font-label-md text-label-md px-3 py-1.5 border border-outline-variant rounded bg-surface-container-lowest text-on-surface peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition-colors block">ELEVATED</span>
                    </label>
                    <label className="cursor-pointer">
                      <input 
                        className="peer sr-only" 
                        name="severity" 
                        type="radio" 
                        value="CRITICAL"
                        checked={severity === 'CRITICAL'}
                        onChange={() => setSeverity('CRITICAL')}
                      />
                      <span className="font-label-md text-label-md px-3 py-1.5 border border-error text-error rounded bg-surface-container-lowest peer-checked:bg-error peer-checked:text-on-error transition-colors block">CRITICAL</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-xs uppercase tracking-wider">Field Notes / Telemetry</label>
                  <textarea 
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md p-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none placeholder:text-outline-variant" 
                    placeholder="Enter raw descriptive data..." 
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    required
                  ></textarea>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-primary text-on-primary font-label-lg text-label-lg py-sm rounded-lg hover:bg-on-surface-variant transition-colors flex items-center justify-center gap-2 mt-xs shadow-md disabled:opacity-55" 
                  type="submit"
                  disabled={submittingLog}
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  {submittingLog ? 'INITIATING...' : 'INITIATE LOG'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
