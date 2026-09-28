// -----------------------------------------------------------------------------
// 8. DOMESTIC FLIGHT PRICE EXPLORER (MoSPI / DGCA SURVEILLANCE MATRIX)
// -----------------------------------------------------------------------------
function FlightPriceExplorerView({ indexData, routesData, airlinesData, setActiveTab, setMlRoute, setMlCarrier }) {
  useEffect(() => {
    if (window.lucide) lucide.createIcons();
  }, []);

  const [selectedCorridor, setSelectedCorridor] = useState('DEL-BOM');
  const [originFilter, setOriginFilter] = useState('ALL');
  const [destFilter, setDestFilter] = useState('ALL');
  const [carrierFilter, setCarrierFilter] = useState('ALL');
  const [advanceFilter, setAdvanceFilter] = useState('ALL');
  const [cabinClass, setCabinClass] = useState('ECONOMY');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('dgca_desc');

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const routes = routesData?.routes || [
    {
      route_code: 'DEL-BOM', origin_code: 'DEL', dest_code: 'BOM', origin_city: 'Delhi', dest_city: 'Mumbai',
      category: 'MEGA_METRO', daily_flights: 72, distance_km: 1148, dgca_weight_pct: 11.2,
      avg_fare_current: 5919, avg_fare_prev_week: 5741, min_fare: 3847, max_fare: 10950, pct_change_7d: 3.1
    },
    {
      route_code: 'BOM-BLR', origin_code: 'BOM', dest_code: 'BLR', origin_city: 'Mumbai', dest_city: 'Bengaluru',
      category: 'MEGA_METRO', daily_flights: 54, distance_km: 842, dgca_weight_pct: 8.4,
      avg_fare_current: 4780, avg_fare_prev_week: 4650, min_fare: 3120, max_fare: 8900, pct_change_7d: 2.8
    },
    {
      route_code: 'DEL-BLR', origin_code: 'DEL', dest_code: 'BLR', origin_city: 'Delhi', dest_city: 'Bengaluru',
      category: 'MEGA_METRO', daily_flights: 58, distance_km: 1740, dgca_weight_pct: 9.1,
      avg_fare_current: 6850, avg_fare_prev_week: 6590, min_fare: 4450, max_fare: 13200, pct_change_7d: 3.9
    }
  ];

  // Distinct origin & destination lists
  const origins = useMemo(() => {
    return Array.from(new Set(routes.map(r => r.origin_city))).sort();
  }, [routes]);

  const destinations = useMemo(() => {
    const filteredByOrigin = originFilter === 'ALL' ? routes : routes.filter(r => r.origin_city === originFilter);
    return Array.from(new Set(filteredByOrigin.map(r => r.dest_city))).sort();
  }, [routes, originFilter]);

  // Active Route
  const currentRoute = useMemo(() => {
    const found = routes.find(r => r.route_code === selectedCorridor);
    return found || routes[0] || {
      route_code: 'DEL-BOM', origin_code: 'DEL', dest_code: 'BOM', origin_city: 'Delhi', dest_city: 'Mumbai',
      category: 'MEGA_METRO', daily_flights: 72, distance_km: 1148, dgca_weight_pct: 11.2,
      avg_fare_current: 5919, avg_fare_prev_week: 5741, min_fare: 3847, max_fare: 10950, pct_change_7d: 3.1
    };
  }, [routes, selectedCorridor]);

  // Cabin Multipliers
  const cabinMultiplier = useMemo(() => {
    if (cabinClass === 'PREMIUM_ECONOMY') return 1.62;
    if (cabinClass === 'BUSINESS') return 2.75;
    return 1.0;
  }, [cabinClass]);

  const adjustedAvg = Math.round(currentRoute.avg_fare_current * cabinMultiplier);
  const adjustedMin = Math.round(currentRoute.min_fare * cabinMultiplier);
  const adjustedMax = Math.round(currentRoute.max_fare * cabinMultiplier);
  const fareSpread = adjustedMax - adjustedMin;
  const spreadMultiplier = (adjustedMax / Math.max(1, adjustedMin)).toFixed(1);
  const farePerKm = (adjustedAvg / Math.max(1, currentRoute.distance_km)).toFixed(2);

  // Filtered Corridors Table List
  const filteredRoutes = useMemo(() => {
    return routes.filter(r => {
      if (originFilter !== 'ALL' && r.origin_city !== originFilter) return false;
      if (destFilter !== 'ALL' && r.dest_city !== destFilter) return false;
      if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = r.route_code.toLowerCase().includes(q);
        const matchOrigin = r.origin_city.toLowerCase().includes(q);
        const matchDest = r.dest_city.toLowerCase().includes(q);
        if (!matchCode && !matchOrigin && !matchDest) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'dgca_desc') return b.dgca_weight_pct - a.dgca_weight_pct;
      if (sortBy === 'fare_asc') return a.avg_fare_current - b.avg_fare_current;
      if (sortBy === 'fare_desc') return b.avg_fare_current - a.avg_fare_current;
      if (sortBy === 'change_desc') return b.pct_change_7d - a.pct_change_7d;
      if (sortBy === 'distance_asc') return a.distance_km - b.distance_km;
      return 0;
    });
  }, [routes, originFilter, destFilter, categoryFilter, searchQuery, sortBy]);

  // Quick corridor pills
  const popularCorridors = [
    { code: 'DEL-BOM', label: 'DEL ⇄ BOM' },
    { code: 'BOM-BLR', label: 'BOM ⇄ BLR' },
    { code: 'DEL-BLR', label: 'DEL ⇄ BLR' },
    { code: 'DEL-CCU', label: 'DEL ⇄ CCU' },
    { code: 'BOM-CCU', label: 'BOM ⇄ CCU' },
    { code: 'DEL-HYD', label: 'DEL ⇄ HYD' },
    { code: 'BLR-HYD', label: 'BLR ⇄ HYD' },
    { code: 'DEL-MAA', label: 'DEL ⇄ MAA' },
    { code: 'DEL-GOX', label: 'DEL ⇄ GOA' },
    { code: 'DEL-SXR', label: 'DEL ⇄ SXR' }
  ];

  // Advance Purchase Escalation Curve Chart
  useEffect(() => {
    if (!chartRef.current || !window.Chart) return;

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.7)';

    const horizons = [
      '30+ Days (Advance Floor)',
      '21–29 Days (Early Bird)',
      '14–20 Days (Standard)',
      '7–13 Days (Escalation)',
      '4–6 Days (Urgent)',
      '2–3 Days (Surge Peak)',
      '0–1 Day (Departure Spot)'
    ];

    // Compute curve data points
    const avgCurve = [
      Math.round(adjustedMin * 0.98),
      Math.round(adjustedMin * 1.07),
      Math.round(adjustedAvg * 0.92),
      Math.round(adjustedAvg * 1.09),
      Math.round(adjustedAvg * 1.30),
      Math.round(adjustedAvg * 1.58),
      adjustedMax
    ];

    const floorCurve = [
      Math.round(adjustedMin * 0.95),
      Math.round(adjustedMin * 0.98),
      Math.round(adjustedMin * 1.05),
      Math.round(adjustedMin * 1.15),
      Math.round(adjustedAvg * 1.08),
      Math.round(adjustedAvg * 1.25),
      Math.round(adjustedAvg * 1.45)
    ];

    const ceilingCurve = [
      Math.round(adjustedAvg * 1.15),
      Math.round(adjustedAvg * 1.25),
      Math.round(adjustedAvg * 1.40),
      Math.round(adjustedAvg * 1.65),
      Math.round(adjustedMax * 0.88),
      Math.round(adjustedMax * 0.96),
      Math.round(adjustedMax * 1.12)
    ];

    const ctx = chartRef.current.getContext('2d');
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: horizons,
        datasets: [
          {
            label: 'Corridor Weighted Average (₹)',
            data: avgCurve,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.08)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.25,
            pointBackgroundColor: '#0284c7',
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Lowest Observed Floor (₹)',
            data: floorCurve,
            borderColor: '#16a34a',
            borderWidth: 1.8,
            borderDash: [4, 4],
            fill: false,
            tension: 0.2,
            pointBackgroundColor: '#16a34a',
            pointRadius: 3
          },
          {
            label: 'Peak Dynamic Ceiling (₹)',
            data: ceilingCurve,
            borderColor: '#dc2626',
            borderWidth: 1.8,
            borderDash: [2, 2],
            fill: false,
            tension: 0.2,
            pointBackgroundColor: '#dc2626',
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: textColor,
              font: { family: "'Inter', sans-serif", size: 11, weight: 600 },
              usePointStyle: true,
              boxWidth: 8
            }
          },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            titleColor: isDark ? '#f8fafc' : '#0f172a',
            bodyColor: isDark ? '#cbd5e1' : '#334155',
            borderColor: isDark ? '#475569' : '#cbd5e1',
            borderWidth: 1,
            cornerRadius: 4,
            padding: 9,
            callbacks: {
              label: function(context) {
                return ' ' + context.dataset.label + ': ' + formatINR(context.raw);
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { size: 10, family: "'Inter', sans-serif" }
            }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { size: 10, family: 'monospace' },
              callback: function(value) {
                return '₹' + Number(value).toLocaleString('en-IN');
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [currentRoute, cabinClass, selectedCorridor]);

  // Carriers breakdown on this corridor
  const carrierDecomposition = useMemo(() => {
    const list = [
      {
        name: 'IndiGo', code: '6E', share: 61.4, basePct: 0.58, atfPct: 0.24, udf: 650, fee: 180, otp: 87.4,
        baggage: '15 kg Check-in + 7 kg Cabin'
      },
      {
        name: 'Air India Group', code: 'AI', share: 26.8, basePct: 0.59, atfPct: 0.23, udf: 650, fee: 220, otp: 81.2,
        baggage: cabinClass === 'BUSINESS' ? '25 kg Check-in + 7 kg Cabin' : '20 kg Check-in + 7 kg Cabin'
      },
      {
        name: 'Akasa Air', code: 'QP', share: 5.2, basePct: 0.56, atfPct: 0.25, udf: 650, fee: 140, otp: 84.6,
        baggage: '15 kg Check-in + 7 kg Cabin'
      },
      {
        name: 'SpiceJet', code: 'SG', share: 4.1, basePct: 0.55, atfPct: 0.25, udf: 650, fee: 160, otp: 68.5,
        baggage: '15 kg Check-in + 7 kg Cabin'
      }
    ];

    if (carrierFilter !== 'ALL') {
      return list.filter(c => c.code === carrierFilter);
    }
    return list;
  }, [carrierFilter, cabinClass]);

  // CSV Export handler
  const exportCorridorCSV = () => {
    const headers = [
      'Route Code', 'Origin City', 'Origin Airport', 'Destination City', 'Destination Airport',
      'Category', 'Distance (km)', 'DGCA Traffic Weight (%)', 'Min Fare (INR)',
      'Current Avg Fare (INR)', 'Max Fare (INR)', '7-Day Change (%)'
    ];
    const rows = filteredRoutes.map(r => [
      r.route_code,
      '"' + r.origin_city + '"',
      r.origin_code,
      '"' + r.dest_city + '"',
      r.dest_code,
      r.category || 'MEGA_METRO',
      r.distance_km,
      r.dgca_weight_pct,
      r.min_fare,
      r.avg_fare_current,
      r.max_fare,
      r.pct_change_7d
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'MoSPI_AFPI_Corridor_Price_Matrix_' + new Date().toISOString().slice(0, 10) + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* View Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 text-[11px] font-semibold tracking-wide uppercase">
            <i data-lucide="plane" className="h-3 w-3 text-[#0284c7]"></i>
            <span>DGCA Tariff Matrix & National Statistical Office Surveillance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Domestic Flight Price Explorer
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Direct corridor surveillance of scheduled domestic passenger tariffs, advance booking escalation curves, carrier fee decompositions, and volatility spreads across 32 key air routes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCorridorCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <i data-lucide="download" className="h-3.5 w-3.5"></i>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              if (setMlRoute) setMlRoute(currentRoute.route_code);
              setActiveTab('ml_sandbox');
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#0c2340] dark:bg-sky-600 text-white hover:bg-slate-800 dark:hover:bg-sky-500 transition"
          >
            <i data-lucide="line-chart" className="h-3.5 w-3.5"></i>
            <span>Inspect in ML Sandbox</span>
          </button>
        </div>
      </div>

      {/* Quick Corridor Selection Bar */}
      <div className="bg-white dark:bg-slate-800 p-3.5 rounded border border-slate-200 dark:border-slate-700 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
          <span className="flex items-center space-x-1.5">
            <i data-lucide="trending-up" className="h-3.5 w-3.5 text-[#0284c7]"></i>
            <span>Primary Commercial Trunk Corridors (High DGCA Traffic Density):</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Click to inspect corridor</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {popularCorridors.map(c => {
            const isSelected = selectedCorridor === c.code;
            return (
              <button
                key={c.code}
                onClick={() => {
                  setSelectedCorridor(c.code);
                  setOriginFilter('ALL');
                  setDestFilter('ALL');
                }}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition ${
                  isSelected
                    ? 'bg-[#0c2340] text-white border-[#0c2340] dark:bg-sky-600 dark:border-sky-600 dark:text-white font-semibold'
                    : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Filter Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Origin Dropdown */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
            Origin City / Hub
          </label>
          <select
            value={originFilter}
            onChange={(e) => {
              setOriginFilter(e.target.value);
              setDestFilter('ALL');
              if (e.target.value !== 'ALL') {
                const match = routes.find(r => r.origin_city === e.target.value);
                if (match) setSelectedCorridor(match.route_code);
              }
            }}
            className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
          >
            <option value="ALL">All Origins ({origins.length} Cities)</option>
            {origins.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Destination Dropdown */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
            Destination City
          </label>
          <select
            value={destFilter}
            onChange={(e) => {
              setDestFilter(e.target.value);
              if (e.target.value !== 'ALL') {
                const match = routes.find(r => (originFilter === 'ALL' || r.origin_city === originFilter) && r.dest_city === e.target.value);
                if (match) setSelectedCorridor(match.route_code);
              }
            }}
            className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
          >
            <option value="ALL">All Destinations ({destinations.length} Cities)</option>
            {destinations.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Carrier Filter Dropdown */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
            Operating Carrier
          </label>
          <select
            value={carrierFilter}
            onChange={(e) => setCarrierFilter(e.target.value)}
            className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
          >
            <option value="ALL">All Domestic Carriers</option>
            <option value="6E">IndiGo (6E) • 61.4% Share</option>
            <option value="AI">Air India Group (AI) • 26.8% Share</option>
            <option value="QP">Akasa Air (QP) • 5.2% Share</option>
            <option value="SG">SpiceJet (SG) • 4.1% Share</option>
          </select>
        </div>

        {/* Advance Booking Horizon */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
            Advance Purchase Window
          </label>
          <select
            value={advanceFilter}
            onChange={(e) => setAdvanceFilter(e.target.value)}
            className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
          >
            <option value="ALL">All Windows (Composite)</option>
            <option value="0-3">0–3 Days (Spot / Last Minute)</option>
            <option value="4-7">4–7 Days (Urgent Travel)</option>
            <option value="8-14">8–14 Days (Standard Window)</option>
            <option value="15-30">15–30 Days (Early Planning)</option>
            <option value="30+">30+ Days (Advance Floor)</option>
          </select>
        </div>

        {/* Cabin Class Selection */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
            Cabin Class
          </label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'ECONOMY', label: 'Economy' },
              { id: 'PREMIUM_ECONOMY', label: 'Prem. Eco' },
              { id: 'BUSINESS', label: 'Business' }
            ].map(c => {
              const isSelected = cabinClass === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCabinClass(c.id)}
                  className={`py-2 px-1 text-center rounded text-[11px] font-medium border transition ${
                    isSelected
                      ? 'bg-[#0c2340] text-white border-[#0c2340] dark:bg-sky-600 dark:border-sky-600 dark:text-white font-semibold'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Corridor Deep-Dive Panel */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded border border-slate-200 dark:border-slate-700 space-y-5">
        {/* Corridor Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-sans">
                {currentRoute.origin_city} ({currentRoute.origin_code}) ⇄ {currentRoute.dest_city} ({currentRoute.dest_code})
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-700 text-[#0c2340] dark:text-sky-300 border border-slate-300 dark:border-slate-600">
                {currentRoute.route_code}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <i data-lucide="tag" className="h-3.5 w-3.5"></i>
                <span>Category: <strong className="text-slate-700 dark:text-slate-200">{currentRoute.category || 'MEGA_METRO'}</strong></span>
              </span>
              <span>•</span>
              <span>Distance: <strong className="text-slate-700 dark:text-slate-200">{currentRoute.distance_km} km</strong></span>
              <span>•</span>
              <span>Frequency: <strong className="text-slate-700 dark:text-slate-200">{currentRoute.daily_flights || 48} flights/day</strong></span>
              <span>•</span>
              <span>DGCA Passenger Share: <strong className="text-slate-700 dark:text-slate-200">{currentRoute.dgca_weight_pct}%</strong></span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Selected Cabin:</span>
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600">
              {cabinClass === 'ECONOMY' ? 'Economy (1.0x)' : cabinClass === 'PREMIUM_ECONOMY' ? 'Premium Economy (1.6x)' : 'Business Class (2.75x)'}
            </span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Corridor Average */}
          <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">Weighted Average Fare</span>
              <span className={`text-[11px] font-mono font-bold ${currentRoute.pct_change_7d > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {currentRoute.pct_change_7d > 0 ? '+' : ''}{currentRoute.pct_change_7d}% 7d
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {formatINR(adjustedAvg)}
            </div>
            <div className="text-[11px] text-slate-500">
              Prev Week: {formatINR(Math.round(currentRoute.avg_fare_prev_week * cabinMultiplier))}
            </div>
          </div>

          {/* Card 2: Lowest Observed Floor */}
          <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">Lowest Observed Fare</span>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Price Floor</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {formatINR(adjustedMin)}
            </div>
            <div className="text-[11px] text-slate-500">
              Available at 21+ days advance window
            </div>
          </div>

          {/* Card 3: Peak Dynamic Ceiling */}
          <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">Peak Dynamic Ceiling</span>
              <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">Spot Peak</span>
            </div>
            <div className="text-2xl font-bold font-mono text-rose-700 dark:text-rose-400">
              {formatINR(adjustedMax)}
            </div>
            <div className="text-[11px] text-slate-500">
              Same-day / T-0 departure surge price
            </div>
          </div>

          {/* Card 4: Price Dispersion Spread */}
          <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">Dynamic Volatility Spread</span>
              <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">{spreadMultiplier}x ratio</span>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
              {formatINR(fareSpread)}
            </div>
            <div className="text-[11px] text-slate-500">
              Yield dispersion between floor & ceiling
            </div>
          </div>
        </div>

        {/* Chart + Corridor Economics Dual Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
          {/* Chart Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Advance Purchase Fare Escalation Curve
                </h3>
                <p className="text-[11px] text-slate-500">
                  Dynamic price progression by booking horizon for corridor {currentRoute.route_code} (Base: 2024 = 100)
                </p>
              </div>
              <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500">
                <span>Spot to 30d</span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full p-2.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
              <canvas ref={chartRef}></canvas>
            </div>

            <p className="text-[11px] text-slate-500 leading-tight italic">
              Notice: Dynamic pricing steepens exponentially within the final 7-day booking window as inventory buckets close and price-inelastic corporate demand enters the market.
            </p>
          </div>

          {/* Corridor Economic Attributes (1/3 width) */}
          <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">
              Corridor Economic Profile
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Yield per Pax-Km:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">₹{farePerKm} / km</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">DGCA Traffic Density:</span>
                <span className="font-mono font-bold text-[#0c2340] dark:text-sky-300">{currentRoute.dgca_weight_pct}% National</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Fuel (ATF) Sensitivity:</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">34.2% Pass-Through</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">UDAN Price Cap Status:</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {currentRoute.category === 'REGIONAL_UDAN' ? 'Capped under RCS-UDAN' : 'Commercial Market-Determined'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600 dark:text-slate-400">Operating Carriers:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                  {currentRoute.top_carriers ? currentRoute.top_carriers.join(', ') : 'IndiGo, Air India, Akasa'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <button
                onClick={() => {
                  if (setMlRoute) setMlRoute(currentRoute.route_code);
                  setActiveTab('ml_sandbox');
                }}
                className="w-full py-2 px-3 rounded text-xs font-semibold bg-[#0c2340] dark:bg-sky-600 text-white hover:bg-slate-800 dark:hover:bg-sky-500 transition text-center"
              >
                Simulate Dynamic Surge in ML Sandbox
              </button>
              <button
                onClick={() => setActiveTab('cpi')}
                className="w-full py-2 px-3 rounded text-xs font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-center"
              >
                Evaluate Impact on Official MoSPI CPI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Carrier Pricing & Fee Decomposition */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Corridor Carrier Breakdown & Unbundled Tariff Decomposition
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Statutory unbundling of passenger fare components across scheduled carriers on corridor {currentRoute.route_code}
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 self-start sm:self-auto">
            Base: 2024 = 100 • DGCA Tariff Standard
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border border-slate-200 dark:border-slate-700 text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">Carrier</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 font-mono">Market Share</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 font-mono">Base Airfare</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 font-mono">Fuel (ATF)</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 font-mono">Airport Taxes (UDF)</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 font-mono">Convenience Fee</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 font-mono font-bold">Total Net Fare</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 font-mono">OTP (%)</th>
                <th className="py-2.5 px-3">Model Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-200 font-medium">
              {carrierDecomposition.map((c, idx) => {
                const carrierBase = Math.round(adjustedAvg * c.basePct);
                const carrierAtf = Math.round(adjustedAvg * c.atfPct);
                const carrierUdf = c.udf;
                const carrierFee = c.fee;
                const totalCalculated = carrierBase + carrierAtf + carrierUdf + carrierFee;

                return (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                          {c.code}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                          <span className="text-[10px] text-slate-500">{c.baggage}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 font-mono font-bold text-[#0c2340] dark:text-sky-300">
                      {c.share}%
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 font-mono">
                      {formatINR(carrierBase)}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 font-mono">
                      {formatINR(carrierAtf)}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 font-mono text-slate-500">
                      {formatINR(carrierUdf)}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 font-mono text-slate-500">
                      {formatINR(carrierFee)}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white">
                      {formatINR(totalCalculated)}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      {c.otp}%
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => {
                          if (setMlRoute) setMlRoute(currentRoute.route_code);
                          if (setMlCarrier) setMlCarrier(c.code);
                          setActiveTab('ml_sandbox');
                        }}
                        className="px-2.5 py-1 rounded text-[11px] font-medium border border-slate-300 dark:border-slate-600 hover:bg-[#0c2340] hover:text-white dark:hover:bg-sky-600 transition"
                      >
                        Model in ML
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Corridor Matrix Table */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              All-India Domestic Air Corridor Matrix ({filteredRoutes.length} Corridors Active)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any corridor to inspect pricing curves and carrier decompositions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search city or corridor code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-7 pr-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7] w-48 sm:w-60"
              />
              <i data-lucide="search" className="h-3.5 w-3.5 absolute left-2 top-2 text-slate-400"></i>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
            >
              <option value="ALL">All Categories</option>
              <option value="MEGA_METRO">Mega Metro</option>
              <option value="METRO_TIER2">Metro to Tier-2</option>
              <option value="REGIONAL_UDAN">Regional / UDAN</option>
              <option value="TOURIST_LEISURE">Tourist / Leisure</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
            >
              <option value="dgca_desc">Sort: Highest DGCA Volume</option>
              <option value="fare_asc">Sort: Lowest Average Fare</option>
              <option value="fare_desc">Sort: Highest Average Fare</option>
              <option value="change_desc">Sort: Biggest 7d Change</option>
              <option value="distance_asc">Sort: Flight Distance</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border border-slate-200 dark:border-slate-700 text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">Code</th>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">Corridor City Pair</th>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">Category</th>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 font-mono">Distance</th>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 font-mono">DGCA Wt (%)</th>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 font-mono">Lowest Fare</th>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 font-mono font-bold">Avg Fare</th>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 font-mono">Peak Fare</th>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 font-mono">7d Change</th>
                <th className="py-2 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-200 font-medium">
              {filteredRoutes.map((r, idx) => {
                const isSelected = r.route_code === selectedCorridor;
                return (
                  <tr
                    key={idx}
                    onClick={() => {
                      setSelectedCorridor(r.route_code);
                      window.scrollTo({ top: 320, behavior: 'smooth' });
                    }}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/40 border-l-4 border-l-[#0284c7]'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 font-mono font-bold text-[#0c2340] dark:text-sky-300">
                      {r.route_code}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 font-medium">
                      {r.origin_city} ⇄ {r.dest_city}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
                      {r.category || 'MEGA_METRO'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 font-mono text-slate-500">
                      {r.distance_km} km
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 font-mono font-bold">
                      {r.dgca_weight_pct}%
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 font-mono text-emerald-700 dark:text-emerald-400">
                      {formatINR(r.min_fare)}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white">
                      {formatINR(r.avg_fare_current)}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 font-mono text-rose-700 dark:text-rose-400">
                      {formatINR(r.max_fare)}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 font-mono font-bold">
                      <span className={r.pct_change_7d > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}>
                        {r.pct_change_7d > 0 ? '+' : ''}{r.pct_change_7d}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCorridor(r.route_code);
                          window.scrollTo({ top: 320, behavior: 'smooth' });
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                          isSelected
                            ? 'bg-[#0c2340] text-white dark:bg-sky-600 font-semibold'
                            : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Data Provenance & Methodology Notice */}
      <div className="p-4 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          <i data-lucide="shield-check" className="h-4 w-4 text-[#0284c7]"></i>
          <span>Data Provenance & Statistical Standards (MoSPI / DGCA Protocol)</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Price observations are compiled according to the Ministry of Statistics and Programme Implementation (MoSPI) price index compilation manual and Directorate General of Civil Aviation (DGCA) city-pair passenger density weights. Base period: Calendar Year 2024 = 100. Sample observation dataset calibrated for demonstration of high-frequency price indices.
        </p>
      </div>
    </div>
  );
}
