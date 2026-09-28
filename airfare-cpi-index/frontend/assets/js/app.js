/**
 * Main React Application for MoSPI Real-time AirIndex Platform.
 * SIH Winning Feature Suite:
 * - AI Cartelization & Market Concentration (HHI) Analyzer
 * - Ask MoSPI AI Natural Language Economic Copilot
 * - Aviation Turbine Fuel (ATF) Pass-Through Elasticity Engine
 * - UDAN / RCS Regional Price Cap Compliance Tracker
 * - Trained Machine Learning Model for Mumbai ⇄ Delhi ⇄ Bangalore
 */

const { useState, useEffect, useRef, useMemo } = React;

const formatINR = (val) => {
  const num = typeof val === 'number' && !isNaN(val) ? val : Number(val) || 0;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

const formatNum = (val) => {
  const num = typeof val === 'number' && !isNaN(val) ? val : Number(val) || 0;
  return new Intl.NumberFormat('en-IN').format(num);
};

const getDataService = () => {
  if (typeof window !== 'undefined' && window.AIRINDEX_DATA_SERVICE) return window.AIRINDEX_DATA_SERVICE;
  if (typeof AIRINDEX_DATA_SERVICE !== 'undefined') return AIRINDEX_DATA_SERVICE;
  if (typeof window !== 'undefined' && window.AFPI_DATA_SERVICE) return window.AFPI_DATA_SERVICE;
  if (typeof window !== 'undefined' && window.AIEINDEX_DATA_SERVICE) return window.AIEINDEX_DATA_SERVICE;
  return null;
};

// ─── Portal Background Component ──────────────────
// Flat, clean background conforming to official government statistics standards
function PortalBackground() {
  return <div className="fixed inset-0 -z-10 bg-slate-50 dark:bg-slate-900 pointer-events-none" aria-hidden="true" />;
}

function App() {
  const [theme, setTheme] = useState(() => {
    // One-time localStorage migration: read legacy keys (afpi_theme, aieindex_theme), migrate to airindex_theme, and delete old keys
    let saved = localStorage.getItem('airindex_theme');
    if (!saved) {
      const legacyTheme = localStorage.getItem('afpi_theme') || localStorage.getItem('aieindex_theme');
      if (legacyTheme) {
        saved = legacyTheme;
        localStorage.setItem('airindex_theme', legacyTheme);
        localStorage.removeItem('afpi_theme');
        localStorage.removeItem('aieindex_theme');
      }
    }
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  const [activeTab, setActiveTab] = useState('price_explorer'); // 'home', 'dashboard', 'price_explorer', 'ml_sandbox', 'copilot', 'cpi', 'api_explorer', 'scraper', 'about'
  const [indexData, setIndexData] = useState(() => {
    const s = getDataService();
    return s?.generateClientSideIndexData ? s.generateClientSideIndexData(90) : null;
  });
  const [routesData, setRoutesData] = useState(() => {
    const s = getDataService();
    return s?.generateClientSideRoutes ? s.generateClientSideRoutes() : null;
  });
  const [airlinesData, setAirlinesData] = useState(() => {
    const s = getDataService();
    return s?.generateClientSideAirlines ? s.generateClientSideAirlines() : null;
  });
  const [cpiData, setCPIData] = useState(() => {
    const s = getDataService();
    return s?.calculateClientSideCPI ? s.calculateClientSideCPI() : null;
  });
  const [scraperStatus, setScraperStatus] = useState(() => {
    const s = getDataService();
    return s?.generateClientSideScraperStatus ? s.generateClientSideScraperStatus() : null;
  });
  const [forecast30d, setForecast30d] = useState(null);
  const [udanRoutes, setUdanRoutes] = useState([]);
  const [cartelHHI, setCartelHHI] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Connected to National AirIndex data layer.");

  // UX & User Request Suite: Scroll Progress, Cookie Banner, Last Updated & Refresh Sync
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cookieConsent, setCookieConsent] = useState(() => {
    // One-time localStorage migration: read legacy keys (afpi_cookie_consent, aieindex_cookie_consent), migrate to airindex_cookie_consent, and delete old keys
    let consent = localStorage.getItem('airindex_cookie_consent');
    if (!consent) {
      const legacyConsent = localStorage.getItem('afpi_cookie_consent') || localStorage.getItem('aieindex_cookie_consent');
      if (legacyConsent) {
        consent = legacyConsent;
        localStorage.setItem('airindex_cookie_consent', legacyConsent);
        localStorage.removeItem('afpi_cookie_consent');
        localStorage.removeItem('aieindex_cookie_consent');
      }
    }
    return consent;
  });
  const [isDismissingCookie, setIsDismissingCookie] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState("28 Sep 2026, 15:10 IST");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters State
  const [timeRange, setTimeRange] = useState(90);
  const [activeFormula, setActiveFormula] = useState('ALL');
  const [selectedRoute, setSelectedRoute] = useState('ALL');
  const [selectedAirline, setSelectedAirline] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedCabin, setSelectedCabin] = useState('ECONOMY');
  const [selectedAdvance, setSelectedAdvance] = useState('ALL');
  const [searchRouteQuery, setSearchRouteQuery] = useState('');

  // ML Playground State
  const [mlRoute, setMlRoute] = useState('DEL-BOM');
  const [mlDaysAhead, setMlDaysAhead] = useState(7);
  const [mlCarrier, setMlCarrier] = useState('6E');
  const [mlIsPrime, setMlIsPrime] = useState(true);
  const [mlIsWeekend, setMlIsWeekend] = useState(false);
  const [mlIsFestive, setMlIsFestive] = useState(false);
  const [mlBaggage, setMlBaggage] = useState(true);
  const [mlPredictionResult, setMlPredictionResult] = useState(null);
  const [mlTrainingState, setMlTrainingState] = useState({ isTraining: false, result: null });

  // ATF Fuel Simulator State
  const [atfChangePct, setAtfChangePct] = useState(10.0);
  const [atfResult, setAtfResult] = useState(null);

  // Copilot State
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotChat, setCopilotChat] = useState([
    {
      sender: 'bot',
      text: 'Namaste! I am the MoSPI Airfare Economic Copilot. Ask me about airfare inflation nowcasting, ATF jet fuel elasticity, carrier cartelization HHI, or UDAN regional price caps.',
      category: 'WELCOME',
      data: null
    }
  ]);
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  // CPI Simulator State
  const [simOfficialCPI, setSimOfficialCPI] = useState(5.20);
  const [simTransportWeight, setSimTransportWeight] = useState(8.59);
  const [simAirfareWeight, setSimAirfareWeight] = useState(9.80);
  const [simAirfareGrowth, setSimAirfareGrowth] = useState(12.80);

  // Scraper Trigger State
  const [scrapeModalOpen, setScrapeModalOpen] = useState(false);
  const [scrapeRouteInput, setScrapeRouteInput] = useState('DEL-BOM');
  const [scrapeDaysAhead, setScrapeDaysAhead] = useState(7);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null);

  // 1. Scroll Progress Bar Listener
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Dark/Light Mode Class Sync
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('airindex_theme', theme);
  }, [theme]);

  // 3. Initial Load with Progressive Step Telemetry
  useEffect(() => {
    let isMounted = true;
    async function loadAll() {
      setLoadingStep("Querying airline and OTA scraping endpoints...");
      
      try {
        const s = getDataService();
        if (!s) {
          console.warn("AirIndex data service unavailable, continuing with client state");
          return;
        }

        const fetchSafe = async (fn, fallback = null) => {
          try {
            if (fn) {
              const res = await fn();
              if (res) return res;
            }
          } catch (e) {
            console.warn("fetchSafe caught error:", e);
          }
          return fallback;
        };

        const [idx, rts, air, cpi, scp, fc, ud, ch, atf] = await Promise.all([
          fetchSafe(() => s.fetchIndexData(90)),
          fetchSafe(() => s.fetchRoutesData()),
          fetchSafe(() => s.fetchAirlinesData()),
          fetchSafe(() => s.fetchCPIData()),
          fetchSafe(() => s.fetchScraperStatus()),
          fetchSafe(() => s.fetchForecast30d(121.4)),
          fetchSafe(() => s.fetchUDANRoutes()),
          fetchSafe(() => s.fetchCartelHHI()),
          fetchSafe(() => s.fetchATFSimulation(10.0))
        ]);

        if (!isMounted) return;

        if (idx) setIndexData(idx);
        if (rts) setRoutesData(rts);
        if (air) setAirlinesData(air);
        if (cpi) setCPIData(cpi);
        if (scp) setScraperStatus(scp);
        if (fc) setForecast30d(fc);
        if (ud?.routes) setUdanRoutes(ud.routes);
        if (ch) setCartelHHI(ch);
        if (atf) setAtfResult(atf);
        setLastSyncTimestamp(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " IST");
      } catch (err) {
        console.error("Critical error in loadAll:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadAll();
    return () => { isMounted = false; };
  }, []);

  // Manual Refresh Handler
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const s = getDataService();
      if (s) {
        const [idx, rts] = await Promise.all([
          s.fetchIndexData(timeRange),
          s.fetchRoutesData()
        ]);
        if (idx) setIndexData(idx);
        if (rts) setRoutesData(rts);
      }
      setLastSyncTimestamp(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " IST");
    } catch (e) {
      console.warn("Refresh failed:", e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Cookie Consent Handlers
  const handleSaveCookieConsent = (type = 'all') => {
    setIsDismissingCookie(true);
    setTimeout(() => {
      localStorage.setItem('airindex_cookie_consent', type);
      setCookieConsent(type);
      setIsDismissingCookie(false);
    }, 300);
  };

  // Update ML Prediction on input changes
  useEffect(() => {
    async function runPrediction() {
      try {
        const s = getDataService();
        if (s && s.predictFare) {
          const pred = await s.predictFare(
            mlRoute,
            mlDaysAhead,
            mlCarrier,
            mlIsPrime,
            mlIsWeekend,
            mlIsFestive,
            mlBaggage
          );
          if (pred) setMlPredictionResult(pred);
        }
      } catch (e) {
        console.warn("Prediction hook error:", e);
      }
    }
    runPrediction();
  }, [mlRoute, mlDaysAhead, mlCarrier, mlIsPrime, mlIsWeekend, mlIsFestive, mlBaggage]);

  // Update ATF Simulation
  useEffect(() => {
    async function runATF() {
      try {
        const s = getDataService();
        if (s && s.fetchATFSimulation) {
          const res = await s.fetchATFSimulation(atfChangePct);
          if (res) setAtfResult(res);
        }
      } catch (e) {
        console.warn("ATF hook error:", e);
      }
    }
    runATF();
  }, [atfChangePct]);

  const handleRunScrape = async () => {
    setIsScraping(true);
    setScrapeResult(null);
    try {
      const s = getDataService();
      const res = s && s.triggerScrape ? await s.triggerScrape(scrapeRouteInput, scrapeDaysAhead) : null;
      setTimeout(() => {
        setScrapeResult(res);
        setIsScraping(false);
      }, 1200);
    } catch (e) {
      setIsScraping(false);
    }
  };

  const handleTrainModel = async () => {
    setMlTrainingState({ isTraining: true, result: null });
    try {
      const s = getDataService();
      const res = s && s.trainModel ? await s.trainModel(200) : null;
      setTimeout(() => {
        setMlTrainingState({ isTraining: false, result: res });
      }, 1400);
    } catch (e) {
      setMlTrainingState({ isTraining: false, result: null });
    }
  };

  const handleSendCopilotPrompt = async (promptText) => {
    const textToSend = promptText || copilotInput;
    if (!textToSend.trim()) return;

    setCopilotChat(prev => [...prev, { sender: 'user', text: textToSend }]);
    setCopilotInput('');
    setIsCopilotThinking(true);

    try {
      const s = getDataService();
      const res = s && s.copilotQuery ? await s.copilotQuery(textToSend) : null;
      setTimeout(() => {
        if (res) {
          setCopilotChat(prev => [
            ...prev,
            {
              sender: 'bot',
              text: res.answer || "Analysis complete.",
              category: res.category || "GENERAL",
              data: res.data_card,
              recommendation: res.recommended_action
            }
          ]);
        }
        setIsCopilotThinking(false);
      }, 800);
    } catch (e) {
      setIsCopilotThinking(false);
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const megaMetroCorridors = [
    { code: "DEL-BOM", name: "Delhi ⇄ Mumbai", dist: "1,148 km", fare: "₹5,850", chg: "+3.4%", up: true, r2: "0.964" },
    { code: "BOM-DEL", name: "Mumbai ⇄ Delhi", dist: "1,148 km", fare: "₹5,790", chg: "+3.1%", up: true, r2: "0.962" },
    { code: "BLR-DEL", name: "Bangalore ⇄ Delhi", dist: "1,740 km", fare: "₹7,150", chg: "+2.1%", up: true, r2: "0.971" },
    { code: "DEL-BLR", name: "Delhi ⇄ Bangalore", dist: "1,740 km", fare: "₹7,080", chg: "+1.9%", up: true, r2: "0.969" },
    { code: "BOM-BLR", name: "Mumbai ⇄ Bangalore", dist: "842 km", fare: "₹4,720", chg: "-1.2%", up: false, r2: "0.958" },
    { code: "BLR-BOM", name: "Bangalore ⇄ Mumbai", dist: "842 km", fare: "₹4,680", chg: "-0.9%", up: false, r2: "0.959" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-150 flex flex-col font-sans relative">
      <PortalBackground />

      {/* Flat 2px solid progress bar */}
      <div className="scroll-progress-container">
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      {/* Top Government Masthead */}
      <div className="bg-[#0c2340] text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800 flex justify-between items-center z-50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-medium text-slate-200">
            <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block"></span>
            <span>Government of India • Ministry of Statistics and Programme Implementation (MoSPI)</span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-300">National Statistical Office (NSO)</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-[11px] font-mono bg-slate-900/90 px-2.5 py-0.5 rounded border border-slate-700 text-slate-300">
            <span>Last Sync: {lastSyncTimestamp}</span>
            <button
              onClick={handleManualRefresh}
              className={`ml-1 text-slate-400 hover:text-white transition ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh Real-Time Dataset"
            >
              <i data-lucide="refresh-cw" className="h-3 w-3"></i>
            </button>
          </div>
          <span className="hidden sm:inline text-slate-300 font-mono text-[11px]">Base: 2024 = 100</span>
          <span className="hidden sm:inline text-slate-300 text-[11px]">Sample Demonstration Dataset</span>
        </div>
      </div>

      {/* Corridor Benchmark Ticker */}
      <div className="bg-slate-900 border-b border-slate-800 text-xs py-1.5 px-4 overflow-hidden relative">
        <div className="flex items-center space-x-6">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider flex items-center whitespace-nowrap">
            Key Corridor Fares:
          </span>
          <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar whitespace-nowrap">
            {megaMetroCorridors.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setMlRoute(item.code);
                  setActiveTab('ml_sandbox');
                }}
                className="inline-flex items-center space-x-1.5 text-[11px] font-mono cursor-pointer hover:bg-slate-800 px-2 py-0.5 rounded transition"
              >
                <span className="text-slate-300 font-semibold">{item.code}:</span>
                <span className="text-white font-medium">{item.fare}</span>
                <span className={item.up ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                  {item.up ? '▲' : '▼'} {item.chg}
                </span>
                <span className="text-[10px] text-slate-400">(R² {item.r2})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="px-2 h-8 rounded bg-[#0c2340] dark:bg-sky-600 text-white font-bold text-xs flex items-center justify-center tracking-wider font-mono">
              AirIndex
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  AirIndex
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  MoSPI Prototype
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Consumer Price Index Modernization Initiative</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { id: 'home', label: 'Overview', icon: 'file-text' },
              { id: 'dashboard', label: 'Index Dashboard', icon: 'layout-dashboard' },
              { id: 'price_explorer', label: 'Flight Price Explorer', icon: 'plane' },
              { id: 'ml_sandbox', label: 'Fare Models', icon: 'line-chart' },
              { id: 'copilot', label: 'Statistical Queries', icon: 'help-circle' },
              { id: 'cpi', label: 'CPI Simulator', icon: 'calculator' },
              { id: 'api_explorer', label: 'Data API', icon: 'code' },
              { id: 'scraper', label: 'Telemetry', icon: 'activity' },
              { id: 'about', label: 'Methodology & Team', icon: 'info' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0c2340] text-white dark:bg-sky-600 dark:text-white font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                }`}
              >
                <i data-lucide={tab.icon} className="h-3.5 w-3.5"></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-2.5">
            {/* Harvest Data Button */}
            <button
              onClick={() => setScrapeModalOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold btn-saffron"
            >
              <i data-lucide="refresh-cw" className="h-3.5 w-3.5"></i>
              <span>Harvest Data</span>
            </button>

            {/* Dark Mode Toggle Switch */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === 'dark' ? (
                <>
                  <i data-lucide="sun" className="h-3.5 w-3.5 text-amber-400"></i>
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <i data-lucide="moon" className="h-3.5 w-3.5 text-slate-700"></i>
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Sample Data Notice Banner (MoSPI Credibility Notice) */}
        <div className="mb-5 p-3.5 bg-amber-50 dark:bg-slate-800/90 border border-amber-300 dark:border-amber-700 rounded text-xs text-amber-950 dark:text-amber-200 flex items-start space-x-3">
          <i data-lucide="info" className="h-4 w-4 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0"></i>
          <div className="space-y-0.5">
            <div className="font-semibold text-amber-900 dark:text-amber-100">Notice on Data Provenance</div>
            <p className="text-amber-800 dark:text-amber-300 leading-normal">
              Sample data for demonstration. Live web scraping pipeline across airline portals is in active development under MoSPI Smart India Hackathon problem guidelines. Base period: 2024 = 100.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Loading AirIndex data...</p>
            <p className="text-xs text-slate-500 font-mono">National Statistical Office, Ministry of Statistics and Programme Implementation</p>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <LandingView
                indexData={indexData}
                routesData={routesData}
                setActiveTab={setActiveTab}
                setScrapeModalOpen={setScrapeModalOpen}
              />
            )}
            {activeTab === 'dashboard' && (
              <DashboardView
                indexData={indexData}
                routesData={routesData}
                airlinesData={airlinesData}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                activeFormula={activeFormula}
                setActiveFormula={setActiveFormula}
                selectedRoute={selectedRoute}
                setSelectedRoute={setSelectedRoute}
                selectedAirline={selectedAirline}
                setSelectedAirline={setSelectedAirline}
                selectedSource={selectedSource}
                setSelectedSource={setSelectedSource}
                selectedCabin={selectedCabin}
                setSelectedCabin={setSelectedCabin}
                selectedAdvance={selectedAdvance}
                setSelectedAdvance={setSelectedAdvance}
                searchRouteQuery={searchRouteQuery}
                setSearchRouteQuery={setSearchRouteQuery}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === 'price_explorer' && (
              <FlightPriceExplorerView
                indexData={indexData}
                routesData={routesData}
                airlinesData={airlinesData}
                setActiveTab={setActiveTab}
                setMlRoute={setMlRoute}
                setMlCarrier={setMlCarrier}
              />
            )}
            {activeTab === 'ml_sandbox' && (
              <MLPlaygroundView
                mlRoute={mlRoute}
                setMlRoute={setMlRoute}
                mlDaysAhead={mlDaysAhead}
                setMlDaysAhead={setMlDaysAhead}
                mlCarrier={mlCarrier}
                setMlCarrier={setMlCarrier}
                mlIsPrime={mlIsPrime}
                setMlIsPrime={setMlIsPrime}
                mlIsWeekend={mlIsWeekend}
                setMlIsWeekend={setMlIsWeekend}
                mlIsFestive={mlIsFestive}
                setMlIsFestive={setMlIsFestive}
                mlBaggage={mlBaggage}
                setMlBaggage={setMlBaggage}
                mlPredictionResult={mlPredictionResult}
                mlTrainingState={mlTrainingState}
                handleTrainModel={handleTrainModel}
                forecast30d={forecast30d}
                megaMetroCorridors={megaMetroCorridors}
                atfChangePct={atfChangePct}
                setAtfChangePct={setAtfChangePct}
                atfResult={atfResult}
                udanRoutes={udanRoutes}
                cartelHHI={cartelHHI}
              />
            )}
            {activeTab === 'copilot' && (
              <CopilotView
                copilotChat={copilotChat}
                copilotInput={copilotInput}
                setCopilotInput={setCopilotInput}
                handleSendCopilotPrompt={handleSendCopilotPrompt}
                isCopilotThinking={isCopilotThinking}
              />
            )}
            {activeTab === 'api_explorer' && <APIExplorerView />}
            {activeTab === 'cpi' && (
              <CPIIntegrationView
                cpiData={cpiData}
                indexData={indexData}
                simOfficialCPI={simOfficialCPI}
                setSimOfficialCPI={setSimOfficialCPI}
                simTransportWeight={simTransportWeight}
                setSimTransportWeight={setSimTransportWeight}
                simAirfareWeight={simAirfareWeight}
                setSimAirfareWeight={setSimAirfareWeight}
                simAirfareGrowth={simAirfareGrowth}
                setSimAirfareGrowth={setSimAirfareGrowth}
              />
            )}
            {activeTab === 'scraper' && (
              <ScraperMonitorView
                scraperStatus={scraperStatus}
                setScrapeModalOpen={setScrapeModalOpen}
              />
            )}
            {activeTab === 'about' && <AboutView />}
          </>
        )}
      </main>

      {/* Live Scrape Modal */}
      {scrapeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded max-w-lg w-full p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0284c7]">
                  <i data-lucide="refresh-cw" className="h-4 w-4"></i>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Run On-Demand Web Harvest</h3>
                  <p className="text-[11px] text-slate-500">Scheduled scraping workers across airline and OTA portals</p>
                </div>
              </div>
              <button onClick={() => setScrapeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i data-lucide="x" className="h-4 w-4"></i>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Target Flight Corridor</label>
                <select
                  value={scrapeRouteInput}
                  onChange={(e) => setScrapeRouteInput(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded p-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0284c7]"
                >
                  <option value="DEL-BOM">DEL–BOM (Delhi ⇄ Mumbai - 1,148 km)</option>
                  <option value="BOM-DEL">BOM–DEL (Mumbai ⇄ Delhi - 1,148 km)</option>
                  <option value="BLR-DEL">BLR–DEL (Bengaluru ⇄ Delhi - 1,740 km)</option>
                  <option value="DEL-BLR">DEL–BLR (Delhi ⇄ Bengaluru - 1,740 km)</option>
                  <option value="BOM-BLR">BOM–BLR (Mumbai ⇄ Bengaluru - 842 km)</option>
                  <option value="BLR-BOM">BLR–BOM (Bengaluru ⇄ Mumbai - 842 km)</option>
                </select>
              </div>

              {isScraping && (
                <div className="p-3.5 rounded bg-sky-50 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 text-center space-y-1.5">
                  <div className="inline-block w-5 h-5 border-2 border-[#0284c7] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-semibold text-[#0c2340] dark:text-sky-300">Harvesting price observations...</p>
                  <p className="text-[10px] text-slate-500">Querying IndiGo, Air India, Akasa Air, MakeMyTrip, EaseMyTrip</p>
                </div>
              )}

              {scrapeResult && (
                <div className="p-3.5 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
                    <i data-lucide="check-circle-2" className="h-4 w-4"></i>
                    <span>Harvest Completed & Logged into Dataset</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 block">Min Fare</span>
                      <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">{formatINR(scrapeResult.min_fare_discovered)}</span>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 block">Avg Fare</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">{formatINR(scrapeResult.avg_fare_discovered)}</span>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 block">Quotes</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">{scrapeResult.harvested_records_count}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono break-all pt-1">
                    SHA-256 Provenance Hash: {scrapeResult.data_provenance_hash}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setScrapeModalOpen(false)}
                className="px-3 py-1.5 rounded text-xs font-medium border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={handleRunScrape}
                disabled={isScraping}
                className="px-3 py-1.5 rounded text-xs font-semibold bg-[#0c2340] dark:bg-[#0284c7] hover:bg-[#1a365d] text-white disabled:opacity-50 transition"
              >
                {isScraping ? 'Harvesting...' : 'Trigger Harvest'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Simple Cookie Banner */}
      {!cookieConsent && (
        <div
          role="region"
          aria-label="Cookie consent banner"
          className={`fixed bottom-4 inset-x-4 sm:max-w-xl sm:mx-auto z-50 p-4 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md space-y-3 cookie-banner ${
            isDismissingCookie ? 'cookie-banner-exit' : 'cookie-banner-enter'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0284c7] shrink-0 mt-0.5">
              <i data-lucide="cookie" className="h-4 w-4"></i>
            </div>
            <div className="flex-1 space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Cookie &amp; Privacy Notice</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                We use cookies to store your preferences (such as light/dark mode) and anonymous aggregate analytics.{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="font-medium text-[#0284c7] underline hover:text-[#0369a1] focus:outline-none"
                >
                  Read our privacy note.
                </button>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => handleSaveCookieConsent('essential')}
              className="px-3 py-1.5 rounded text-xs font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Essential only
            </button>
            <button
              type="button"
              onClick={() => handleSaveCookieConsent('all')}
              className="px-3.5 py-1.5 rounded text-xs font-semibold bg-[#0c2340] dark:bg-[#0284c7] hover:bg-[#1a365d] text-white transition"
            >
              Accept all
            </button>
          </div>
        </div>
      )}

      {/* Privacy Note Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded max-w-lg w-full p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0284c7]">
                  <i data-lucide="shield-check" className="h-4 w-4"></i>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">MoSPI AirIndex Privacy Note</h3>
                  <p className="text-[11px] text-slate-500">Data Governance & Local Storage Policy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded p-1"
                aria-label="Close privacy note"
              >
                <i data-lucide="x" className="h-4 w-4"></i>
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <strong className="block text-slate-900 dark:text-white mb-0.5">1. Essential Local Storage</strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Stores your UI display theme preference (<code className="font-mono text-[#0284c7]">airindex_theme</code>) and cookie consent state (<code className="font-mono text-[#0284c7]">airindex_cookie_consent</code>). No personally identifiable information (PII) is collected.
                </p>
              </div>

              <div className="p-3 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <strong className="block text-slate-900 dark:text-white mb-0.5">2. Statistical Telemetry</strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Anonymous session telemetry on corridor calculations assists in capacity planning for continuous price observation pipelines.
                </p>
              </div>

              <p className="text-[11px] text-slate-400 pt-1">
                Complies with Government of India Digital Personal Data Protection (DPDP) Act standards.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="px-3.5 py-1.5 rounded text-xs font-medium bg-[#0c2340] dark:bg-[#0284c7] hover:bg-[#1a365d] text-white transition"
              >
                Close Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 py-8 bg-white dark:bg-[#050C1A] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              IN
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">AirIndex: Airfare Price Index for India</p>
              <p className="text-[11px] text-slate-400">Developed for Smart India Hackathon (SIH) | Augmentation of MoSPI Consumer Price Index (CPI)</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={() => setActiveTab('copilot')} className="hover:text-amber-400 transition font-medium">Ask MoSPI AI</button>
            <button onClick={() => setActiveTab('ml_sandbox')} className="hover:text-amber-400 transition font-medium">ATF Elasticity Engine</button>
            <button onClick={() => setActiveTab('scraper')} className="hover:text-amber-400 transition font-medium">Scraper Telemetry</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 1. LANDING VIEW COMPONENT
// -----------------------------------------------------------------------------
function LandingView({ indexData, routesData, airlinesData, setActiveTab, setScrapeModalOpen }) {
  useEffect(() => {
    if (window.lucide) lucide.createIcons();
  }, []);

  const headline = indexData?.headline_number || 121.40;
  const dod = indexData?.dod_change_pct || 0.62;
  const wow = indexData?.wow_change_pct || 2.45;
  const mom = indexData?.mom_change_pct || 4.18;
  const yoy = indexData?.yoy_change_pct || 12.80;
  const routesCount = routesData?.routes?.length || 32;
  const airlinesCount = airlinesData?.airlines?.length || 9;

  return (
    <div className="space-y-6">
      {/* Main Government Hero Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <span>Official Statistical Index Prototype</span>
              <span>•</span>
              <span>Ministry of Statistics & Programme Implementation</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
              AirIndex: Airfare Price Index for India
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              A daily index compiled from airfares collected across airline and travel portals, designed to monitor high-frequency fare movements and supplement the Transport component of the Consumer Price Index (CPI).
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 rounded text-xs font-semibold bg-[#0c2340] dark:bg-sky-600 text-white hover:bg-slate-800 dark:hover:bg-sky-500 transition"
              >
                View Index Dashboard
              </button>
              <button
                onClick={() => setActiveTab('price_explorer')}
                className="px-4 py-2 rounded text-xs font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Flight Price Explorer
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className="px-4 py-2 rounded text-xs font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                View Methodology
              </button>
            </div>
          </div>

          {/* Headline AirIndex Card */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-5 space-y-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                All-India Composite AirIndex
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl sm:text-4xl font-bold font-mono text-slate-900 dark:text-white">
                  {headline.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 font-mono">pts (Base: 2024 = 100)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200 dark:border-slate-700 pt-3">
              <div>
                <span className="text-slate-500 block text-[11px]">Day-on-Day</span>
                <span className={`font-mono font-semibold ${dod >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                  {dod >= 0 ? `+${dod}%` : `${dod}%`}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Month-on-Month</span>
                <span className="font-mono font-semibold text-rose-700 dark:text-rose-400">+{mom}%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Year-on-Year</span>
                <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">+{yoy}%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Reference Date</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">28 Sep 2026</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-2 font-mono">
              Source: NSO AirIndex Observation Database.
            </div>
          </div>
        </div>
      </div>

      {/* Statistical Scope & Coverage Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-3.5">
          <span className="text-[11px] text-slate-500 block font-medium">Domestic Routes Covered</span>
          <span className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">{routesCount} City Pairs</span>
          <span className="text-[10px] text-slate-400">DGCA Scheduled Flights</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-3.5">
          <span className="text-[11px] text-slate-500 block font-medium">Portals Monitored</span>
          <span className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">{airlinesCount} Sources</span>
          <span className="text-[10px] text-slate-400">Scheduled Airlines & OTAs</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-3.5">
          <span className="text-[11px] text-slate-500 block font-medium">Elementary Index Formula</span>
          <span className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">Jevons Geometric</span>
          <span className="text-[10px] text-slate-400">Unweighted Micro Aggregation</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-3.5">
          <span className="text-[11px] text-slate-500 block font-medium">Higher-Level Formula</span>
          <span className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">Laspeyres Weighted</span>
          <span className="text-[10px] text-slate-400">DGCA Passenger Load Weights</span>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 2. DASHBOARD VIEW COMPONENT
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// 2. DASHBOARD VIEW COMPONENT (MULTI-YEAR 2024, 2025, 2026 + LIVE SIMULATOR)
// -----------------------------------------------------------------------------
function DashboardView({
  indexData,
  routesData,
  airlinesData,
  timeRange,
  setTimeRange,
  activeFormula,
  setActiveFormula,
  selectedRoute,
  setSelectedRoute,
  selectedAirline,
  setSelectedAirline,
  selectedSource,
  setSelectedSource,
  selectedCabin,
  setSelectedCabin,
  selectedAdvance,
  setSelectedAdvance,
  searchRouteQuery,
  setSearchRouteQuery,
  setActiveTab
}) {
  const chartCanvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const overlayInstanceRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [routeCategoryFilter, setRouteCategoryFilter] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL'); // 'ALL' (3Y), '2024', '2025', '2026'

  // Live Multi-Year Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(5); // 1x, 5x, 15x, 30x
  const [simIndex, setSimIndex] = useState(null); // current day index in series (0 to N)

  const master3ySeries = useMemo(() => {
    return indexData?.time_series_3y || indexData?.time_series_365d || [];
  }, [indexData]);

  // Initialize simulation index to latest point
  useEffect(() => {
    if (master3ySeries.length > 0 && simIndex === null) {
      setSimIndex(master3ySeries.length - 1);
    }
  }, [master3ySeries, simIndex]);

  // Simulation timer playback ticker
  useEffect(() => {
    let interval = null;
    if (isSimulating && master3ySeries.length > 0) {
      interval = setInterval(() => {
        setSimIndex(prev => {
          if (prev === null || prev >= master3ySeries.length - 1) {
            return 0; // loop back to 2024 start
          }
          return prev + 1;
        });
      }, Math.max(20, Math.floor(600 / simSpeed)));
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, simSpeed, master3ySeries]);

  const activeSimPoint = useMemo(() => {
    if (!master3ySeries.length) return null;
    const idx = (simIndex !== null && simIndex >= 0 && simIndex < master3ySeries.length)
      ? simIndex
      : master3ySeries.length - 1;
    return master3ySeries[idx];
  }, [master3ySeries, simIndex]);

  useEffect(() => {
    if (window.lucide) lucide.createIcons();
  }, [routeCategoryFilter, selectedYear, isSimulating, activeSimPoint]);

  // 1. Time-Series Chart (Filtered by Year or Day Range)
  useEffect(() => {
    if (!chartCanvasRef.current || !master3ySeries.length) return;

    const ctx = chartCanvasRef.current.getContext('2d');
    
    let displaySeries = master3ySeries;
    if (selectedYear === '2024') {
      displaySeries = master3ySeries.filter(p => p.year === 2024);
    } else if (selectedYear === '2025') {
      displaySeries = master3ySeries.filter(p => p.year === 2025);
    } else if (selectedYear === '2026') {
      displaySeries = master3ySeries.filter(p => p.year === 2026);
    } else if (timeRange < master3ySeries.length) {
      displaySeries = master3ySeries.slice(-timeRange);
    }

    const labels = displaySeries.map(d => {
      const parts = d.date.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;
    });

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const textColor = isDark ? '#94a3b8' : '#475569';

    const datasets = [];

    if (activeFormula === 'ALL' || activeFormula === 'JEVONS') {
      datasets.push({
        label: 'AirIndex Headline (Jevons Elementary Index)',
        data: displaySeries.map(d => d.jevons_index),
        borderColor: '#0284c7',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: displaySeries.length <= 30 ? 2.5 : 0,
        tension: 0.1,
        fill: false
      });
    }

    if (activeFormula === 'ALL' || activeFormula === 'LASPEYRES') {
      datasets.push({
        label: 'Laspeyres Quantity-Weighted (Base 2024=100)',
        data: displaySeries.map(d => d.laspeyres_index),
        borderColor: isDark ? '#93c5fd' : '#0c2340',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: displaySeries.length <= 30 ? 2 : 0,
        tension: 0.1,
        fill: false
      });
    }

    if (activeFormula === 'ALL' || activeFormula === 'FISHER') {
      datasets.push({
        label: 'Fisher Ideal Index (Superlative)',
        data: displaySeries.map(d => d.fisher_index || d.laspeyres_index * 0.998),
        borderColor: '#64748b',
        borderWidth: 1.5,
        borderDash: [3, 3],
        pointRadius: 0,
        tension: 0.1,
        fill: false
      });
    }

    datasets.push({
      label: 'Official MoSPI CPI Transport Sub-Index',
      data: displaySeries.map(d => d.mospi_transport_index),
      borderColor: '#d97706',
      borderWidth: 1.8,
      borderDash: [5, 5],
      pointRadius: 0,
      tension: 0.1,
      fill: false
    });

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 200 },
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
            padding: 10,
            callbacks: {
              afterBody: function(items) {
                const idx = items[0].dataIndex;
                const point = displaySeries[idx];
                return point?.season_label || point?.season_name ? `Season: ${point.season_label || point.season_name}` : '';
              }
            }
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, maxTicksLimit: displaySeries.length >= 365 ? 12 : 8 } },
          y: { grid: { color: gridColor }, ticks: { color: textColor }, suggestedMin: 95 }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [master3ySeries, timeRange, selectedYear, activeFormula]);

  // 2. Multi-Year Comparative Monthly Overlay Chart (2024 vs 2025 vs 2026)
  useEffect(() => {
    if (!overlayCanvasRef.current || !indexData?.monthly_comparison_matrix) return;

    const ctx = overlayCanvasRef.current.getContext('2d');
    const matrix = indexData.monthly_comparison_matrix;

    const months = matrix.map(m => m.month);
    const y24 = matrix.map(m => m.index_2024);
    const y25 = matrix.map(m => m.index_2025);
    const y26 = matrix.map(m => m.index_2026);

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const textColor = isDark ? '#94a3b8' : '#475569';

    if (overlayInstanceRef.current) {
      overlayInstanceRef.current.destroy();
    }

    overlayInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: '2024 (Base Period - Avg: 100.0)',
            data: y24,
            borderColor: '#0284c7',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 2.5,
            tension: 0.1
          },
          {
            label: '2025 (Expansion Year - Avg: 110.8)',
            data: y25,
            borderColor: isDark ? '#93c5fd' : '#0c2340',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 2.5,
            tension: 0.1
          },
          {
            label: '2026 (Current - Avg: 121.4)',
            data: y26,
            borderColor: '#d97706',
            backgroundColor: 'transparent',
            borderWidth: 2.5,
            pointRadius: 3,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 200 },
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
            padding: 10
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor }, suggestedMin: 95 }
        }
      }
    });

    return () => {
      if (overlayInstanceRef.current) {
        overlayInstanceRef.current.destroy();
      }
    };
  }, [indexData]);

  // 3. Map Initialization (Light Blue Land/Water Palette + Sky-500 Routes + Green/Red Markers)
  useEffect(() => {
    if (!mapContainerRef.current || !routesData?.routes || !window.L) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, { center: [21.5, 79.5], zoom: 4.5, zoomControl: false, attributionControl: false });
      L.control.zoom({ position: 'topright' }).addTo(map);

      const isDark = document.documentElement.classList.contains('dark');
      // CartoDB Voyager: crisp light blue sea / water and light land palette
      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, { maxZoom: 8, minZoom: 4 }).addTo(map);

      const airports = routesData.airports || {};
      const routes = routesData.routes || [];

      Object.keys(airports).forEach(code => {
        const apt = airports[code];
        const marker = L.circleMarker([apt.lat, apt.lng], {
          radius: 6,
          fillColor: '#0ea5e9', // sky-500
          color: '#ffffff',
          weight: 2,
          fillOpacity: 0.95
        }).addTo(map);
        marker.bindPopup(`<strong>${apt.city} (${code})</strong><br/><span style="color:#64748b;">${apt.name}</span>`);
      });

      routes.forEach(r => {
        if (r.origin_coords && r.dest_coords) {
          const latlngs = [r.origin_coords, r.dest_coords];
          // Route lines in sky-500, price drops in green (#16a34a), price rises in red (#e11d48)
          const color = r.pct_change_7d > 3 ? '#e11d48' : (r.pct_change_7d < 0 ? '#16a34a' : '#0ea5e9');
          L.polyline(latlngs, {
            color: color,
            weight: Math.max(2, (r.dgca_weight_pct || 3) * 0.45),
            opacity: 0.85,
            dashArray: '5, 6'
          })
            .addTo(map)
            .bindPopup(`<strong>${r.route_code}</strong> (${r.origin_city} ⇄ ${r.dest_city})<br/>Avg Fare: ${formatINR(r.avg_fare_current)}<br/>DGCA Weight: ${r.dgca_weight_pct}%<br/>7d Change: <strong style="color:${color}">${r.pct_change_7d > 0 ? '+' : ''}${r.pct_change_7d}%</strong>`);
        }
      });

      mapInstanceRef.current = map;
    }
  }, [routesData]);

  const filteredRoutes = useMemo(() => {
    if (!routesData?.routes) return [];
    return routesData.routes.filter(r => {
      const matchSearch = r.route_code.toLowerCase().includes(searchRouteQuery.toLowerCase()) ||
                          r.origin_city.toLowerCase().includes(searchRouteQuery.toLowerCase()) ||
                          r.dest_city.toLowerCase().includes(searchRouteQuery.toLowerCase());
      const matchRoute = selectedRoute === 'ALL' || r.route_code === selectedRoute;
      const matchCategory = routeCategoryFilter === 'ALL' || r.category === routeCategoryFilter;
      return matchSearch && matchRoute && matchCategory;
    });
  }, [routesData, searchRouteQuery, selectedRoute, routeCategoryFilter]);

  const yearlyMacro = indexData?.yearly_macro_metrics || {
    "2024": { year: "2024", title: "Base Period (2024=100)", annual_airindex_avg: 100.00, yoy_inflation: "Base (0.0%)", annual_pax_millions: 152.4, avg_domestic_fare_inr: 4620, atf_avg_price_kl: 92400, milestones: "MoSPI Base Year Calibration, UDAN 5.2 expansion" },
    "2025": { year: "2025", title: "Expansion & ATF Escalation", annual_airindex_avg: 110.85, yoy_inflation: "+10.85%", annual_pax_millions: 168.2, avg_domestic_fare_inr: 5120, atf_avg_price_kl: 96800, milestones: "Air India-Vistara merger integration, ATF tax hike" },
    "2026": { year: "2026", title: "Real-Time Peak & Nowcasting", annual_airindex_avg: 121.40, yoy_inflation: "+12.80%", annual_pax_millions: 184.6, avg_domestic_fare_inr: 5780, atf_avg_price_kl: 102400, milestones: "Noida & Navi Mumbai airports, automated web scraping" }
  };

  const currentSimPct = master3ySeries.length > 0 && simIndex !== null
    ? Math.round((simIndex / (master3ySeries.length - 1)) * 100)
    : 100;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Interactive 3-Year Time Series Playback */}
      <div className="p-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              <i data-lucide="history" className="h-3.5 w-3.5 text-[#0284c7]"></i>
              <span>Daily Index Series Playback (2024–2026)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Daily AirIndex Series & Historical Progression
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Continuous series across 1,002 calendar dates from Base Year 2024 to September 2026. Sample demonstration data calibrated to DGCA route weights.
            </p>
          </div>

          {/* Player Controls */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1.5 rounded">
            <button
              onClick={() => setSimIndex(prev => Math.max(0, (prev || 0) - 7))}
              className="p-1.5 rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Step Backward 7 Days"
            >
              <i data-lucide="skip-back" className="h-3.5 w-3.5"></i>
            </button>

            <button
              onClick={() => setIsSimulating(prev => !prev)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
                isSimulating
                  ? 'bg-rose-700 hover:bg-rose-800 text-white'
                  : 'bg-[#0c2340] hover:bg-[#1a365d] dark:bg-[#0284c7] dark:hover:bg-[#0369a1] text-white'
              }`}
            >
              <i data-lucide={isSimulating ? "pause" : "play"} className="h-3.5 w-3.5 fill-current"></i>
              <span>{isSimulating ? "Pause Playback" : "Playback Feed"}</span>
            </button>

            <button
              onClick={() => setSimIndex(prev => Math.min(master3ySeries.length - 1, (prev || 0) + 7))}
              className="p-1.5 rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Step Forward 7 Days"
            >
              <i data-lucide="skip-forward" className="h-3.5 w-3.5"></i>
            </button>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

            {/* Speed Selector */}
            <div className="flex items-center space-x-1 text-xs">
              {[
                { label: "1x", val: 1 },
                { label: "5x", val: 5 },
                { label: "15x", val: 15 },
                { label: "30x", val: 30 }
              ].map(s => (
                <button
                  key={s.val}
                  onClick={() => setSimSpeed(s.val)}
                  className={`px-2 py-0.5 rounded font-mono font-medium text-xs transition ${
                    simSpeed === s.val
                      ? 'bg-[#0c2340] dark:bg-[#0284c7] text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Simulation Live Metric Cards */}
        {activeSimPoint && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
            <div className="p-3 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Observation Date</span>
              <div className="text-base font-bold font-mono text-[#0c2340] dark:text-sky-300">
                {activeSimPoint.date}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Year {activeSimPoint.year} ({activeSimPoint.month})</span>
            </div>

            <div className="p-3 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">AirIndex Headline Index</span>
              <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {activeSimPoint.headline_index.toFixed(2)}
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Base 2024 = 100</span>
            </div>

            <div className="p-3 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Avg Pan-India Fare</span>
              <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {formatINR(activeSimPoint.avg_fare_inr)}
              </div>
              <span className="text-[10px] text-slate-400">DGCA Basket Weighted</span>
            </div>

            <div className="p-3 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Seasonal Reference</span>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {activeSimPoint.season_label || activeSimPoint.season_name || "Standard Period"}
              </div>
              <span className="text-[10px] text-slate-500">
                {activeSimPoint.is_festive_spike ? 'Peak Seasonal Demand' : 'Standard Yield Window'}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-4 lg:col-span-1 p-3 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">CPI Augmented Delta</span>
              <div className="text-base font-bold font-mono text-amber-700 dark:text-amber-400">
                +{Math.round(((activeSimPoint.headline_index - 100) * 0.28) * 10) / 10} bps
              </div>
              <span className="text-[10px] text-slate-400">vs Official Survey Rate</span>
            </div>
          </div>
        )}

        {/* Scrubber Progress Slider */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300">2024 Base (1 Jan 2024)</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">2025 Calendar Series</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">2026 Reference Date (28 Sep 2026)</span>
          </div>
          <input
            type="range"
            min="0"
            max={Math.max(0, master3ySeries.length - 1)}
            value={simIndex !== null ? simIndex : master3ySeries.length - 1}
            onChange={(e) => {
              setSimIndex(parseInt(e.target.value));
              if (isSimulating) setIsSimulating(false);
            }}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer accent-[#0284c7]"
          />
        </div>
      </div>

      {/* 2. Multi-Year Macro Annual Comparisons (2024 vs 2025 vs 2026) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i data-lucide="layers" className="h-4 w-4 text-[#0284c7]"></i>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Annual Macro Benchmarks & Structural Reference
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">DGCA & MoSPI Structural Comparison</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {["2024", "2025", "2026"].map(yr => {
            const m = yearlyMacro[yr] || {};
            const isCurrent = yr === "2026";
            const isBase = yr === "2024";
            return (
              <div
                key={yr}
                onClick={() => setSelectedYear(selectedYear === yr ? 'ALL' : yr)}
                className={`p-4 rounded border transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-sky-50/50 dark:bg-slate-800 border-[#0284c7] ring-1 ring-[#0284c7]'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">{m.title}</span>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white font-mono">{yr}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    isBase
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : isCurrent
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      : 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                  }`}>
                    {m.yoy_inflation}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-slate-100 dark:border-slate-700 my-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Avg Annual AirIndex</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">{m.annual_airindex_avg}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Avg Ticket Fare</span>
                    <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">{formatINR(m.avg_domestic_fare_inr)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Passenger Volume</span>
                    <span className="font-bold font-mono text-slate-700 dark:text-slate-300">{m.annual_pax_millions}M</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">ATF Jet Fuel Rate</span>
                    <span className="font-bold font-mono text-slate-700 dark:text-slate-300">{formatINR(m.atf_avg_price_kl)}/kL</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 pt-1">
                  <strong>Key Milestone:</strong> {m.milestones}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Main Filter & Time-Series Controls */}
      <div className="p-4 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Domestic AirIndex Dashboard</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
                {selectedYear === 'ALL' ? '3-Year Horizon (2024–2026)' : `Year ${selectedYear} Focus`}
              </span>
            </div>
            <p className="text-xs text-slate-500">Multi-formula continuous econometric calculation across 32 DGCA flight corridors</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Year Selector */}
            <div className="flex items-center space-x-0.5 p-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              {[
                { id: 'ALL', label: 'All 3 Years' },
                { id: '2024', label: '2024 (Base)' },
                { id: '2025', label: '2025' },
                { id: '2026', label: '2026 (Live)' }
              ].map(y => (
                <button
                  key={y.id}
                  onClick={() => setSelectedYear(y.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    selectedYear === y.id ? 'bg-[#0c2340] dark:bg-[#0284c7] text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {y.label}
                </button>
              ))}
            </div>

            {/* Formula Selector */}
            <div className="flex items-center space-x-0.5 p-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              {[
                { id: 'ALL', label: 'All Formulas' },
                { id: 'JEVONS', label: 'Jevons (Geo)' },
                { id: 'LASPEYRES', label: 'Laspeyres' },
                { id: 'FISHER', label: 'Fisher' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFormula(f.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    activeFormula === f.id ? 'bg-[#0c2340] dark:bg-[#0284c7] text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Trailing Range Selector */}
            {selectedYear === 'ALL' && (
              <div className="flex items-center space-x-0.5 p-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                {[
                  { val: 7, label: '7D' },
                  { val: 30, label: '30D' },
                  { val: 90, label: '90D' },
                  { val: 365, label: '1Y' },
                  { val: 1000, label: '3Y Full' }
                ].map(t => (
                  <button
                    key={t.val}
                    onClick={() => setTimeRange(t.val)}
                    className={`px-2 py-1 rounded text-xs font-medium transition ${
                      timeRange === t.val ? 'bg-[#0c2340] dark:bg-[#0284c7] text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Parametric Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Target Corridor</label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0284c7]"
            >
              <option value="ALL">All 32 Monitored Corridors</option>
              <option value="DEL-BOM">DEL–BOM (Delhi ⇄ Mumbai)</option>
              <option value="BOM-DEL">BOM–DEL (Mumbai ⇄ Delhi)</option>
              <option value="BLR-DEL">BLR–DEL (Bengaluru ⇄ Delhi)</option>
              <option value="DEL-BLR">DEL–BLR (Delhi ⇄ Bengaluru)</option>
              <option value="BOM-BLR">BOM–BLR (Mumbai ⇄ Bengaluru)</option>
              <option value="BLR-BOM">BLR–BOM (Bengaluru ⇄ Mumbai)</option>
              <option value="DEL-HYD">DEL–HYD (Delhi ⇄ Hyderabad)</option>
              <option value="CCU-DEL">CCU–DEL (Kolkata ⇄ Delhi)</option>
              <option value="DEL-GOI">DEL–GOI (Delhi ⇄ Goa)</option>
              <option value="DEL-SXR">DEL–SXR (Delhi ⇄ Srinagar)</option>
              <option value="DEL-PAT">DEL–PAT (Delhi ⇄ Patna)</option>
              <option value="DEL-GAU">DEL–GAU (Delhi ⇄ Guwahati)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Carrier Group</label>
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0284c7]"
            >
              <option value="ALL">All Carriers (DGCA Fleet)</option>
              <option value="6E">IndiGo (6E - 61.4% Share)</option>
              <option value="AI">Air India Group (AI - 26.8%)</option>
              <option value="QP">Akasa Air (QP - 5.2%)</option>
              <option value="SG">SpiceJet (SG - 4.1%)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Source Category</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0284c7]"
            >
              <option value="ALL">All Sources (9 Portals)</option>
              <option value="AIRLINE">Airline Direct (IndiGo, AI, Akasa, SpiceJet)</option>
              <option value="OTA">Online Travel Portals (MMT, EaseMyTrip, etc.)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Advance Window</label>
            <select
              value={selectedAdvance}
              onChange={(e) => setSelectedAdvance(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0284c7]"
            >
              <option value="ALL">DGCA Weighted Composite</option>
              <option value="0-3d">0–3 Days (Spot/Surge)</option>
              <option value="4-7d">4–7 Days (Urgent)</option>
              <option value="8-14d">8–14 Days (Moderate)</option>
              <option value="15-30d">15–30 Days (Base)</option>
              <option value="30+d">30+ Days (Early Bird)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Cabin Class</label>
            <select
              value={selectedCabin}
              onChange={(e) => setSelectedCabin(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0284c7]"
            >
              <option value="ECONOMY">Economy Class (94% Basket)</option>
              <option value="PREMIUM_ECONOMY">Premium Economy</option>
              <option value="BUSINESS">Business Class</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Main Charts: Multi-Year Time Series & 3-Year Monthly Comparative Overlay */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Continuous Time-Series Chart */}
        <div className="p-4 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Continuous AirIndex Time-Series vs MoSPI Benchmark
              </h3>
              <p className="text-[11px] text-slate-500">
                {selectedYear === 'ALL' ? 'Showing 3-Year Continuous Trajectory (2024–2026)' : `Showing Complete Year ${selectedYear} Daily Trajectory`}
              </p>
            </div>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
              {selectedYear === 'ALL' ? `${timeRange}D Horizon` : `FY ${selectedYear}`}
            </span>
          </div>
          <div className="h-72 w-full relative">
            <canvas ref={chartCanvasRef}></canvas>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            Source: Airfare observation database. Base: 2024 = 100. Sample series for demonstration.
          </div>
        </div>

        {/* 3-Year Monthly Overlay (2024 vs 2025 vs 2026) */}
        <div className="p-4 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                3-Year Month-by-Month Overlay (2024 vs 2025 vs 2026)
              </h3>
              <p className="text-[11px] text-slate-500">Comparative seasonal curves showing annual compounding inflation</p>
            </div>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
              Jan – Dec Seasonality
            </span>
          </div>
          <div className="h-72 w-full relative">
            <canvas ref={overlayCanvasRef}></canvas>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            Source: MoSPI / DGCA AirIndex Database. Base: 2024 = 100. Sample data for demonstration.
          </div>
        </div>
      </div>

      {/* 5. Zonal Inflation Dispersion Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i data-lucide="map-pin" className="h-4 w-4 text-[#0284c7]"></i>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Zonal Airfare Inflation Dispersion (YoY 2025–2026)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Weighted Regional Basket</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {[
            { zone: "Northern Zone", yoy_inflation: "+14.2%", top_route: "DEL-BOM", index: 124.8, risk: "HIGH" },
            { zone: "Western Zone", yoy_inflation: "+11.8%", top_route: "BOM-BLR", index: 119.5, risk: "MODERATE" },
            { zone: "Southern Zone", yoy_inflation: "+9.4%", top_route: "BLR-HYD", index: 116.2, risk: "STABLE" },
            { zone: "Eastern Zone", yoy_inflation: "+13.6%", top_route: "CCU-DEL", index: 123.1, risk: "HIGH" },
            { zone: "North-Eastern Zone", yoy_inflation: "+16.8%", top_route: "DEL-GAU", index: 127.4, risk: "CRITICAL" }
          ].map((z, idx) => (
            <div key={idx} className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-medium text-slate-500 block truncate">{z.zone}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold font-mono text-rose-700 dark:text-rose-400">{z.yoy_inflation}</span>
                <span className="text-[10px] font-mono text-slate-400">Idx {z.index}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">
                <span>Top: {z.top_route}</span>
                <span className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${z.risk === 'CRITICAL' ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800' : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'}`}>
                  {z.risk}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. 32-Route Pan-India Corridor Matrix */}
      <div className="p-4 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">32 Key Pan-India Flight Corridors Matrix</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 font-mono">
                {filteredRoutes.length} Corridors Active
              </span>
            </div>
            <p className="text-xs text-slate-500">DGCA volume-weighted basket covering 88.4% of total Indian domestic air traffic</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Pills */}
            <div className="flex items-center space-x-0.5 p-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              {[
                { id: 'ALL', label: 'All (32)' },
                { id: 'Mega-Metro', label: 'Mega-Metro (14)' },
                { id: 'High-Growth Tech', label: 'Tech Hubs (9)' },
                { id: 'Tourism & Leisure', label: 'Tourism (6)' },
                { id: 'Tier-2 Regional', label: 'Tier-2 (3)' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setRouteCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    routeCategoryFilter === cat.id ? 'bg-[#0c2340] dark:bg-[#0284c7] text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search corridor or code..."
                value={searchRouteQuery}
                onChange={(e) => setSearchRouteQuery(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0284c7] w-44"
              />
            </div>
          </div>
        </div>

        {/* Interactive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-900">
                <th className="py-2.5 px-3">Corridor</th>
                <th className="py-2.5 px-3">Origin ⇄ Destination</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Distance</th>
                <th className="py-2.5 px-3">DGCA Weight</th>
                <th className="py-2.5 px-3">Current Fare (Avg)</th>
                <th className="py-2.5 px-3">Observed Spread</th>
                <th className="py-2.5 px-3">7-Day Change</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
              {filteredRoutes.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#0c2340] dark:text-sky-300">
                    {r.route_code}
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 dark:text-white font-medium">
                    {r.origin_city} ⇄ {r.dest_city}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                      {r.category || 'Domestic'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400">
                    {r.distance_km} km
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {r.dgca_weight_pct}%
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                    {formatINR(r.avg_fare_current)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                    {formatINR(r.min_fare)} – {formatINR(r.max_fare)}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold">
                    <span className={r.pct_change_7d > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}>
                      {r.pct_change_7d > 0 ? '+' : ''}{r.pct_change_7d}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedRoute(r.route_code);
                        setActiveTab('ml_sandbox');
                      }}
                      className="px-2 py-1 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 transition"
                    >
                      Model Analysis
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-[10px] text-slate-500 font-mono pt-1">
          Source: DGCA Scheduled Domestic Airline Traffic Reports & airline observation database. Sample data for demonstration.
        </div>
      </div>

      {/* 7. Geospatial Route Network Map */}
      <div className="p-4 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Geospatial Flight Route Density Map</h3>
            <p className="text-xs text-slate-500">Route vector coverage across major Indian airport nodes</p>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">32 Domestic Corridors</span>
        </div>
        <div ref={mapContainerRef} className="h-80 w-full rounded border border-slate-200 dark:border-slate-700 z-0"></div>
        <div className="text-[10px] text-slate-500 font-mono pt-1">
          Source: DGCA City Pair Scheduled Domestic Flight Routes. Base map: CartoDB Voyager.
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 3. ✨ ML PRICE PLAYGROUND + ATF FUEL ELASTICITY + CARTEL & UDAN
// -----------------------------------------------------------------------------
function MLPlaygroundView({
  mlRoute,
  setMlRoute,
  mlDaysAhead,
  setMlDaysAhead,
  mlCarrier,
  setMlCarrier,
  mlIsPrime,
  setMlIsPrime,
  mlIsWeekend,
  setMlIsWeekend,
  mlIsFestive,
  setMlIsFestive,
  mlBaggage,
  setMlBaggage,
  mlPredictionResult,
  mlTrainingState,
  handleTrainModel,
  forecast30d,
  megaMetroCorridors,
  atfChangePct,
  setAtfChangePct,
  atfResult,
  udanRoutes,
  cartelHHI
}) {
  const forecastChartCanvasRef = useRef(null);
  const forecastChartInstanceRef = useRef(null);

  useEffect(() => {
    if (window.lucide) lucide.createIcons();
  }, [mlPredictionResult, mlTrainingState, atfResult]);

  useEffect(() => {
    if (!forecastChartCanvasRef.current || !forecast30d?.forecast_series) return;

    const ctx = forecastChartCanvasRef.current.getContext('2d');
    const series = forecast30d.forecast_series;

    const labels = series.map(d => {
      const p = d.date.split('-');
      return `${p[2]}/${p[1]}`;
    });

    const values = series.map(d => d.forecast_index);
    const upper = series.map(d => d.upper_ci);
    const lower = series.map(d => d.lower_ci);

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const textColor = isDark ? '#94a3b8' : '#475569';

    if (forecastChartInstanceRef.current) {
      forecastChartInstanceRef.current.destroy();
    }

    forecastChartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '30-Day Forward Forecast Index',
            data: values,
            borderColor: '#0284c7',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.1,
            fill: false
          },
          {
            label: '95% Upper Bound',
            data: upper,
            borderColor: '#dc2626',
            borderDash: [3, 3],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          },
          {
            label: '95% Lower Bound',
            data: lower,
            borderColor: '#16a34a',
            borderDash: [3, 3],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 200 },
        plugins: {
          legend: { position: 'top', labels: { color: textColor, font: { family: 'Inter', size: 11, weight: 600 } } },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            titleColor: isDark ? '#f8fafc' : '#0f172a',
            bodyColor: isDark ? '#cbd5e1' : '#334155',
            borderColor: isDark ? '#475569' : '#cbd5e1',
            borderWidth: 1,
            cornerRadius: 4,
            padding: 10
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, maxTicksLimit: 10 } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } }
        }
      }
    });

    return () => {
      if (forecastChartInstanceRef.current) {
        forecastChartInstanceRef.current.destroy();
      }
    };
  }, [forecast30d]);

  const pred = mlPredictionResult?.prediction || {
    predicted_fare_inr: 5850,
    confidence_interval_95: { lower_bound: 5380, upper_bound: 6320 },
    model_r_squared: 0.964,
    surge_state: "HIGH_SURGE",
    price_percentile_historic: 68,
    recommendation: "BUY_NOW",
    hedonic_decomposition: { base_distance_fare: 4200, advance_purchase_impact_inr: 1200, carrier_markup_inr: 150, prime_time_premium_inr: 300 }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="p-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          <i data-lucide="line-chart" className="h-3.5 w-3.5 text-[#0284c7]"></i>
          <span>Econometric Price Models & Sensitivity Analysis</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Corridor Price Regression & Econometric Elasticity Models
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          Hedonic price regression calibrated across primary domestic air corridors analyzing dynamic advance booking curves, fuel cost elasticity, and route market concentration.
        </p>
      </div>

      {/* Corridor Quick Switcher */}
      <div className="p-4 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Select Domestic Corridor for Regression Analysis:
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Statistical Fit: R² ≥ 0.958</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {megaMetroCorridors.map((c, idx) => (
            <button
              key={idx}
              onClick={() => setMlRoute(c.code)}
              className={`p-2.5 rounded border text-left transition ${
                mlRoute === c.code
                  ? 'border-[#0284c7] bg-sky-50/50 dark:bg-slate-700/60 text-[#0c2340] dark:text-sky-300 font-semibold ring-1 ring-[#0284c7]'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span>{c.code}</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400">R² {c.r2}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">{c.name}</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">{c.fare}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Active Corridor: {mlRoute}</h3>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
              Regression Fit: R² = {pred.model_r_squared}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Domestic Corridor</label>
              <select
                value={mlRoute}
                onChange={(e) => setMlRoute(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0284c7]"
              >
                <option value="DEL-BOM">DEL–BOM (Delhi ⇄ Mumbai - 1,148 km)</option>
                <option value="BOM-DEL">BOM–DEL (Mumbai ⇄ Delhi - 1,148 km)</option>
                <option value="BLR-DEL">BLR–DEL (Bengaluru ⇄ Delhi - 1,740 km)</option>
                <option value="DEL-BLR">DEL–BLR (Delhi ⇄ Bengaluru - 1,740 km)</option>
                <option value="BOM-BLR">BOM–BLR (Mumbai ⇄ Bengaluru - 842 km)</option>
                <option value="BLR-BOM">BLR–BOM (Bengaluru ⇄ Mumbai - 842 km)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Carrier Group</label>
              <select
                value={mlCarrier}
                onChange={(e) => setMlCarrier(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0284c7]"
              >
                <option value="6E">IndiGo (6E - Market Share 61.4%)</option>
                <option value="AI">Air India Group (AI - Full Service 26.8%)</option>
                <option value="QP">Akasa Air (QP - 5.2%)</option>
                <option value="SG">SpiceJet (SG - 4.1%)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">Days to Departure (Advance Window)</span>
              <span className="font-mono font-bold text-[#0c2340] dark:text-sky-300 text-xs">
                {mlDaysAhead} Days Ahead {mlDaysAhead <= 3 ? '(0–3 Day Spot Window)' : ''}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={mlDaysAhead}
              onChange={(e) => setMlDaysAhead(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer accent-[#0284c7]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => setMlIsPrime(!mlIsPrime)}
              className={`p-2 rounded border text-xs font-medium flex flex-col items-center space-y-0.5 transition ${
                mlIsPrime
                  ? 'border-[#0284c7] bg-sky-50 dark:bg-slate-700 text-[#0c2340] dark:text-sky-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <i data-lucide="sun-medium" className="h-3.5 w-3.5"></i>
              <span>Prime Hours</span>
              <span className="text-[9px] text-slate-400">06:00-09:00 / 18:00-21:00</span>
            </button>

            <button
              onClick={() => setMlIsWeekend(!mlIsWeekend)}
              className={`p-2 rounded border text-xs font-medium flex flex-col items-center space-y-0.5 transition ${
                mlIsWeekend
                  ? 'border-[#0284c7] bg-sky-50 dark:bg-slate-700 text-[#0c2340] dark:text-sky-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <i data-lucide="calendar" className="h-3.5 w-3.5"></i>
              <span>Weekend Flight</span>
              <span className="text-[9px] text-slate-400">Fri / Sun Departures</span>
            </button>

            <button
              onClick={() => setMlIsFestive(!mlIsFestive)}
              className={`p-2 rounded border text-xs font-medium flex flex-col items-center space-y-0.5 transition ${
                mlIsFestive
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <i data-lucide="flame" className="h-3.5 w-3.5"></i>
              <span>Peak Festive</span>
              <span className="text-[9px] text-slate-400">High-Demand Window</span>
            </button>

            <button
              onClick={() => setMlBaggage(!mlBaggage)}
              className={`p-2 rounded border text-xs font-medium flex flex-col items-center space-y-0.5 transition ${
                mlBaggage
                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <i data-lucide="luggage" className="h-3.5 w-3.5"></i>
              <span>15kg Check-in</span>
              <span className="text-[9px] text-slate-400">{mlBaggage ? 'Included in Fare' : 'Hand Baggage Only'}</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-semibold text-xs text-slate-900 dark:text-white block">Calibrate Hedonic Model Weights</span>
              <span className="text-[11px] text-slate-400">Recalibrates regression coefficients across domestic route observations</span>
            </div>
            <button
              onClick={handleTrainModel}
              disabled={mlTrainingState.isTraining}
              className="px-3 py-1.5 rounded text-xs font-medium bg-[#0c2340] dark:bg-[#0284c7] hover:bg-[#1a365d] text-white transition flex items-center space-x-1.5"
            >
              {mlTrainingState.isTraining ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Calibrating...</span>
                </>
              ) : (
                <>
                  <i data-lucide="refresh-cw" className="h-3 w-3"></i>
                  <span>Recalibrate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prediction Card */}
        <div className="p-5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Model Estimation Output</span>
            <h3 className="text-base font-bold mt-0.5 text-slate-900 dark:text-white">Expected Point Fare</h3>
            <p className="text-[11px] text-slate-500">{mlRoute} estimate with 95% confidence interval</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Model Estimated Fare</span>
              <div className="text-3xl font-bold font-mono text-[#0c2340] dark:text-sky-300 mt-0.5">
                {formatINR(pred.predicted_fare_inr)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                95% CI: <span className="font-mono text-slate-700 dark:text-slate-300">{formatINR(pred.confidence_interval_95.lower_bound)}</span> – <span className="font-mono text-slate-700 dark:text-slate-300">{formatINR(pred.confidence_interval_95.upper_bound)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Corridor Percentile</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-white">{pred.price_percentile_historic}th</span>
              </div>
              <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Yield State</span>
                <span className={`text-xs font-bold font-mono ${pred.surge_state === 'HIGH_SURGE' ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                  {pred.surge_state === 'HIGH_SURGE' ? 'Surge Window' : 'Base Window'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px]">Hedonic Decomposition:</span>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Distance Component:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{formatINR(pred.hedonic_decomposition.base_distance_fare)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Advance Purchase Premium:</span>
                <span className="font-mono text-amber-700 dark:text-amber-400">+{formatINR(pred.hedonic_decomposition.advance_purchase_impact_inr)}</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center font-mono">
            Calibrated against DGCA Scheduled Flight Fares
          </div>
        </div>
      </div>

      {/* Jet Fuel (ATF) Pass-Through Elasticity Model */}
      <div className="p-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Aviation Turbine Fuel (ATF) Pass-Through Elasticity Model
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                OPEX Fuel Share: ~42%
              </span>
            </div>
            <p className="text-xs text-slate-500">Simulate transmission of jet fuel price revisions to consumer ticket prices and headline CPI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">Simulated ATF Price Revision (%)</span>
                <span className="font-mono font-bold text-[#0284c7] text-xs">{atfChangePct > 0 ? `+${atfChangePct}%` : `${atfChangePct}%`}</span>
              </div>
              <input
                type="range"
                min="-20.0"
                max="40.0"
                step="1.0"
                value={atfChangePct}
                onChange={(e) => setAtfChangePct(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer accent-[#0284c7]"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-20% (Crude Decline)</span>
                <span>0% (Status Quo)</span>
                <span>+10% (Revision)</span>
                <span>+40% (Surge)</span>
              </div>
            </div>

            <div className="p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <p>{atfResult?.summary_note}</p>
            </div>
          </div>

          <div className="p-3.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Downstream Elasticity Impact</span>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-slate-500">Airfare Shift:</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">+{atfResult?.airfare_projected_shift_pct}%</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">Headline CPI Delta:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">+{atfResult?.cpi_headline_shift_bps} bps</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">Transmission Lag:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{atfResult?.passthrough_lag_days} Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UDAN Regional Price Cap Compliance & Market Concentration HHI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* UDAN Compliance */}
        <div className="p-4 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Regional Connectivity Scheme (UDAN) Price Cap Compliance
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
              MoCA Cap: ₹2,500/hr
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2 px-3">Route</th>
                  <th className="py-2 px-3">Cap</th>
                  <th className="py-2 px-3">Avg Fare</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {udanRoutes.map((u, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-mono font-semibold text-slate-900 dark:text-white">{u.route} ({u.origin} ⇄ {u.dest})</td>
                    <td className="py-2 px-3 font-mono text-slate-500">{formatINR(u.udan_fare_cap_inr)}</td>
                    <td className="py-2 px-3 font-mono font-semibold text-slate-900 dark:text-white">{formatINR(u.current_observed_avg_inr)}</td>
                    <td className="py-2 px-3">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${u.compliance === 'COMPLIANT' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'}`}>
                        {u.compliance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cartelization HHI */}
        <div className="p-4 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Market Concentration & Herfindahl-Hirschman Index (HHI)
            </h3>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
              HHI: {cartelHHI?.hhi?.hhi_index}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <p className="text-slate-500">
              Under Competition Commission of India (CCI) benchmarks, an HHI score &gt; 2,500 reflects high market concentration with duopoly characteristics.
            </p>

            <div className="space-y-2">
              {cartelHHI?.market_share_breakdown?.map((m, mIdx) => (
                <div key={mIdx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{m.carrier}</span>
                    <span className="font-mono text-slate-900 dark:text-white font-semibold">{m.share}% Share</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded overflow-hidden">
                    <div className="h-full bg-[#0c2340] dark:bg-[#0284c7] rounded" style={{ width: `${m.share}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 4. STATISTICAL QUERY ASSISTANT
// -----------------------------------------------------------------------------
function CopilotView({
  copilotChat,
  copilotInput,
  setCopilotInput,
  handleSendCopilotPrompt,
  isCopilotThinking
}) {
  useEffect(() => {
    if (window.lucide) lucide.createIcons();
  }, [copilotChat, isCopilotThinking]);

  const quickPrompts = [
    "What is the impact if ATF jet fuel price increases by 15%?",
    "Analyze carrier cartelization and HHI concentration in India",
    "Are regional UDAN flight price caps being breached?",
    "Explain divergence between official MoSPI CPI and real-time AirIndex",
    "What is the expected fare on DEL-BOM for 3 days advance?"
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl mx-auto">
      <div className="p-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          <i data-lucide="help-circle" className="h-3.5 w-3.5 text-[#0284c7]"></i>
          <span>Statistical Query & Econometric Assistant</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Statistical Query & Policy Assistant</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
          Ask queries regarding headline inflation nowcasting, ATF jet fuel elasticity, carrier concentration, and route methodology.
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-1.5">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendCopilotPrompt(q)}
            className="px-2.5 py-1 rounded text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#0284c7] transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="p-4 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 min-h-[360px] max-h-[480px] overflow-y-auto">
        {copilotChat.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl p-3 rounded text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#0c2340] dark:bg-[#0284c7] text-white font-medium'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 space-y-2'
              }`}
            >
              <p>{msg.text}</p>

              {msg.recommendation && (
                <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-[11px]">
                  <strong>Policy Reference:</strong> {msg.recommendation}
                </div>
              )}
            </div>
          </div>
        ))}

        {isCopilotThinking && (
          <div className="flex justify-start">
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs flex items-center space-x-2 text-slate-500">
              <div className="w-3 h-3 border-2 border-[#0284c7] border-t-transparent rounded-full animate-spin"></div>
              <span>Querying statistical index and econometric models...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask statistical query about airfare inflation, fuel pass-through, or routes..."
          value={copilotInput}
          onChange={(e) => setCopilotInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendCopilotPrompt()}
          className="flex-1 p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
        />
        <button
          onClick={() => handleSendCopilotPrompt()}
          className="px-4 py-2.5 rounded bg-[#0c2340] dark:bg-[#0284c7] hover:bg-[#1a365d] text-white font-medium text-xs transition flex items-center space-x-1.5"
        >
          <span>Send</span>
          <i data-lucide="send" className="h-3.5 w-3.5"></i>
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 5. CPI INTEGRATION VIEW
// -----------------------------------------------------------------------------
function CPIIntegrationView({
  cpiData,
  indexData,
  simOfficialCPI,
  setSimOfficialCPI,
  simTransportWeight,
  setSimTransportWeight,
  simAirfareWeight,
  setSimAirfareWeight,
  simAirfareGrowth,
  setSimAirfareGrowth
}) {
  useEffect(() => {
    if (window.lucide) lucide.createIcons();
  }, []);

  const sim = cpiData?.simulation || {
    official_cpi_headline: 5.20,
    augmented_cpi_headline: 5.43,
    inflation_delta_bps: 23.0,
    official_airfare_weight_pct: 0.14,
    proposed_airfare_weight_pct: 0.84,
    realtime_airindex_growth_yoy: 12.8
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="p-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          <i data-lucide="calculator" className="h-3.5 w-3.5 text-[#0284c7]"></i>
          <span>MoSPI National Accounts Calibration Module</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">CPI Augmentation & Inflation Nowcasting Simulator</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs max-w-3xl leading-relaxed">
          The official Indian Consumer Price Index (CPI-Combined, Base 2012=100) assigns approximately <strong>0.14%</strong> weight to air travel. This simulation evaluates the impact on headline inflation when adjusting subgroup weights using DGCA passenger traffic and high-frequency AirIndex.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Policy Simulation Parameters</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">Airfare Weight in Transport Subgroup</span>
                <span className="font-mono font-bold text-[#0284c7] text-xs">{simAirfareWeight}%</span>
              </div>
              <input
                type="range"
                min="1.6"
                max="20.0"
                step="0.2"
                value={simAirfareWeight}
                onChange={(e) => setSimAirfareWeight(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer accent-[#0284c7]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">AirIndex Annual Growth Rate (YoY %)</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">+{simAirfareGrowth}%</span>
              </div>
              <input
                type="range"
                min="-10.0"
                max="40.0"
                step="0.5"
                value={simAirfareGrowth}
                onChange={(e) => setSimAirfareGrowth(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer accent-[#16a34a]"
              />
            </div>
          </div>
        </div>

        <div className="p-5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Simulation Output</span>
            <h3 className="text-base font-bold mt-0.5">Augmented CPI Impact</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Official CPI airfare component</span>
                <span className="text-xl font-bold font-mono text-slate-700 dark:text-slate-300">{sim.official_cpi_headline.toFixed(2)}%</span>
              </div>
              <i data-lucide="arrow-right" className="h-4 w-4 text-slate-400"></i>
              <div>
                <span className="text-[10px] text-[#0284c7] block uppercase font-bold">AirIndex</span>
                <span className="text-2xl font-bold font-mono text-[#0284c7]">{sim.augmented_cpi_headline.toFixed(2)}%</span>
              </div>
            </div>

            <div className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium">Headline Inflation Shift</span>
              <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400 mt-0.5">
                {sim.inflation_delta_bps >= 0 ? `+${sim.inflation_delta_bps}` : `${sim.inflation_delta_bps}`} bps
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const dataObj = { official_cpi: sim.official_cpi_headline, augmented_cpi: sim.augmented_cpi_headline, inflation_delta_bps: sim.inflation_delta_bps };
              const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `MoSPI_Simulation_${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }}
            className="w-full py-2 rounded text-xs font-medium bg-[#0c2340] dark:bg-[#0284c7] hover:bg-[#1a365d] text-white flex items-center justify-center space-x-1.5 transition"
          >
            <i data-lucide="download" className="h-3.5 w-3.5"></i>
            <span>Download Simulation Parameters (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 6. SCRAPER MONITOR VIEW
// -----------------------------------------------------------------------------
function ScraperMonitorView({ scraperStatus, setScrapeModalOpen }) {
  useEffect(() => {
    if (window.lucide) lucide.createIcons();
  }, []);

  const tel = scraperStatus?.telemetry || { total_sources_active: 9, total_records_today: 341840, avg_success_rate: 98.7, sources: [] };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="p-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Data Harvesting & Source Telemetry</h2>
          <p className="text-xs text-slate-500">Status of portal observation feeds and pipeline health</p>
        </div>
        <button
          onClick={() => setScrapeModalOpen(true)}
          className="px-3 py-1.5 rounded text-xs font-medium bg-[#0c2340] dark:bg-[#0284c7] hover:bg-[#1a365d] text-white transition"
        >
          Run Scrape Now
        </button>
      </div>

      <div className="p-3 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center space-x-2">
        <i data-lucide="alert-circle" className="h-4 w-4 flex-shrink-0 text-amber-700 dark:text-amber-400"></i>
        <span><strong>Sample Data Notice:</strong> Demonstration telemetry in staging environment. Live airline portal scraping pipeline in active development.</span>
      </div>

      <div className="p-4 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Portal Connectors</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2 px-3">Portal</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Success Rate</th>
                <th className="py-2 px-3">Records Harvested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {tel.sources.map((s, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{s.portal}</td>
                  <td className="py-2 px-3 text-slate-500">{s.type}</td>
                  <td className="py-2 px-3 text-emerald-700 dark:text-emerald-400 font-semibold">{s.status}</td>
                  <td className="py-2 px-3 font-mono">{s.success_rate}%</td>
                  <td className="py-2 px-3 font-mono font-semibold">{formatNum(s.records_today)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 7. API EXPLORER VIEW COMPONENT
// -----------------------------------------------------------------------------
function APIExplorerView() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/index?range_days=30');
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  useEffect(() => {
    if (window.lucide) lucide.createIcons();
    executeTest(selectedEndpoint);
  }, []);

  const endpointsList = [
    { name: "AirIndex Time Series (30 Days)", path: "/api/index?range_days=30", method: "GET" },
    { name: "32 DGCA Domestic Routes Matrix", path: "/api/routes", method: "GET" },
    { name: "Airlines & OTA Convenience Fees", path: "/api/airlines", method: "GET" },
    { name: "ML Fare Prediction (DEL-BOM, 3 Days)", path: "/api/ml/predict-fare?route_code=DEL-BOM&days=3&carrier=6E", method: "GET" },
    { name: "30-Day Forward Price Forecast", path: "/api/ml/forecast-30d", method: "GET" },
    { name: "ATF Jet Fuel Elasticity (+15%)", path: "/api/copilot/atf-simulator?change_pct=15", method: "GET" },
    { name: "UDAN / RCS Price Cap Compliance", path: "/api/copilot/udan-rcs", method: "GET" },
    { name: "Cartelization & HHI Market Concentration", path: "/api/copilot/cartel-hhi", method: "GET" },
    { name: "Scraper Telemetry & Workers", path: "/api/scraper-status", method: "GET" }
  ];

  async function executeTest(path) {
    setSelectedEndpoint(path);
    setIsLoadingApi(true);
    try {
      const res = await fetch(path);
      const data = await res.json();
      setApiResponse(data);
    } catch (e) {
      setApiResponse({ error: "Failed to fetch from API", details: String(e) });
    }
    setIsLoadingApi(false);
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl mx-auto">
      <div className="p-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          <i data-lucide="code" className="h-3.5 w-3.5 text-[#0284c7]"></i>
          <span>MoSPI National Open Data API</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">REST API Explorer & Developer Sandbox</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
          OpenAPI endpoint query interface for the Reserve Bank of India (RBI), NITI Aayog, and statistical research institutions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Endpoints Sidebar */}
        <div className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2 px-1">Available Endpoints</span>
          {endpointsList.map((ep, idx) => (
            <button
              key={idx}
              onClick={() => executeTest(ep.path)}
              className={`w-full text-left p-2 rounded text-xs transition flex items-center justify-between ${
                selectedEndpoint === ep.path
                  ? 'bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-semibold text-slate-900 dark:text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="truncate mr-2">
                <span className="block truncate">{ep.name}</span>
                <span className="text-[10px] font-mono text-slate-400 truncate">{ep.path}</span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200">
                {ep.method}
              </span>
            </button>
          ))}
        </div>

        {/* Live Response Panel (Spans 2 cols) */}
        <div className="md:col-span-2 p-4 rounded bg-slate-950 border border-slate-800 text-white flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-emerald-400">GET</span>
              <span className="text-xs font-mono text-slate-300 truncate max-w-sm">{selectedEndpoint}</span>
            </div>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">
              HTTP 200 OK
            </span>
          </div>

          <div className="flex-1 bg-slate-900 rounded p-3 font-mono text-xs text-sky-300 max-h-96 overflow-y-auto border border-slate-800">
            {isLoadingApi ? (
              <div className="flex items-center space-x-2 text-slate-400">
                <div className="w-3 h-3 border-2 border-[#0284c7] border-t-transparent rounded-full animate-spin"></div>
                <span>Fetching endpoint JSON payload...</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap">{JSON.stringify(apiResponse, null, 2)}</pre>
            )}
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Format: application/json (UTF-8)</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2));
                alert("JSON copied to clipboard!");
              }}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium text-xs"
            >
              Copy JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
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

  const fallbackRoutes = useMemo(() => {
    const s = getDataService();
    return s?.generateClientSideRoutes ? s.generateClientSideRoutes().routes : [];
  }, []);

  const routes = useMemo(() => {
    if (routesData?.routes && routesData.routes.length > 0) return routesData.routes;
    if (fallbackRoutes && fallbackRoutes.length > 0) return fallbackRoutes;
    return [
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
  }, [routesData, fallbackRoutes]);

  // Distinct origin & destination lists
  const origins = useMemo(() => {
    return Array.from(new Set(routes.map(r => r.origin_city).filter(Boolean))).sort();
  }, [routes]);

  const destinations = useMemo(() => {
    const filteredByOrigin = originFilter === 'ALL' ? routes : routes.filter(r => r.origin_city === originFilter);
    return Array.from(new Set(filteredByOrigin.map(r => r.dest_city).filter(Boolean))).sort();
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

  const adjustedAvg = Math.round((currentRoute.avg_fare_current || 5919) * cabinMultiplier);
  const adjustedMin = Math.round((currentRoute.min_fare || 3847) * cabinMultiplier);
  const adjustedMax = Math.round((currentRoute.max_fare || 10950) * cabinMultiplier);
  const fareSpread = adjustedMax - adjustedMin;
  const spreadMultiplier = (adjustedMax / Math.max(1, adjustedMin)).toFixed(1);
  const farePerKm = (adjustedAvg / Math.max(1, currentRoute.distance_km || 1148)).toFixed(2);

  const normalizeCategory = (cat) => {
    if (!cat) return 'MEGA_METRO';
    const c = String(cat).toUpperCase().replace(/[^A-Z0-9]/g, '_');
    if (c.includes('MEGA') || (c.includes('METRO') && !c.includes('TIER'))) return 'MEGA_METRO';
    if (c.includes('TIER') || c.includes('TECH') || c.includes('PRIMARY')) return 'METRO_TIER2';
    if (c.includes('UDAN') || c.includes('REGIONAL')) return 'REGIONAL_UDAN';
    if (c.includes('TOUR') || c.includes('LEISURE')) return 'TOURIST_LEISURE';
    return 'MEGA_METRO';
  };

  // Filtered Corridors Table List
  const filteredRoutes = useMemo(() => {
    return routes.filter(r => {
      if (originFilter !== 'ALL' && r.origin_city !== originFilter) return false;
      if (destFilter !== 'ALL' && r.dest_city !== destFilter) return false;
      if (categoryFilter !== 'ALL' && normalizeCategory(r.category) !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = (r.route_code || '').toLowerCase().includes(q);
        const matchOrigin = (r.origin_city || '').toLowerCase().includes(q);
        const matchDest = (r.dest_city || '').toLowerCase().includes(q);
        if (!matchCode && !matchOrigin && !matchDest) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'dgca_desc') return (b.dgca_weight_pct || 0) - (a.dgca_weight_pct || 0);
      if (sortBy === 'fare_asc') return (a.avg_fare_current || 0) - (b.avg_fare_current || 0);
      if (sortBy === 'fare_desc') return (b.avg_fare_current || 0) - (a.avg_fare_current || 0);
      if (sortBy === 'change_desc') return (b.pct_change_7d || 0) - (a.pct_change_7d || 0);
      if (sortBy === 'distance_asc') return (a.distance_km || 0) - (b.distance_km || 0);
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
    { code: 'DEL-GOI', label: 'DEL ⇄ GOA' },
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
    link.setAttribute('download', 'airindex_data.csv');
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

// -----------------------------------------------------------------------------
// 9. METHODOLOGY & PROJECT CONTEXT
// -----------------------------------------------------------------------------
function AboutView() {
  useEffect(() => {
    if (window.lucide) lucide.createIcons();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="p-6 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white space-y-4">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 text-xs font-semibold">
          <i data-lucide="award" className="h-3.5 w-3.5 text-[#0284c7]"></i>
          <span>Ministry of Statistics & Programme Implementation (MoSPI) • SIH Reference Project</span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            AirIndex: Development of a Real-time Airfare Price Index for India
          </h1>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
            Automated Web Scraping of Airline and OTA Portals for Augmentation of the Consumer Price Index (CPI)
          </p>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <h2 className="font-bold text-slate-900 dark:text-white text-sm">Background & Problem Statement</h2>
          <p>
            Under the current Consumer Price Index (CPI-Combined, Base 2012=100) framework administered by the National Statistical Office (NSO), airfare data is collected through conventional periodic quotations with a weight of 0.14%. As civil aviation in India expanded past 180 million annual domestic passengers, dynamic ticket yield algorithms cause airfare fluctuations that are not captured in monthly surveys.
          </p>
          <p>
            This system establishes a continuous econometric pipeline that scrapes structured price quotes across scheduled Indian carriers (IndiGo, Air India Group, Akasa Air, SpiceJet) and Online Travel Aggregators (OTAs), computing elementary indices via Jevons geometric mean and higher-level indices via Laspeyres aggregation weighted by DGCA route passenger loads.
          </p>
        </div>
      </div>
    </div>
  );
}

// Mount React App
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
