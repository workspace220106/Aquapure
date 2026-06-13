'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Hotspot {
  id: string;
  name: string;
  chemical: string;
  load: string;
  detail: string;
  level: 'CRITICAL' | 'WARNING' | 'ELEVATED';
}

interface IndustrialSite {
  name: string;
  location: string;
  coordinates: string;
  activeDischargeZones: number;
  globalToxicityIndex: number;
  loadPercentage: number;
  heavyMetalsLevel: number;
  petrochemicalsLevel: number;
  description: string;
  mapX: number; // 0-1000 coordinate space
  mapY: number; // 0-500 coordinate space
  hotspots: Hotspot[];
}

const INDUSTRIAL_SITES: IndustrialSite[] = [
  {
    name: 'Buffalo River Complex',
    location: 'Buffalo, New York, USA',
    coordinates: '42.8584° N, 78.8471° W',
    activeDischargeZones: 3,
    globalToxicityIndex: 85.6,
    loadPercentage: 42,
    heavyMetalsLevel: 85,
    petrochemicalsLevel: 60,
    description: 'Direct discharge from heavy metal manufacturing and steel processing facilities along the Buffalo River. Primary contributors include lead, mercury, synthetic solvents, and thermal discharge.',
    mapX: 281,
    mapY: 131,
    hotspots: [
      {
        id: 'A',
        name: 'Refinery Outflow Alpha',
        chemical: 'Heavy Metals (Pb, Cd, Hg)',
        load: '85% (Critical)',
        level: 'CRITICAL',
        detail: 'Primary discharge point of manufacturing refinery. Heavy metal effluent (Lead & Cadmium) exceeding EPA limits.'
      },
      {
        id: 'B',
        name: 'Chemical Runoff Beta',
        chemical: 'Synthetic Solvents & Organics',
        load: '60% (Warning)',
        level: 'WARNING',
        detail: 'Storage tank runoff containing synthetic industrial solvents.'
      },
      {
        id: 'C',
        name: 'Cooling Outlet Gamma',
        chemical: 'Thermal Effluent',
        load: '45% (Elevated)',
        level: 'ELEVATED',
        detail: 'Cooling tower heated water outlet, raising local water temperatures and accelerating eutrophication.'
      }
    ]
  },
  {
    name: 'Sacramento Manufacturing Delta',
    location: 'Sacramento, California, USA',
    coordinates: '38.0607° N, 121.9022° W',
    activeDischargeZones: 4,
    globalToxicityIndex: 79.4,
    loadPercentage: 38,
    heavyMetalsLevel: 70,
    petrochemicalsLevel: 55,
    description: 'Industrial runoff processing and chemical production outlets situated near agricultural channels. Main pollutants include agricultural packaging residues, hydrocarbon solvents, and urban run-offs.',
    mapX: 161,
    mapY: 144,
    hotspots: [
      {
        id: 'A',
        name: 'Pesticide Terminal',
        chemical: 'Pesticide Residues (Atrazine)',
        load: '90% (Critical)',
        level: 'CRITICAL',
        detail: 'Bulk transport packaging discharge channel with persistent chemical residues.'
      },
      {
        id: 'B',
        name: 'Refinery Separator',
        chemical: 'Hydrocarbons (Diesel/Oil)',
        load: '55% (Warning)',
        level: 'WARNING',
        detail: 'Wastewater separator outflow with detectable petroleum hydrocarbons.'
      },
      {
        id: 'C',
        name: 'Acid Wash Tank Bypass',
        chemical: 'Bypass Runoff (Low pH)',
        load: '40% (Elevated)',
        level: 'ELEVATED',
        detail: 'Occasional low pH discharge from metal cleaning processes.'
      },
      {
        id: 'D',
        name: 'Pellet Transport Edge',
        chemical: 'Microplastic Pellets',
        load: '65% (Warning)',
        level: 'WARNING',
        detail: 'Stormwater runoff containing pre-production plastic pellets.'
      }
    ]
  },
  {
    name: 'Houston Ship Channel Sector 4',
    location: 'Houston, Texas, USA',
    coordinates: '29.7337° N, 95.1481° W',
    activeDischargeZones: 5,
    globalToxicityIndex: 91.2,
    loadPercentage: 54,
    heavyMetalsLevel: 92,
    petrochemicalsLevel: 80,
    description: 'Major petrochemical refining center. High density of active processing towers and industrial chemical docks discharging directly into the channel.',
    mapX: 236,
    mapY: 167,
    hotspots: [
      {
        id: 'A',
        name: 'Petrochemical Canal',
        chemical: 'Aromatic Hydrocarbons (Benzene)',
        load: '92% (Critical)',
        level: 'CRITICAL',
        detail: 'Bulk refining discharge canal. Trace levels of benzene and toluene exceeding national safety levels.'
      },
      {
        id: 'B',
        name: 'Catalyst Wash Line',
        chemical: 'Hexavalent Chromium (Cr VI)',
        load: '70% (Warning)',
        level: 'WARNING',
        detail: 'Spent catalyst wash water containing volatile chromium derivatives.'
      },
      {
        id: 'C',
        name: 'Solvent Storage Spillway',
        chemical: 'Aromatic Solvents',
        load: '60% (Warning)',
        level: 'WARNING',
        detail: 'Valving leakage at chemical loading docks during high-pressure transfers.'
      },
      {
        id: 'D',
        name: 'Process Thermal Basin',
        chemical: 'Thermal Inflow',
        load: '35% (Elevated)',
        level: 'ELEVATED',
        detail: 'Secondary heat exchanger cooling water discharge.'
      },
      {
        id: 'E',
        name: 'Condensate Drain Line',
        chemical: 'Phenolic Compounds',
        load: '50% (Elevated)',
        level: 'ELEVATED',
        detail: 'Plastics synthesis plant condensate line discharge containing trace BPA.'
      }
    ]
  },
  {
    name: 'Yamuna River Basin',
    location: 'Delhi, India',
    coordinates: '28.6139° N, 77.2090° E',
    activeDischargeZones: 3,
    globalToxicityIndex: 88.5,
    loadPercentage: 48,
    heavyMetalsLevel: 82,
    petrochemicalsLevel: 70,
    description: 'Dense industrial and municipal discharge zone adjacent to Delhi. High concentrations of chemical effluent, untreated sewage, and heavy metals from unauthorized electroplating units.',
    mapX: 715,
    mapY: 171,
    hotspots: [
      {
        id: 'A',
        name: 'Wazirabad Canal Inflow',
        chemical: 'Heavy Metals (Pb, Cr, Ni)',
        load: '82% (Critical)',
        level: 'CRITICAL',
        detail: 'Primary electroplating waste inflow point. Chromic acid and nickel effluents consistently exceed safety guidelines.'
      },
      {
        id: 'B',
        name: 'Okhla Discharge Outlet',
        chemical: 'Surfactants & Ammonia',
        load: '70% (Warning)',
        level: 'WARNING',
        detail: 'Industrial detergents and untreated sewage discharge causing visible foam barriers on the river surface.'
      },
      {
        id: 'C',
        name: 'Najafgarh Drain Confluence',
        chemical: 'Synthetic Solvents',
        load: '50% (Elevated)',
        level: 'ELEVATED',
        detail: 'Large municipal-industrial canal carrying mixed organic solvents and suspended sediments.'
      }
    ]
  },
  {
    name: 'Rhine River Chemical Hub',
    location: 'Wiesbaden, Germany',
    coordinates: '50.0782° N, 8.2430° E',
    activeDischargeZones: 3,
    globalToxicityIndex: 71.3,
    loadPercentage: 32,
    heavyMetalsLevel: 60,
    petrochemicalsLevel: 50,
    description: 'Highly regulated European chemical manufacturing hub. Active monitoring focuses on organic synthesis runoffs, pharmaceutical trace indicators, and cooling plant thermal discharges.',
    mapX: 523,
    mapY: 111,
    hotspots: [
      {
        id: 'A',
        name: 'Organic Synthesis Drain',
        chemical: 'Chlorinated Hydrocarbons',
        load: '60% (Warning)',
        level: 'WARNING',
        detail: 'Trace organic synthesis byproducts. Regulated via continuous online chromatography sensors.'
      },
      {
        id: 'B',
        name: 'Pharmaceutical Processing',
        chemical: 'Trace Endocrine Disruptors',
        load: '50% (Elevated)',
        level: 'ELEVATED',
        detail: 'Treated wastewater outlet containing micro-concentrations of active pharmaceutical ingredients.'
      },
      {
        id: 'C',
        name: 'Thermal Exchange Outlet',
        chemical: 'Cooling Thermal Discharges',
        load: '35% (Elevated)',
        level: 'ELEVATED',
        detail: 'Thermal loop returning heated clean water. Subject to strict river temperature rise limits.'
      }
    ]
  }
];

export default function PollutionSourcesPage() {
  const [activeSite, setActiveSite] = useState<IndustrialSite | null>(null);
  const [hoveredSiteNode, setHoveredSiteNode] = useState<IndustrialSite | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize random site on refresh
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * INDUSTRIAL_SITES.length);
    setActiveSite(INDUSTRIAL_SITES[randomIndex]);
    setLoading(false);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
  };

  return (
    <div className="flex-1 overflow-y-auto p-margin md:p-xl flex flex-col gap-lg relative z-10 scroll-smooth h-full bg-zinc-50/50">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-70 z-[-1] pointer-events-none"></div>
      
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-xs mb-md"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 w-fit text-xs font-bold tracking-wider uppercase mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          System Online
        </div>
        <h1 className="font-headline-lg text-[48px] leading-tight text-zinc-900 bg-clip-text text-transparent bg-gradient-to-r from-zinc-950 to-zinc-600">Source Tracking Diagnostics</h1>
        <p className="font-body-lg text-body-lg text-zinc-600 max-w-3xl">Real-time telemetry and structural analysis of primary water contaminant vectors across industrial, agricultural, and domestic sectors.</p>
      </motion.div>

      {/* Grid Layout */}
      {!loading && activeSite && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-min"
        >
          {/* Overview Card (Col 1-4) */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col h-full group hover:border-zinc-300 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2 text-zinc-900">
                <div className="p-2 bg-zinc-100 rounded-lg group-hover:bg-zinc-200 transition-colors">
                  <span className="material-symbols-outlined text-zinc-900" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
                </div>
                <span className="font-label-lg text-label-lg uppercase tracking-widest font-bold">Global Toxicity Index</span>
              </div>
              <span className="px-3 py-1 bg-red-50 text-red-700 font-label-md text-xs font-bold rounded-full border border-red-200 shadow-sm animate-pulse">ELEVATED</span>
            </div>
            
            <div className="flex flex-col flex-1">
              <div className="font-headline-lg text-[56px] font-black leading-none tracking-tighter text-zinc-900 mb-2 group-hover:scale-105 transition-transform origin-left duration-500">
                {activeSite.globalToxicityIndex.toFixed(1)}
                <span className="text-headline-md text-zinc-400">%</span>
              </div>
              <div className="h-[1px] w-full bg-gradient-to-r from-zinc-200 via-zinc-200 to-transparent my-4"></div>
              <p className="font-body-md text-sm text-zinc-650 mb-6 leading-relaxed">
                Overall concentration of verified pollutants across monitored watersheds. Active site tracked: <strong className="text-zinc-950 font-bold">{activeSite.name}</strong>.
              </p>
              <div className="mt-auto">
                <button 
                  onClick={() => {
                    const currentIndex = INDUSTRIAL_SITES.findIndex(s => s.name === activeSite.name);
                    const nextIndex = (currentIndex + 1) % INDUSTRIAL_SITES.length;
                    setActiveSite(INDUSTRIAL_SITES[nextIndex]);
                  }}
                  className="relative overflow-hidden bg-zinc-900 text-white font-label-md text-sm font-bold px-4 py-3.5 rounded-xl uppercase tracking-widest hover:bg-zinc-800 transition-all w-full shadow-md hover:shadow-lg group/btn cursor-pointer"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">public</span>
                    Cycle active sites
                  </span>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Industrial Vector (Col 5-12) */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col group hover:border-zinc-300 transition-all duration-500 hover:shadow-xl"
          >
            <div className="flex justify-between items-start border-b border-zinc-100 pb-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-[28px] font-bold text-zinc-900 leading-tight">Global Effluent Map</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <p className="font-label-md text-xs text-zinc-500 uppercase tracking-widest font-bold">Vector: {activeSite.name} ({activeSite.coordinates})</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-headline-lg text-[40px] font-black text-red-600 leading-none drop-shadow-[0_2px_10px_rgba(220,38,38,0.1)]">{activeSite.loadPercentage}%</div>
                <div className="font-label-md text-xs text-zinc-400 uppercase tracking-widest font-bold mt-1">Of Total Load</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              <div className="flex flex-col justify-center">
                <p className="font-body-md text-sm text-zinc-650 mb-6 leading-relaxed">
                  {activeSite.description}
                </p>
                <div className="flex flex-col gap-4 mb-4">
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150 shadow-inner">
                    <div className="font-label-lg text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">Discharge Hotspots Details</div>
                    <div className="flex flex-col gap-2">
                      {activeSite.hotspots.map((h) => (
                        <div key={h.id} className="text-xs flex justify-between items-start gap-4">
                          <span className="font-semibold text-zinc-700 flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${h.level === 'CRITICAL' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                            {h.name} ({h.chemical})
                          </span>
                          <span className="text-zinc-500 shrink-0 font-mono font-bold">{h.load}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Heavy Metals</span>
                      <span className="text-lg font-black text-red-600 mt-1">{activeSite.heavyMetalsLevel}%</span>
                    </div>
                    <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Petrochemicals</span>
                      <span className="text-lg font-black text-yellow-600 mt-1">{activeSite.petrochemicalsLevel}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* High-Fidelity SVG World Map Container */}
              <div className="relative border border-zinc-800 rounded-xl overflow-hidden bg-black flex items-center justify-center p-3 group/map select-none min-h-[280px]">
                {/* SVG map */}
                <svg viewBox="0 0 1000 500" className="w-full h-auto drop-shadow-sm">
                  {/* Grid Lines */}
                  <g stroke="#18181b" strokeWidth="0.5" strokeDasharray="3,3">
                    <line x1="100" y1="0" x2="100" y2="500" />
                    <line x1="200" y1="0" x2="200" y2="500" />
                    <line x1="300" y1="0" x2="300" y2="500" />
                    <line x1="400" y1="0" x2="400" y2="500" />
                    <line x1="500" y1="0" x2="500" y2="500" />
                    <line x1="600" y1="0" x2="600" y2="500" />
                    <line x1="700" y1="0" x2="700" y2="500" />
                    <line x1="800" y1="0" x2="800" y2="500" />
                    <line x1="900" y1="0" x2="900" y2="500" />
                    
                    <line x1="0" y1="100" x2="1000" y2="100" />
                    <line x1="0" y1="200" x2="1000" y2="200" />
                    <line x1="0" y1="300" x2="1000" y2="300" />
                    <line x1="0" y1="400" x2="1000" y2="400" />
                  </g>

                  {/* Continent Shapes */}
                  <g fill="#18181b" stroke="#27272a" strokeWidth="1" strokeLinejoin="round">
                    {/* North America */}
                    <path d="M 80,100 L 120,80 L 160,50 L 220,40 L 300,40 L 320,60 L 300,100 L 280,120 L 290,140 L 280,165 L 300,175 L 310,160 L 325,185 L 290,200 L 260,185 L 255,210 L 260,250 L 250,280 L 240,285 L 225,270 L 235,240 L 205,225 L 210,180 L 195,170 L 180,175 L 185,150 L 165,155 L 155,175 L 140,175 L 145,150 L 120,160 L 100,150 L 95,125 Z" />
                    {/* South America */}
                    <path d="M 250,280 L 260,285 L 270,300 L 290,310 L 305,320 L 320,335 L 305,365 L 290,390 L 285,415 L 280,445 L 265,475 L 255,480 L 255,470 L 260,440 L 250,420 L 245,395 L 235,360 L 230,330 L 232,310 L 242,295 Z" />
                    {/* Eurasia */}
                    <path d="M 450,80 L 470,75 L 490,60 L 520,55 L 560,50 L 600,45 L 650,40 L 720,45 L 800,50 L 850,55 L 900,60 L 920,80 L 900,120 L 880,135 L 885,155 L 855,185 L 820,195 L 800,210 L 785,250 L 775,275 L 755,275 L 760,250 L 740,245 L 725,260 L 710,245 L 690,255 L 670,225 L 635,220 L 630,240 L 610,230 L 600,250 L 590,240 L 565,245 L 575,225 L 550,220 L 530,225 L 515,245 L 505,245 L 490,220 L 465,220 L 460,205 L 475,190 L 445,185 L 440,165 L 450,150 L 440,140 L 450,125 L 435,115 L 435,95 Z" />
                    {/* Africa */}
                    <path d="M 450,220 L 470,220 L 490,220 L 505,245 L 515,245 L 530,225 L 550,220 L 575,225 L 595,255 L 605,275 L 605,305 L 585,340 L 570,365 L 555,395 L 545,410 L 540,410 L 545,390 L 535,370 L 525,355 L 525,320 L 515,310 L 505,300 L 485,300 L 475,295 L 450,280 L 435,265 L 435,235 Z" />
                    {/* Australia */}
                    <path d="M 770,330 L 800,320 L 825,325 L 840,335 L 850,355 L 845,380 L 830,390 L 810,395 L 785,390 L 765,370 L 760,350 Z" />
                    {/* Greenland */}
                    <path d="M 340,35 L 380,35 L 395,50 L 375,75 L 345,70 L 335,55 Z" />
                    {/* Madagascar */}
                    <path d="M 605,355 L 615,350 L 610,380 L 595,385 L 595,365 Z" />
                  </g>

                  {/* World Map Interactive Node Overlays */}
                  {INDUSTRIAL_SITES.map((site) => {
                    const isActive = activeSite.name === site.name;
                    return (
                      <g 
                        key={site.name}
                        className="cursor-pointer"
                        onClick={() => setActiveSite(site)}
                        onMouseEnter={() => setHoveredSiteNode(site)}
                        onMouseLeave={() => setHoveredSiteNode(null)}
                      >
                        {/* Pulse Ring */}
                        <circle 
                          cx={site.mapX} 
                          cy={site.mapY} 
                          r={isActive ? "20" : "10"}
                          fill="transparent"
                          stroke={isActive ? "#ef4444" : "#3b82f6"}
                          strokeWidth="1.5"
                          className={isActive ? "animate-pulse" : "hover:animate-ping"}
                          opacity={isActive ? "0.6" : "0.4"}
                        />
                        {/* Node Core */}
                        <circle 
                          cx={site.mapX} 
                          cy={site.mapY} 
                          r={isActive ? "7" : "5"}
                          fill={isActive ? "#dc2626" : "#2563eb"}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="transition-all duration-300"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Map Hover Tooltip Overlay */}
                <AnimatePresence>
                  {hoveredSiteNode && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-16 left-4 right-4 bg-zinc-950/95 border border-zinc-800 backdrop-blur-md p-4 rounded-xl text-white shadow-2xl z-20 flex flex-col gap-1.5"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                        <span className="font-label-lg text-sm font-bold tracking-wide flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${activeSite.name === hoveredSiteNode.name ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></span>
                          {hoveredSiteNode.name}
                        </span>
                        <span className="text-zinc-400 font-label-md text-[10px] tracking-widest font-bold uppercase">
                          {hoveredSiteNode.location}
                        </span>
                      </div>
                      <p className="font-body-md text-xs text-zinc-400 leading-relaxed mt-1">
                        Coordinates: <strong className="text-white font-mono">{hoveredSiteNode.coordinates}</strong> | Active Discharge Zones: <strong className="text-white font-bold">{hoveredSiteNode.activeDischargeZones}</strong>
                      </p>
                      <div className="flex justify-between items-center text-[10px] font-label-md uppercase tracking-wider text-zinc-500 mt-1">
                        <span>Click node to select and view detailed parameters</span>
                        {activeSite.name === hoveredSiteNode.name && (
                          <span className="text-red-400 font-bold">ACTIVE MONITOR</span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom Bar Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3.5 backdrop-blur-sm bg-zinc-950/90 border-t border-zinc-800 z-10 flex justify-between items-center text-white">
                  <span className="font-label-md text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                    </span>
                    {activeSite.activeDischargeZones} Active Hotspots In Vector
                  </span>
                  <span className="text-zinc-500 font-label-md text-[10px] tracking-wide uppercase font-bold hidden sm:inline">
                    Click nodes to select monitoring zones
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Agricultural Vector (Col 1-7) */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-6 group hover:border-zinc-300 transition-all duration-500 hover:shadow-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl flex items-center justify-center group-hover:bg-zinc-100 transition-colors">
                <span className="material-symbols-outlined text-[24px]">agriculture</span>
              </div>
              <div>
                <h2 className="font-headline-md text-[28px] font-bold text-zinc-900 leading-tight">Agricultural Runoff</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <p className="font-label-md text-xs text-zinc-500 uppercase tracking-widest font-bold">Vector Class: Beta-2</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <p className="font-body-md text-sm text-zinc-600 leading-relaxed">Non-point source pollution resulting from rainfall or snowmelt moving over and through the ground, carrying natural and human-made pollutants into lakes, rivers, and coastal waters.</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { title: 'Nitrates', val: '12.4', unit: 'mg/L' },
                  { title: 'Phosphates', val: '3.8', unit: 'mg/L' },
                  { title: 'Pesticides', val: '0.9', unit: 'µg/L' }
                ].map((m, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.05 }} className="border border-zinc-200 p-4 rounded-xl text-center bg-zinc-50 hover:bg-white shadow-sm hover:shadow transition-all">
                    <div className="font-label-md text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{m.title}</div>
                    <div className="font-headline-md text-[24px] font-black text-zinc-900">{m.val} <span className="text-sm font-medium text-zinc-400">{m.unit}</span></div>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-xl border border-zinc-200 mt-2">
                <span className="font-label-md text-xs font-bold text-zinc-700 uppercase tracking-widest">Eutrophication Risk</span>
                <div className="flex gap-1.5">
                  <div className="w-10 h-2.5 bg-gradient-to-r from-red-600 to-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.2)]"></div>
                  <div className="w-10 h-2.5 bg-red-500 rounded-full"></div>
                  <div className="w-10 h-2.5 bg-red-400 rounded-full"></div>
                  <div className="w-10 h-2.5 bg-zinc-200 rounded-full"></div>
                  <div className="w-10 h-2.5 bg-zinc-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Domestic Vector (Col 8-12) */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-6 group hover:border-zinc-300 transition-all duration-500 hover:shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl flex items-center justify-center group-hover:bg-zinc-100 transition-colors">
                  <span className="material-symbols-outlined text-[24px]">home_work</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-[28px] font-bold text-zinc-900 leading-tight">Domestic Waste</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <p className="font-label-md text-xs text-zinc-500 uppercase tracking-widest font-bold">Vector Class: Gamma-3</p>
                  </div>
                </div>
              </div>
              <p className="font-body-md text-sm text-zinc-600 mb-6 leading-relaxed">Urban runoff, untreated sewage, and household chemical disposal. Rapidly emerging microplastic indicators detected in metropolitan adjacent zones.</p>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Microplastics', icon: 'scatter_plot' },
                { title: 'Pharmaceuticals', icon: 'medication' },
                { title: 'Pathogens (E. coli)', icon: 'water_damage' }
              ].map((item, i) => (
                <Link href="/contaminants" key={i} className="block">
                  <motion.div whileHover={{ x: 5, scale: 1.01 }} className="p-4 border border-zinc-200 rounded-xl flex items-center justify-between bg-zinc-50 hover:bg-white hover:shadow-md transition-all cursor-pointer group/item">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center group-hover/item:bg-zinc-900 group-hover/item:text-white transition-colors">
                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      </div>
                      <span className="font-label-lg text-sm font-bold text-zinc-900">{item.title}</span>
                    </div>
                    <span className="material-symbols-outlined text-zinc-400 group-hover/item:translate-x-1 group-hover/item:text-zinc-900 transition-all">arrow_forward</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
