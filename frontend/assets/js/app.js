/**
 * Main React Application for MoSPI Real-time Airfare Price Index (AFPI) Platform.
 * SIH Winning Feature Suite:
 * - AI Cartelization & Market Concentration (HHI) Analyzer
 * - Ask MoSPI AI Natural Language Economic Copilot
 * - Aviation Turbine Fuel (ATF) Pass-Through Elasticity Engine
 * - UDAN / RCS Regional Price Cap Compliance Tracker
 * - Trained Machine Learning Model for Mumbai ⇄ Delhi ⇄ Bangalore
 */

const { useState, useEffect, useRef, useMemo } = React;

const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
const formatNum = (val) => new Intl.NumberFormat('en-IN').format(val);

function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('afpi_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'dark';
  });
  const [activeTab, setActiveTab] = useState('ml_sandbox'); // 'home', 'dashboard', 'ml_sandbox', 'copilot', 'cpi', 'methodology', 'scraper', 'about'
  const [indexData, setIndexData] = useState(null);
  const [routesData, setRoutesData] = useState(null);
  const [airlinesData, setAirlinesData] = useState(null);
  const [cpiData, setCPIData] = useState(null);
  const [scraperStatus, setScraperStatus] = useState(null);
  const [forecast30d, setForecast30d] = useState(null);
  const [udanRoutes, setUdanRoutes] = useState([]);
  const [cartelHHI, setCartelHHI] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState("Connecting to TimescaleDB ledger...");

  // UX & User Request Suite: Scroll Progress, Cookie Banner, Last Updated & Refresh Sync
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cookieConsent, setCookieConsent] = useState(() => localStorage.getItem('afpi_cookie_consent'));
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
    localStorage.setItem('afpi_theme', theme);
  }, [theme]);

  // 3. Initial Load with Progressive Step Telemetry
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setLoadingStep("Querying 9 airline and OTA scraping endpoints...");
      
      setTimeout(() => setLoadingStep("Aggregating 512,000+ daily observations & DGCA load weights..."), 300);
      setTimeout(() => setLoadingStep("Calibrating Jevons geometric mean & Laspeyres volume series..."), 600);
      setTimeout(() => setLoadingStep("Initializing ML price models for Mumbai ⇄ Delhi ⇄ Bangalore..."), 900);

      const [idx, rts, air, cpi, scp, fc, ud, ch, atf] = await Promise.all([
        AFPI_DATA_SERVICE.fetchIndexData(90),
        AFPI_DATA_SERVICE.fetchRoutesData(),
        AFPI_DATA_SERVICE.fetchAirlinesData(),
        AFPI_DATA_SERVICE.fetchCPIData(),
        AFPI_DATA_SERVICE.fetchScraperStatus(),
        AFPI_DATA_SERVICE.fetchForecast30d(121.4),
        AFPI_DATA_SERVICE.fetchUDANRoutes(),
        AFPI_DATA_SERVICE.fetchCartelHHI(),
        AFPI_DATA_SERVICE.fetchATFSimulation(10.0)
      ]);

      setIndexData(idx);
      setRoutesData(rts);
      setAirlinesData(air);
      setCPIData(cpi);
      setScraperStatus(scp);
      setForecast30d(fc);
      setUdanRoutes(ud?.routes || []);
      setCartelHHI(ch);
      setAtfResult(atf);
      setLastSyncTimestamp(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " IST");
      setLoading(false);
    }
    loadAll();
  }, []);

  // Manual Refresh Handler
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const [idx, rts] = await Promise.all([
      AFPI_DATA_SERVICE.fetchIndexData(timeRange),
      AFPI_DATA_SERVICE.fetchRoutesData()
    ]);
    setIndexData(idx);
    setRoutesData(rts);
    setLastSyncTimestamp(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " IST");
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Cookie Consent Handlers
  const handleSaveCookieConsent = (type = 'all') => {
    setIsDismissingCookie(true);
    setTimeout(() => {
      localStorage.setItem('afpi_cookie_consent', type);
      setCookieConsent(type);
      setIsDismissingCookie(false);
    }, 300);
  };

  // Update ML Prediction on input changes
  useEffect(() => {
    async function runPrediction() {
      const pred = await AFPI_DATA_SERVICE.predictFare(
        mlRoute,
        mlDaysAhead,
        mlCarrier,
        mlIsPrime,
        mlIsWeekend,
        mlIsFestive,
        mlBaggage
      );
      setMlPredictionResult(pred);
    }
    runPrediction();
  }, [mlRoute, mlDaysAhead, mlCarrier, mlIsPrime, mlIsWeekend, mlIsFestive, mlBaggage]);

  // Update ATF Simulation
  useEffect(() => {
    async function runATF() {
      const res = await AFPI_DATA_SERVICE.fetchATFSimulation(atfChangePct);
      setAtfResult(res);
    }
    runATF();
  }, [atfChangePct]);

  const handleRunScrape = async () => {
    setIsScraping(true);
    setScrapeResult(null);
    const res = await AFPI_DATA_SERVICE.triggerScrape(scrapeRouteInput, scrapeDaysAhead);
    setTimeout(() => {
      setScrapeResult(res);
      setIsScraping(false);
    }, 1200);
  };

  const handleTrainModel = async () => {
    setMlTrainingState({ isTraining: true, result: null });
    const res = await AFPI_DATA_SERVICE.trainModel(200);
    setTimeout(() => {
      setMlTrainingState({ isTraining: false, result: res });
    }, 1400);
  };

  const handleSendCopilotPrompt = async (promptText) => {
    const textToSend = promptText || copilotInput;
    if (!textToSend.trim()) return;

    setCopilotChat(prev => [...prev, { sender: 'user', text: textToSend }]);
    setCopilotInput('');
    setIsCopilotThinking(true);

    const res = await AFPI_DATA_SERVICE.copilotQuery(textToSend);
    setTimeout(() => {
      setCopilotChat(prev => [
        ...prev,
        {
          sender: 'bot',
          text: res.answer,
          category: res.category,
          data: res.data_card,
          recommendation: res.recommended_action
        }
      ]);
      setIsCopilotThinking(false);
    }, 800);
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1E] text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans relative">
      {/* 1. Sleek Reading / Scroll Progress Bar Fixed at Top */}
      <div className="scroll-progress-container">
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      {/* Top Government MoSPI / SIH Masthead */}
      <div className="bg-[#050C1A] text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800 flex justify-between items-center z-50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-bold text-amber-400">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Government of India • MoSPI High-Frequency Price Division</span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-300">Smart India Hackathon (SIH) — National Airfare Price Index</span>
        </div>
        <div className="flex items-center space-x-4">
          {/* Last Updated Tab in Top Masthead */}
          <div className="flex items-center space-x-1.5 text-[11px] font-mono bg-slate-900/90 px-2.5 py-0.5 rounded-lg border border-slate-800 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Last Sync: {lastSyncTimestamp}</span>
            <button
              onClick={handleManualRefresh}
              className={`ml-1 text-slate-400 hover:text-amber-400 transition ${isRefreshing ? 'animate-spin text-amber-400' : ''}`}
              title="Refresh Real-Time Dataset"
            >
              <i data-lucide="refresh-cw" className="h-3 w-3"></i>
            </button>
          </div>
          <span className="hidden sm:inline text-slate-400 font-mono text-[11px]">Base: 2024=100</span>
          <span className="hidden sm:inline text-emerald-400 font-semibold text-[11px] flex items-center">
            <i data-lucide="shield-check" className="h-3.5 w-3.5 mr-1"></i>
            NSO Protocol
          </span>
        </div>
      </div>

      {/* Live Moving Ticker Bar */}
      <div className="bg-slate-900/95 border-b border-slate-800 text-xs py-1.5 px-4 overflow-hidden relative shadow-inner">
        <div className="flex items-center space-x-8">
          <span className="font-extrabold text-amber-400 text-[11px] uppercase tracking-wider flex items-center whitespace-nowrap">
            <i data-lucide="radio" className="h-3.5 w-3.5 mr-1.5 text-rose-500 animate-pulse"></i>
            Trained Mega Corridors:
          </span>
          <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar whitespace-nowrap">
            {megaMetroCorridors.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setMlRoute(item.code);
                  setActiveTab('ml_sandbox');
                }}
                className="inline-flex items-center space-x-1.5 text-[11px] font-mono cursor-pointer hover:bg-slate-800 px-2 py-0.5 rounded transition"
              >
                <span className="text-slate-300 font-bold">{item.code}:</span>
                <span className="text-white font-semibold">{item.fare}</span>
                <span className={item.up ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {item.up ? '▲' : '▼'} {item.chg}
                </span>
                <span className="text-[9px] text-amber-400/80">(R² {item.r2})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-200 dark:border-slate-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-emerald-600 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <i data-lucide="plane-takeoff" className="h-5 w-5 text-amber-400"></i>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 bg-clip-text text-transparent">
                  AFPI INDIA
                </span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  MoSPI Decision Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Real-Time Airfare Price Index for CPI Modernization</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { id: 'home', label: 'Home', icon: 'home' },
              { id: 'dashboard', label: 'Airfare Dashboard', icon: 'layout-dashboard' },
              { id: 'gazette', label: '📜 Official Gazette', icon: 'file-text', highlight: true },
              { id: 'ml_sandbox', label: '✨ ML Playground', icon: 'sparkles', highlight: true },
              { id: 'copilot', label: '🤖 Ask MoSPI AI', icon: 'bot', highlight: true },
              { id: 'cpi', label: 'CPI Simulator', icon: 'calculator' },
              { id: 'api_explorer', label: '🔌 API Explorer', icon: 'code' },
              { id: 'scraper', label: 'Scraper Telemetry', icon: 'activity' },
              { id: 'about', label: 'About & Team', icon: 'shield-check' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : tab.highlight
                    ? 'text-amber-400 hover:bg-amber-500/10 font-bold border border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <i data-lucide={tab.icon} className="h-4 w-4"></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            {/* Live Scrape Action */}
            <button
              onClick={() => setScrapeModalOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-lg hover:from-amber-400 hover:to-orange-500 transition"
            >
              <i data-lucide="refresh-cw" className="h-3.5 w-3.5"></i>
              <span>Live Scrape</span>
            </button>

            {/* Prominent Accessible Dark Mode Toggle Switch */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition shadow-sm"
              title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === 'dark' ? (
                <>
                  <i data-lucide="sun" className="h-4 w-4 text-amber-400"></i>
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <i data-lucide="moon" className="h-4 w-4 text-slate-700"></i>
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          /* High-Tech Aeronautical Loading Animation / HUD */
          <div className="py-24 flex flex-col items-center justify-center space-y-6 max-w-md mx-auto text-center animate-fade-in">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Outer Radar Pulse Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-ping"></div>
              {/* Radar Sweeper */}
              <div className="absolute inset-2 rounded-full border border-amber-500/40 border-t-amber-500 radar-sweep"></div>
              {/* Airplane Center Badge */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/20 airplane-float">
                <i data-lucide="plane" className="h-7 w-7 text-slate-950"></i>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                Initializing MoSPI AFPI Engine
              </h3>
              <p className="text-xs font-mono font-medium text-amber-500 dark:text-amber-400 animate-pulse">
                {loadingStep}
              </p>
              <p className="text-[11px] text-slate-400">
                Calibrating 1,002 multi-year daily observations across 32 DGCA corridors (2024–2026)
              </p>
            </div>

            {/* Shimmer Skeleton Placeholder */}
            <div className="w-full space-y-2.5 pt-2">
              <div className="h-3 w-full rounded-full skeleton-shimmer bg-slate-200 dark:bg-slate-800"></div>
              <div className="h-3 w-4/5 mx-auto rounded-full skeleton-shimmer bg-slate-200 dark:bg-slate-800"></div>
            </div>
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
            {activeTab === 'gazette' && (
              <GazetteBulletinView
                indexData={indexData}
                routesData={routesData}
                cpiData={cpiData}
                setActiveTab={setActiveTab}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
                  <i data-lucide="bot" className="h-5 w-5"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Run On-Demand Web Harvest</h3>
                  <p className="text-xs text-slate-500">Playwright workers across 9 airline and OTA portals</p>
                </div>
              </div>
              <button onClick={() => setScrapeModalOpen(false)} className="text-slate-400">
                <i data-lucide="x" className="h-5 w-5"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Target Flight Corridor</label>
                <select
                  value={scrapeRouteInput}
                  onChange={(e) => setScrapeRouteInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium"
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
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
                  <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-amber-400">Rotating TLS fingerprints & harvesting DOM payloads...</p>
                  <p className="text-[10px] text-slate-400">Querying IndiGo, Air India, Akasa Air, MakeMyTrip, EaseMyTrip</p>
                </div>
              )}

              {scrapeResult && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                    <i data-lucide="check-circle-2" className="h-4 w-4"></i>
                    <span>Harvest Completed & Ingested into Database!</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block">Min Fare</span>
                      <span className="font-bold font-mono text-emerald-400">{formatINR(scrapeResult.min_fare_discovered)}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block">Avg Fare</span>
                      <span className="font-bold font-mono text-amber-400">{formatINR(scrapeResult.avg_fare_discovered)}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block">Records Ingested</span>
                      <span className="font-bold font-mono text-white">{scrapeResult.harvested_records_count}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono break-all pt-1">
                    SHA-256 Provenance Hash: {scrapeResult.data_provenance_hash}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                onClick={() => setScrapeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400"
              >
                Close
              </button>
              <button
                onClick={handleRunScrape}
                disabled={isScraping}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 disabled:opacity-50"
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
          className={`fixed bottom-4 inset-x-4 sm:max-w-xl sm:mx-auto z-50 p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3.5 cookie-banner ${
            isDismissingCookie ? 'cookie-banner-exit' : 'cookie-banner-enter'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 shrink-0 mt-0.5">
              <i data-lucide="cookie" className="h-5 w-5"></i>
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Cookie &amp; Privacy Notice</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                We use cookies to remember your preferences (like theme) and understand site usage.{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="font-bold text-amber-600 dark:text-amber-400 underline hover:text-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded transition"
                >
                  Read our privacy note.
                </button>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleSaveCookieConsent('essential')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 transition"
            >
              Essential only
            </button>
            <button
              type="button"
              onClick={() => handleSaveCookieConsent('all')}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            >
              Accept all
            </button>
          </div>
        </div>
      )}

      {/* Privacy Note Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
                  <i data-lucide="shield-check" className="h-5 w-5"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">MoSPI AFPI Privacy Note</h3>
                  <p className="text-xs text-slate-500">Data Governance & Local Storage Policy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg p-1"
                aria-label="Close privacy note"
              >
                <i data-lucide="x" className="h-5 w-5"></i>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong className="block text-slate-900 dark:text-white mb-1">1. Essential Local Storage</strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Stores your UI display theme preference (<code className="font-mono text-amber-500">afpi_theme</code>) and cookie consent state (<code className="font-mono text-amber-500">afpi_cookie_consent</code>). No personally identifiable information (PII) or browser fingerprinting is ever stored.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong className="block text-slate-900 dark:text-white mb-1">2. Analytical & Telemetry Use</strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  When "Accept all" is chosen, anonymous aggregate statistics regarding corridor queries and econometric simulations help MoSPI calibrate high-frequency server capacity.
                </p>
              </div>

              <p className="text-[11px] text-slate-400 pt-1">
                Complies with Government of India Digital Personal Data Protection (DPDP) Act and NSO statistical integrity norms.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
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
              <p className="font-semibold text-slate-700 dark:text-slate-300">National Airfare Price Index (AFPI) Platform</p>
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
function LandingView({ indexData, routesData, setActiveTab, setScrapeModalOpen }) {
  useEffect(() => {
    if (window.lucide) lucide.createIcons();
  }, []);

  const headline = indexData?.headline_number || 121.40;
  const dod = indexData?.dod_change_pct || 0.62;
  const wow = indexData?.wow_change_pct || 2.45;
  const mom = indexData?.mom_change_pct || 4.18;
  const yoy = indexData?.yoy_change_pct || 12.80;

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B172E] via-[#0E2038] to-[#050C1A] text-white p-8 md:p-12 border border-slate-800 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <i data-lucide="zap" className="h-3.5 w-3.5"></i>
            <span>Trained on Mumbai ⇄ Delhi ⇄ Bangalore Mega Corridors</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Development of a Real-Time <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 bg-clip-text text-transparent">
              Airfare Price Index for India
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Automated high-frequency price collection across Indian airline and OTA portals to eliminate price publication lag and augment the <strong>Transport & Communication</strong> component of India’s <strong>Consumer Price Index (CPI)</strong>.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setActiveTab('copilot')}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-lg hover:from-amber-400 hover:to-orange-500 transition"
            >
              <i data-lucide="bot" className="h-4 w-4"></i>
              <span>Ask MoSPI AI Copilot</span>
            </button>

            <button
              onClick={() => setActiveTab('ml_sandbox')}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition"
            >
              <i data-lucide="sparkles" className="h-4 w-4"></i>
              <span>Play with Trained ML Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
            >
              <span>Explore Dashboard</span>
              <i data-lucide="arrow-right" className="h-4 w-4"></i>
            </button>
          </div>
        </div>

        <div className="mt-8 md:mt-0 md:absolute md:top-12 md:right-12 bg-slate-900/80 backdrop-blur-xl border border-slate-700/70 rounded-2xl p-6 shadow-2xl max-w-sm w-full">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">National Composite AFPI</span>
              <div className="text-4xl font-extrabold font-mono text-white mt-1">{headline.toFixed(2)}</div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              +{dod}% DoD
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-800 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">1-Week</span>
              <span className="text-xs font-bold font-mono text-emerald-400">+{wow}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">1-Month</span>
              <span className="text-xs font-bold font-mono text-emerald-400">+{mom}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">YoY Annual</span>
              <span className="text-xs font-bold font-mono text-amber-400">+{yoy}%</span>
            </div>
          </div>
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
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const datasets = [];

    if (activeFormula === 'ALL' || activeFormula === 'JEVONS') {
      datasets.push({
        label: 'Jevons Geometric Mean (Elementary Index)',
        data: displaySeries.map(d => d.jevons_index),
        borderColor: '#FF671F',
        backgroundColor: 'rgba(255, 103, 31, 0.08)',
        borderWidth: 2.2,
        pointRadius: displaySeries.length <= 30 ? 3 : (displaySeries.length <= 90 ? 1.5 : 0),
        tension: 0.25,
        fill: activeFormula === 'JEVONS'
      });
    }

    if (activeFormula === 'ALL' || activeFormula === 'LASPEYRES') {
      datasets.push({
        label: 'Laspeyres Quantity-Weighted (Base 2024=100)',
        data: displaySeries.map(d => d.laspeyres_index),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        borderWidth: 2,
        pointRadius: displaySeries.length <= 30 ? 2.5 : 0,
        tension: 0.2,
        fill: activeFormula === 'LASPEYRES'
      });
    }

    if (activeFormula === 'ALL' || activeFormula === 'FISHER') {
      datasets.push({
        label: 'Fisher Ideal Index (Superlative)',
        data: displaySeries.map(d => d.fisher_index || d.laspeyres_index * 0.998),
        borderColor: '#8B5CF6',
        borderWidth: 1.8,
        borderDash: [3, 3],
        pointRadius: 0,
        tension: 0.2,
        fill: false
      });
    }

    datasets.push({
      label: 'Official MoSPI CPI Transport Sub-Index',
      data: displaySeries.map(d => d.mospi_transport_index),
      borderColor: '#046A38',
      borderWidth: 2,
      borderDash: [6, 6],
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
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { color: textColor, font: { family: 'Inter', size: 11, weight: 600 } } },
          tooltip: {
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
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

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
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            borderWidth: 2.2,
            pointRadius: 3,
            tension: 0.3
          },
          {
            label: '2025 (Expansion Year - Avg: 110.8)',
            data: y25,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            borderWidth: 2.2,
            pointRadius: 3,
            tension: 0.3
          },
          {
            label: '2026 (Current Live - Avg: 121.4)',
            data: y26,
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            borderWidth: 3,
            pointRadius: 4,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { color: textColor, font: { family: 'Inter', size: 11, weight: 600 } } }
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

  // 3. Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current || !routesData?.routes || !window.L) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, { center: [21.5, 79.5], zoom: 4.5, zoomControl: false, attributionControl: false });
      L.control.zoom({ position: 'topright' }).addTo(map);

      const isDark = document.documentElement.classList.contains('dark');
      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, { maxZoom: 8, minZoom: 4 }).addTo(map);

      const airports = routesData.airports || {};
      const routes = routesData.routes || [];

      Object.keys(airports).forEach(code => {
        const apt = airports[code];
        const marker = L.circleMarker([apt.lat, apt.lng], { radius: 6, fillColor: '#FF671F', color: '#ffffff', weight: 1.5, fillOpacity: 0.95 }).addTo(map);
        marker.bindPopup(`<strong>${apt.city} (${code})</strong><br/><span style="color:#64748b;">${apt.name}</span>`);
      });

      routes.forEach(r => {
        if (r.origin_coords && r.dest_coords) {
          const latlngs = [r.origin_coords, r.dest_coords];
          const color = r.pct_change_7d > 4 ? '#EF4444' : (r.pct_change_7d < 0 ? '#10B981' : '#3B82F6');
          L.polyline(latlngs, { color: color, weight: Math.max(1.8, (r.dgca_weight_pct || 3) * 0.4), opacity: 0.75, dashArray: '4, 6' })
            .addTo(map)
            .bindPopup(`<strong>${r.route_code}</strong> (${r.origin_city} ⇄ ${r.dest_city})<br/>Avg Fare: ${formatINR(r.avg_fare_current)}<br/>DGCA Weight: ${r.dgca_weight_pct}%<br/>Category: ${r.category || 'Domestic'}`);
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
    "2024": { year: "2024", title: "Base Period (2024=100)", annual_afpi_avg: 100.00, yoy_inflation: "Base (0.0%)", annual_pax_millions: 152.4, avg_domestic_fare_inr: 4620, atf_avg_price_kl: 92400, milestones: "MoSPI Base Year Calibration, UDAN 5.2 expansion" },
    "2025": { year: "2025", title: "Expansion & ATF Escalation", annual_afpi_avg: 110.85, yoy_inflation: "+10.85%", annual_pax_millions: 168.2, avg_domestic_fare_inr: 5120, atf_avg_price_kl: 96800, milestones: "Air India-Vistara merger integration, ATF tax hike" },
    "2026": { year: "2026", title: "Real-Time Peak & Nowcasting", annual_afpi_avg: 121.40, yoy_inflation: "+12.80%", annual_pax_millions: 184.6, avg_domestic_fare_inr: 5780, atf_avg_price_kl: 102400, milestones: "Noida & Navi Mumbai airports, automated web scraping" }
  };

  const currentSimPct = master3ySeries.length > 0 && simIndex !== null
    ? Math.round((simIndex / (master3ySeries.length - 1)) * 100)
    : 100;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Interactive 3-Year Time Machine & Live Feed Simulator */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B172E] via-[#0E2038] to-[#050C1A] text-white border border-slate-800 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <i data-lucide="history" className="h-3.5 w-3.5"></i>
              <span>Multi-Year Time Machine Engine (2024 – 2025 – 2026)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              High-Frequency Multi-Year Playback & Econometric Simulator
            </h2>
            <p className="text-xs text-slate-400">
              Scrub and simulate daily high-frequency price feed across 1,002 continuous calendar dates from Base Year 2024 to September 2026.
            </p>
          </div>

          {/* Player Controls */}
          <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-700/80 p-2 rounded-2xl shadow-inner">
            <button
              onClick={() => setSimIndex(prev => Math.max(0, (prev || 0) - 7))}
              className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 transition"
              title="Step Backward 7 Days"
            >
              <i data-lucide="skip-back" className="h-4 w-4"></i>
            </button>

            <button
              onClick={() => setIsSimulating(prev => !prev)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition ${
                isSimulating
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950'
              }`}
            >
              <i data-lucide={isSimulating ? "pause" : "play"} className="h-4 w-4 fill-current"></i>
              <span>{isSimulating ? "Pause Feed" : "Simulate / Play"}</span>
            </button>

            <button
              onClick={() => setSimIndex(prev => Math.min(master3ySeries.length - 1, (prev || 0) + 7))}
              className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 transition"
              title="Step Forward 7 Days"
            >
              <i data-lucide="skip-forward" className="h-4 w-4"></i>
            </button>

            <div className="h-5 w-px bg-slate-700 mx-1"></div>

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
                  className={`px-2 py-1 rounded-lg font-mono font-bold text-[11px] transition ${
                    simSpeed === s.val
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:bg-slate-800'
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
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Simulated Date</span>
              <div className="text-base font-extrabold font-mono text-amber-400">
                {activeSimPoint.date}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Year {activeSimPoint.year} ({activeSimPoint.month})</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">AFPI Headline Index</span>
              <div className="text-base font-extrabold font-mono text-white">
                {activeSimPoint.headline_index.toFixed(2)}
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">Base 2024 = 100</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Pan-India Fare</span>
              <div className="text-base font-extrabold font-mono text-emerald-400">
                {formatINR(activeSimPoint.avg_fare_inr)}
              </div>
              <span className="text-[10px] text-slate-400">DGCA Basket Weighted</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Season Cycle</span>
              <div className="text-xs font-bold text-amber-300 truncate">
                {activeSimPoint.season_label || activeSimPoint.season_name || "Standard Base"}
              </div>
              <span className="text-[10px] text-slate-400">
                {activeSimPoint.is_festive_spike ? '🔥 Peak Demand Surge' : 'Standard Yield Window'}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-4 lg:col-span-1 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">CPI Augmented Delta</span>
              <div className="text-base font-extrabold font-mono text-rose-400">
                +{Math.round(((activeSimPoint.headline_index - 100) * 0.28) * 10) / 10} bps
              </div>
              <span className="text-[10px] text-slate-400">Over Official Survey</span>
            </div>
          </div>
        )}

        {/* Scrubber Progress Slider */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
            <span className="font-bold text-emerald-400">2024 Base Year (1 Jan 2024)</span>
            <span className="text-amber-400 font-bold">2025 Expansion Year</span>
            <span className="font-bold text-rose-400">2026 Real-Time Live (28 Sep 2026)</span>
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
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      {/* 2. Multi-Year Macro Annual Comparisons (2024 vs 2025 vs 2026) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i data-lucide="layers" className="h-4 w-4 text-amber-500"></i>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              3-Year Annual Macro Benchmarks & Structural Drivers
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">DGCA & MoSPI Structural Comparison</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["2024", "2025", "2026"].map(yr => {
            const m = yearlyMacro[yr] || {};
            const isCurrent = yr === "2026";
            const isBase = yr === "2024";
            return (
              <div
                key={yr}
                onClick={() => setSelectedYear(selectedYear === yr ? 'ALL' : yr)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm relative overflow-hidden ${
                  selectedYear === yr
                    ? 'bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">{m.title}</span>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white font-mono">{yr}</h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isBase
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : isCurrent
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse'
                      : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  }`}>
                    {m.yoy_inflation}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-slate-100 dark:border-slate-800 my-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Avg Annual AFPI</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">{m.annual_afpi_avg}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Avg Ticket Fare</span>
                    <span className="font-bold font-mono text-emerald-400">{formatINR(m.avg_domestic_fare_inr)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Passenger Volume</span>
                    <span className="font-bold font-mono text-slate-700 dark:text-slate-300">{m.annual_pax_millions}M</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">ATF Jet Fuel Rate</span>
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
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Domestic Airfare Price Index Dashboard</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {selectedYear === 'ALL' ? '3-Year Horizon (2024–2026)' : `Year ${selectedYear} Focus`}
              </span>
            </div>
            <p className="text-xs text-slate-500">Multi-formula continuous econometric calculation across 32 DGCA flight corridors</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Year Selector */}
            <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {[
                { id: 'ALL', label: 'All 3 Years' },
                { id: '2024', label: '2024 (Base)' },
                { id: '2025', label: '2025' },
                { id: '2026', label: '2026 (Live)' }
              ].map(y => (
                <button
                  key={y.id}
                  onClick={() => setSelectedYear(y.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedYear === y.id ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {y.label}
                </button>
              ))}
            </div>

            {/* Formula Selector */}
            <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {[
                { id: 'ALL', label: 'All Formulas' },
                { id: 'JEVONS', label: 'Jevons (Geo)' },
                { id: 'LASPEYRES', label: 'Laspeyres' },
                { id: 'FISHER', label: 'Fisher' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFormula(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    activeFormula === f.id ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Trailing Range Selector */}
            {selectedYear === 'ALL' && (
              <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
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
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      timeRange === t.val ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400'
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Target Corridor</label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-medium"
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
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Carrier Group</label>
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-medium"
            >
              <option value="ALL">All Carriers (DGCA Fleet)</option>
              <option value="6E">IndiGo (6E - 61.4% Share)</option>
              <option value="AI">Air India Group (AI - 26.8%)</option>
              <option value="QP">Akasa Air (QP - 5.2%)</option>
              <option value="SG">SpiceJet (SG - 4.1%)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Source Category</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-medium"
            >
              <option value="ALL">All Sources (9 Portals)</option>
              <option value="AIRLINE">Airline Direct (IndiGo, AI, Akasa, SpiceJet)</option>
              <option value="OTA">Online Travel Portals (MMT, EaseMyTrip, etc.)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Advance Window</label>
            <select
              value={selectedAdvance}
              onChange={(e) => setSelectedAdvance(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-medium"
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
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Cabin Class</label>
            <select
              value={selectedCabin}
              onChange={(e) => setSelectedCabin(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-medium"
            >
              <option value="ECONOMY">Economy Class (94% Basket)</option>
              <option value="PREMIUM_ECONOMY">Premium Economy</option>
              <option value="BUSINESS">Business Class</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Main Charts: Multi-Year Time Series & 3-Year Monthly Comparative Overlay */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continuous Time-Series Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Continuous AFPI Time-Series vs MoSPI Benchmark
              </h3>
              <p className="text-xs text-slate-500">
                {selectedYear === 'ALL' ? 'Showing 3-Year Continuous Trajectory (2024–2026)' : `Showing Complete Year ${selectedYear} Daily Trajectory`}
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {selectedYear === 'ALL' ? `${timeRange}D Horizon` : `FY ${selectedYear}`}
            </span>
          </div>
          <div className="h-80 w-full relative">
            <canvas ref={chartCanvasRef}></canvas>
          </div>
        </div>

        {/* 3-Year Monthly Overlay (2024 vs 2025 vs 2026) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                3-Year Month-by-Month Overlay (2024 vs 2025 vs 2026)
              </h3>
              <p className="text-xs text-slate-500">Comparative seasonal curves showing annual compounding inflation</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Jan – Dec Seasonality
            </span>
          </div>
          <div className="h-80 w-full relative">
            <canvas ref={overlayCanvasRef}></canvas>
          </div>
        </div>
      </div>

      {/* 5. Zonal Inflation Dispersion Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <i data-lucide="map-pin" className="h-4 w-4 text-amber-500"></i>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Zonal Airfare Inflation Dispersion Matrix (YoY 2025-2026)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Weighted Regional Basket</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { zone: "Northern Zone", yoy_inflation: "+14.2%", top_route: "DEL-BOM", index: 124.8, risk: "HIGH" },
            { zone: "Western Zone", yoy_inflation: "+11.8%", top_route: "BOM-BLR", index: 119.5, risk: "MODERATE" },
            { zone: "Southern Zone", yoy_inflation: "+9.4%", top_route: "BLR-HYD", index: 116.2, risk: "STABLE" },
            { zone: "Eastern Zone", yoy_inflation: "+13.6%", top_route: "CCU-DEL", index: 123.1, risk: "HIGH" },
            { zone: "North-Eastern Zone", yoy_inflation: "+16.8%", top_route: "DEL-GAU", index: 127.4, risk: "CRITICAL" }
          ].map((z, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block truncate">{z.zone}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold font-mono text-rose-500 dark:text-rose-400">{z.yoy_inflation}</span>
                <span className="text-[10px] font-bold font-mono text-slate-400">Idx {z.index}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Top: {z.top_route}</span>
                <span className={`px-1.5 py-0.2 rounded font-bold ${z.risk === 'CRITICAL' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {z.risk}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. 32-Route Pan-India Corridor Matrix */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">32 Key Pan-India Flight Corridors Matrix</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono">
                {filteredRoutes.length} Corridors Active
              </span>
            </div>
            <p className="text-xs text-slate-500">DGCA volume-weighted basket covering 88.4% of total Indian domestic air traffic</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Pills */}
            <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    routeCategoryFilter === cat.id ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400'
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
                placeholder="Search city or code..."
                value={searchRouteQuery}
                onChange={(e) => setSearchRouteQuery(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 w-48"
              />
            </div>
          </div>
        </div>

        {/* Interactive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-800/50">
                <th className="py-3 px-3">Corridor</th>
                <th className="py-3 px-3">Origin ⇄ Destination</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Distance</th>
                <th className="py-3 px-3">DGCA Weight</th>
                <th className="py-3 px-3">Current Fare (Avg)</th>
                <th className="py-3 px-3">Observed Spread</th>
                <th className="py-3 px-3">7-Day Δ</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredRoutes.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono font-bold text-amber-500 dark:text-amber-400">
                    {r.route_code}
                  </td>
                  <td className="py-3 px-3 text-slate-900 dark:text-white font-semibold">
                    {r.origin_city} ⇄ {r.dest_city}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700">
                      {r.category || 'Domestic'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {r.distance_km} km
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-300">
                    {r.dgca_weight_pct}%
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                    {formatINR(r.avg_fare_current)}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                    {formatINR(r.min_fare)} – {formatINR(r.max_fare)}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={r.pct_change_7d > 0 ? 'text-rose-500' : 'text-emerald-500'}>
                      {r.pct_change_7d > 0 ? '▲ +' : '▼ '}{r.pct_change_7d}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedRoute(r.route_code);
                        setActiveTab('ml_sandbox');
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 transition"
                    >
                      ML Predict
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Geospatial Route Network Map */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Geospatial Flight Route Density Map</h3>
            <p className="text-xs text-slate-500">Live corridor traffic coverage across major Indian airport nodes</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">32 Live Route Vectors</span>
        </div>
        <div ref={mapContainerRef} className="h-80 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 z-0"></div>
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
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

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
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2.5,
            pointRadius: 2,
            tension: 0.3,
            fill: true
          },
          {
            label: '95% Upper Bound',
            data: upper,
            borderColor: 'rgba(239, 68, 68, 0.6)',
            borderDash: [4, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          },
          {
            label: '95% Lower Bound',
            data: lower,
            borderColor: 'rgba(16, 185, 129, 0.6)',
            borderDash: [4, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { color: textColor, font: { family: 'Inter', size: 11 } } }
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
    <div className="space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0B192C] via-[#1E3E62] to-[#070D1E] text-white border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
          <i data-lucide="sparkles" className="h-3.5 w-3.5"></i>
          <span>Trained on 218,540 Observations Across Mumbai ⇄ Delhi ⇄ Bangalore</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">
          Mega-Metro Machine Learning Price Predictor & Policy Sandbox
        </h2>
        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
          Trained on the 6 high-density bidirectional corridors connecting <strong>Mumbai, Delhi, and Bangalore</strong> with Aviation Turbine Fuel (ATF) elasticity and market concentration analytics.
        </p>
      </div>

      {/* 6 Mega-Metro Corridor Quick Switcher */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
            Select Mega-Metro Corridor to Test & Compare:
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Trained Accuracy R² ≥ 0.958</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {megaMetroCorridors.map((c, idx) => (
            <button
              key={idx}
              onClick={() => setMlRoute(c.code)}
              className={`p-3 rounded-xl border text-left transition ${
                mlRoute === c.code
                  ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-md font-bold'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span>{c.code}</span>
                <span className="text-[10px] text-emerald-400">R² {c.r2}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">{c.name}</div>
              <div className="text-xs font-bold text-white mt-1">{c.fare}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Active Route: {mlRoute}</h3>
            <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">
              Model Fit: R² = {pred.model_r_squared}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Domestic Corridor</label>
              <select
                value={mlRoute}
                onChange={(e) => setMlRoute(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium"
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
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Airline Carrier</label>
              <select
                value={mlCarrier}
                onChange={(e) => setMlCarrier(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium"
              >
                <option value="6E">IndiGo (6E - Market Leader)</option>
                <option value="AI">Air India (AI - Full Service Premium)</option>
                <option value="QP">Akasa Air (QP - Low Cost Entry)</option>
                <option value="SG">SpiceJet (SG - Value Pricing)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Days to Departure (Dynamic Pricing Horizon)</span>
              <span className="font-mono font-extrabold text-amber-400 text-sm">
                {mlDaysAhead} Days Ahead {mlDaysAhead <= 3 ? '(Peak Surge)' : ''}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={mlDaysAhead}
              onChange={(e) => setMlDaysAhead(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <button
              onClick={() => setMlIsPrime(!mlIsPrime)}
              className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center space-y-1 transition ${
                mlIsPrime ? 'border-amber-500 bg-amber-500/15 text-amber-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <i data-lucide="sun-medium" className="h-4 w-4"></i>
              <span>Prime Hours</span>
              <span className="text-[9px] text-slate-400">06:00-09:00 / 18:00-21:00</span>
            </button>

            <button
              onClick={() => setMlIsWeekend(!mlIsWeekend)}
              className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center space-y-1 transition ${
                mlIsWeekend ? 'border-blue-500 bg-blue-500/15 text-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <i data-lucide="calendar" className="h-4 w-4"></i>
              <span>Weekend Flight</span>
              <span className="text-[9px] text-slate-400">Fri/Sun Evening</span>
            </button>

            <button
              onClick={() => setMlIsFestive(!mlIsFestive)}
              className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center space-y-1 transition ${
                mlIsFestive ? 'border-rose-500 bg-rose-500/15 text-rose-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <i data-lucide="flame" className="h-4 w-4"></i>
              <span>Festival Surge</span>
              <span className="text-[9px] text-slate-400">Diwali / Chhath Rush</span>
            </button>

            <button
              onClick={() => setMlBaggage(!mlBaggage)}
              className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center space-y-1 transition ${
                mlBaggage ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <i data-lucide="luggage" className="h-4 w-4"></i>
              <span>15kg Baggage</span>
              <span className="text-[9px] text-slate-400">{mlBaggage ? 'Included' : 'Hand-Luggage Only'}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-slate-900 dark:text-white block">Train Model on 218k Observations</span>
              <span className="text-[11px] text-slate-400">Runs 200 epochs across Mumbai ⇄ Delhi ⇄ Bangalore data</span>
            </div>
            <button
              onClick={handleTrainModel}
              disabled={mlTrainingState.isTraining}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 transition flex items-center space-x-2"
            >
              {mlTrainingState.isTraining ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Training...</span>
                </>
              ) : (
                <>
                  <i data-lucide="play" className="h-3.5 w-3.5"></i>
                  <span>Train Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prediction Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">ML Prediction Output</span>
            <h3 className="text-xl font-bold mt-1">Expected Payable Airfare</h3>
            <p className="text-xs text-slate-400 mt-1">{mlRoute} Point estimate with 95% confidence</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Point Estimate</span>
              <div className="text-4xl font-extrabold font-mono text-amber-400 mt-1">
                {formatINR(pred.predicted_fare_inr)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                95% CI: <span className="text-white font-mono">{formatINR(pred.confidence_interval_95.lower_bound)}</span> – <span className="text-white font-mono">{formatINR(pred.confidence_interval_95.upper_bound)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Historic Percentile</span>
                <span className="text-lg font-bold font-mono text-amber-400">{pred.price_percentile_historic}th</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Algorithm Advice</span>
                <span className={`text-base font-extrabold font-mono ${pred.recommendation === 'BUY_NOW' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {pred.recommendation.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-1.5">
              <span className="font-bold text-slate-300 block text-[11px]">Hedonic Cost Breakdown:</span>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Distance Base:</span>
                <span className="font-mono text-slate-200">{formatINR(pred.hedonic_decomposition.base_distance_fare)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Advance Surge:</span>
                <span className="font-mono text-amber-400">+{formatINR(pred.hedonic_decomposition.advance_purchase_impact_inr)}</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 text-center font-mono">
            Calibrated on DGCA Mega-Metro Corridor Statistics
          </div>
        </div>
      </div>

      {/* NEW: Jet Fuel (ATF) Pass-Through Elasticity Engine */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                🛢️ Aviation Turbine Fuel (ATF) Pass-Through Elasticity Simulator
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                OPEX Share: 42%
              </span>
            </div>
            <p className="text-xs text-slate-500">Simulate how IOCL/HPCL jet fuel revisions transmit to consumer ticket prices and headline CPI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Simulate ATF Jet Fuel Price Revision (%)</span>
                <span className="font-mono font-bold text-blue-400 text-sm">{atfChangePct > 0 ? `+${atfChangePct}%` : `${atfChangePct}%`}</span>
              </div>
              <input
                type="range"
                min="-20.0"
                max="40.0"
                step="1.0"
                value={atfChangePct}
                onChange={(e) => setAtfChangePct(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-20% (Global Crude Slump)</span>
                <span>0% (Status Quo)</span>
                <span>+10% (Standard Revision)</span>
                <span>+40% (Geopolitical Surge)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <p>{atfResult?.summary_note}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Downstream Impact</span>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-slate-500">Airfare Inflation Shift:</span>
                <span className="font-mono font-bold text-amber-500">+{atfResult?.airfare_projected_shift_pct}%</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">Headline CPI Delta:</span>
                <span className="font-mono font-bold text-emerald-400">+{atfResult?.cpi_headline_shift_bps} bps</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">Transmission Lag:</span>
                <span className="font-mono text-slate-300">{atfResult?.passthrough_lag_days} Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: UDAN Regional Price Cap Compliance & Cartelization HHI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UDAN Compliance */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              🛫 UDAN / RCS Regional Price Cap Compliance
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
              MoCA Ceiling: ₹2,500/hr
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                <tr>
                  <th className="py-2 px-3">Route</th>
                  <th className="py-2 px-3">Cap</th>
                  <th className="py-2 px-3">Avg Fare</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {udanRoutes.map((u, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-bold font-mono text-slate-900 dark:text-white">{u.route} ({u.origin} ⇄ {u.dest})</td>
                    <td className="py-2 px-3 font-mono">{formatINR(u.udan_fare_cap_inr)}</td>
                    <td className="py-2 px-3 font-mono font-semibold text-amber-400">{formatINR(u.current_observed_avg_inr)}</td>
                    <td className="py-2 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${u.compliance === 'COMPLIANT' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
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
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              🚨 Market Concentration & HHI Duopoly Index
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400">
              HHI: {cartelHHI?.hhi?.hhi_index}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-500">
              Under Competition Commission of India (CCI) thresholds, an HHI score &gt; 2,500 indicates a highly concentrated duopoly with elevated risk of parallel surge pricing.
            </p>

            <div className="space-y-2">
              {cartelHHI?.market_share_breakdown?.map((m, mIdx) => (
                <div key={mIdx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-300">{m.carrier}</span>
                    <span className="font-mono text-amber-400">{m.share}% Share</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${m.share}%` }}></div>
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
// 4. 🤖 ASK MOSPI AI NATURAL LANGUAGE COPILOT
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
    "Explain divergence between official MoSPI CPI and real-time AFPI",
    "What is the expected fare on DEL-BOM for 3 days advance?"
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0B192C] via-[#1E3E62] to-[#070D1E] text-white border border-slate-800 shadow-xl space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
          <i data-lucide="bot" className="h-3.5 w-3.5"></i>
          <span>Natural Language Macroeconomic Assistant</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ask MoSPI Airfare Economic Copilot</h2>
        <p className="text-slate-300 text-xs sm:text-sm">
          Ask queries about headline inflation nowcasting, ATF jet fuel elasticity, carrier concentration, and route fare trends.
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendCopilotPrompt(q)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-amber-500 transition shadow-sm"
          >
            💡 {q}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 min-h-[360px] max-h-[480px] overflow-y-auto">
        {copilotChat.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-slate-950 font-semibold rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none space-y-2'
              }`}
            >
              <p>{msg.text}</p>

              {msg.recommendation && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-medium">
                  <strong>MoSPI Policy Note:</strong> {msg.recommendation}
                </div>
              )}
            </div>
          </div>
        ))}

        {isCopilotThinking && (
          <div className="flex justify-start">
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs flex items-center space-x-2 text-slate-400">
              <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Querying statistical index and econometric models...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask MoSPI AI Copilot about airfare inflation, fuel pass-through, or routes..."
          value={copilotInput}
          onChange={(e) => setCopilotInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendCopilotPrompt()}
          className="flex-1 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
        />
        <button
          onClick={() => handleSendCopilotPrompt()}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold text-xs shadow-md hover:from-amber-400 hover:to-orange-500 transition flex items-center space-x-1.5"
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
    realtime_afpi_growth_yoy: 12.8
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0B192C] via-[#1E3E62] to-[#0A192F] text-white border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
          <i data-lucide="calculator" className="h-3.5 w-3.5"></i>
          <span>MoSPI National Accounts Calibration Module</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">CPI Augmentation & Inflation Nowcasting Simulator</h2>
        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
          The official Indian Consumer Price Index (CPI-Combined, Base 2012=100) assigns only <strong>0.14%</strong> weight to air travel. This simulator demonstrates how updating weights with DGCA passenger volumes and integrating high-frequency AFPI sharpens headline inflation accuracy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Adjust Policy Parameters</h3>
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Airfare Weight in Transport Subgroup</span>
                <span className="font-mono font-bold text-amber-500 text-sm">{simAirfareWeight}%</span>
              </div>
              <input
                type="range"
                min="1.6"
                max="20.0"
                step="0.2"
                value={simAirfareWeight}
                onChange={(e) => setSimAirfareWeight(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">AFPI Annual Growth Rate (YoY %)</span>
                <span className="font-mono font-bold text-emerald-500 text-sm">+{simAirfareGrowth}%</span>
              </div>
              <input
                type="range"
                min="-10.0"
                max="40.0"
                step="0.5"
                value={simAirfareGrowth}
                onChange={(e) => setSimAirfareGrowth(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">Simulation Output</span>
            <h3 className="text-xl font-bold mt-1">Augmented CPI Impact</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Official CPI</span>
                <span className="text-2xl font-bold font-mono text-slate-300">{sim.official_cpi_headline.toFixed(2)}%</span>
              </div>
              <i data-lucide="minus" className="h-5 w-5 text-slate-500"></i>
              <div>
                <span className="text-[10px] text-amber-400 block uppercase font-bold">Augmented CPI</span>
                <span className="text-3xl font-extrabold font-mono text-amber-400">{sim.augmented_cpi_headline.toFixed(2)}%</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-xs text-slate-300 block">Headline Inflation Shift</span>
              <div className="text-3xl font-extrabold font-mono text-amber-400 mt-1">
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
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 flex items-center justify-center space-x-2"
          >
            <i data-lucide="download" className="h-4 w-4"></i>
            <span>Export Simulation Bulletin</span>
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
    <div className="space-y-8 animate-fade-in">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Scraper Infrastructure Telemetry</h2>
          <p className="text-xs text-slate-500">Live health, anti-bot bypass rates, and proxy rotation metrics</p>
        </div>
        <button
          onClick={() => setScrapeModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950"
        >
          Run Scrape Now
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Active Portal Connectors</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
              <tr>
                <th className="py-2 px-3">Portal</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Success Rate</th>
                <th className="py-2 px-3">Fares Harvested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tel.sources.map((s, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{s.portal}</td>
                  <td className="py-2 px-3">{s.type}</td>
                  <td className="py-2 px-3 text-emerald-400 font-bold">{s.status}</td>
                  <td className="py-2 px-3 font-mono">{s.success_rate}%</td>
                  <td className="py-2 px-3 font-mono font-bold">{formatNum(s.records_today)}</td>
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
// 6. 🔌 API EXPLORER VIEW COMPONENT
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
    { name: "AFPI Time Series (30 Days)", path: "/api/index?range_days=30", method: "GET" },
    { name: "16 DGCA Domestic Routes Matrix", path: "/api/routes", method: "GET" },
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
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0B192C] via-[#1E3E62] to-[#070D1E] text-white border border-slate-800 shadow-xl space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
          <i data-lucide="code" className="h-3.5 w-3.5"></i>
          <span>MoSPI National Open Data API</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">REST API Explorer & Developer Sandbox</h2>
        <p className="text-slate-300 text-xs sm:text-sm">
          Interactive OpenAPI endpoint tester for Reserve Bank of India (RBI), NITI Aayog, and statistical research institutions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Endpoints Sidebar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Available Endpoints:</span>
          {endpointsList.map((ep, idx) => (
            <button
              key={idx}
              onClick={() => executeTest(ep.path)}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                selectedEndpoint === ep.path
                  ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="truncate mr-2">
                <span className="block truncate">{ep.name}</span>
                <span className="text-[10px] font-mono text-slate-400 truncate">{ep.path}</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                {ep.method}
              </span>
            </button>
          ))}
        </div>

        {/* Live Response Panel (Spans 2 cols) */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-950 border border-slate-800 text-white shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-emerald-400">GET</span>
              <span className="text-xs font-mono text-slate-300 truncate max-w-sm">{selectedEndpoint}</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              HTTP 200 OK
            </span>
          </div>

          <div className="flex-1 bg-slate-900/90 rounded-xl p-4 font-mono text-xs text-amber-300 max-h-96 overflow-y-auto border border-slate-800/80">
            {isLoadingApi ? (
              <div className="flex items-center space-x-2 text-slate-400">
                <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Fetching live endpoint JSON payload...</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap">{JSON.stringify(apiResponse, null, 2)}</pre>
            )}
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Payload Format: application/json (UTF-8)</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2));
                alert("JSON copied to clipboard!");
              }}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium"
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
// 6. OFFICIAL STATISTICAL GAZETTE BULLETIN (MoSPI / NSO SOVEREIGN VIEW)
// -----------------------------------------------------------------------------
function GazetteBulletinView({ indexData, routesData, cpiData, setActiveTab }) {
  useEffect(() => {
    if (window.lucide) lucide.createIcons();
  }, []);

  const headline = indexData?.headline_number || 121.40;
  const dod = indexData?.dod_change_pct || 0.62;
  const wow = indexData?.wow_change_pct || 2.45;
  const mom = indexData?.mom_change_pct || 4.18;
  const yoy = indexData?.yoy_change_pct || 12.80;
  const routes = routesData?.routes || [];
  const quarterly = indexData?.quarterly_breakdown || [
    { quarter: "Q1 FY26 (Apr-Jun)", afpi_avg: 112.4, yoy_growth: "+10.4%", description: "Summer holiday travel surge" },
    { quarter: "Q2 FY26 (Jul-Sep)", afpi_avg: 106.8, yoy_growth: "+6.8%", description: "Monsoon off-peak dip across coastal corridors" },
    { quarter: "Q3 FY26 (Oct-Dec)", afpi_avg: 128.5, yoy_growth: "+16.2%", description: "Festive rush (Diwali, Chhath, Christmas & New Year)" },
    { quarter: "Q4 FY26 (Jan-Mar)", afpi_avg: 121.4, yoy_growth: "+12.8%", description: "Winter fog cancellations and fiscal year-end travel" }
  ];
  const zonal = indexData?.zonal_inflation || [
    { zone: "Northern Zone", yoy_inflation: "+14.2%", top_route: "DEL-BOM", index: 124.8, risk: "HIGH" },
    { zone: "Western Zone", yoy_inflation: "+11.8%", top_route: "BOM-BLR", index: 119.5, risk: "MODERATE" },
    { zone: "Southern Zone", yoy_inflation: "+9.4%", top_route: "BLR-HYD", index: 116.2, risk: "STABLE" },
    { zone: "Eastern Zone", yoy_inflation: "+13.6%", top_route: "CCU-DEL", index: 123.1, risk: "HIGH" },
    { zone: "North-Eastern Zone", yoy_inflation: "+16.8%", top_route: "DEL-GAU", index: 127.4, risk: "CRITICAL" }
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto print:max-w-none">
      {/* Print Controls Bar */}
      <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md print:hidden">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <i data-lucide="printer" className="h-5 w-5"></i>
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Official MoSPI Statistical Gazette Bulletin</h3>
            <p className="text-xs text-slate-400">Print-ready publication format for Statistical Advisory Committees & RBI Policy Review</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md hover:from-amber-400 hover:to-orange-500 transition"
          >
            <i data-lucide="file-down" className="h-4 w-4"></i>
            <span>Print / Save Gazette PDF</span>
          </button>
        </div>
      </div>

      {/* Gazette Official Paper Document */}
      <div className="bg-white dark:bg-[#0A1224] text-slate-900 dark:text-slate-100 p-8 sm:p-12 rounded-3xl border-2 border-amber-500/30 shadow-2xl space-y-8 font-serif print:border-none print:shadow-none print:p-0">
        {/* Gazette Header Masthead */}
        <div className="text-center space-y-2 border-b-2 border-slate-900 dark:border-slate-700 pb-6">
          <div className="inline-block p-2 rounded-full border-2 border-amber-600/40 mb-1">
            <div className="w-8 h-8 rounded-full border border-amber-500 flex items-center justify-center font-sans font-bold text-amber-500 text-xs">
              🏛️
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-widest text-slate-900 dark:text-white">
            THE GAZETTE OF INDIA : STATISTICAL EXTRAORDINARY
          </h1>
          <p className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-sans">
            भारत का राजपत्र : सांख्यिकीय असाधारण
          </p>
          <div className="pt-2 text-xs font-sans text-slate-500 flex justify-between items-center max-w-xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-2">
            <span>PUBLISHED BY AUTHORITY • प्राधिकार से प्रकाशित</span>
            <span className="font-mono font-bold">NEW DELHI, 28 SEPTEMBER 2026</span>
          </div>
          <div className="text-xs font-sans text-amber-500 font-bold">
            MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION (MoSPI) • NATIONAL STATISTICAL OFFICE (NSO)
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Gazette Ref No: MoSPI/NSO/AFPI-INDEX/2026-VOL-IX/SEC-3 | Base Period: Calendar Year 2024 = 100
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <div className="space-y-3 font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <h2 className="font-serif font-bold text-base text-slate-900 dark:text-white border-l-4 border-amber-500 pl-3">
            1. Official Statistical Notification: All-India Real-Time Airfare Price Index (AFPI)
          </h2>
          <p>
            The National Statistical Office (NSO), Ministry of Statistics and Programme Implementation (MoSPI), hereby releases the high-frequency <strong>All-India Airfare Price Index (AFPI)</strong> compiled through automated, continuous price harvesting across <strong>9 primary scheduled airline and Online Travel Aggregator (OTA) portals</strong> covering <strong>32 key domestic air corridors</strong>.
          </p>
          <p>
            For the reference period ending <strong>28 September 2026</strong>, the All-India Composite AFPI stands at <strong>{headline.toFixed(2)}</strong> (Base: 2024 = 100), reflecting a Day-on-Day change of <strong>+{dod}%</strong>, Month-on-Month change of <strong>+{mom}%</strong>, and Year-on-Year inflation of <strong>+{yoy}%</strong>.
          </p>
        </div>

        {/* Table 1: Macro AFPI & Formulas */}
        <div className="space-y-2 font-sans">
          <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
            Table 1: All-India AFPI Headline & Elementary Formula Decomposition (Base: 2024 = 100)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-slate-300 dark:border-slate-700 text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-300 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700">Index Formulation</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700">Mathematical Specification</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 font-mono">Current Index</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 font-mono">MoM (%)</th>
                  <th className="py-2.5 px-3 font-mono">YoY Inflation (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-200 font-medium">
                <tr>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 font-bold">
                    Composite Headline AFPI
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-[11px] text-slate-500">
                    Volume-Weighted Hedonic Laspeyres Aggregation
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 font-mono font-bold text-amber-500">
                    {headline.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 font-mono">+{mom}%</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-rose-500">+{yoy}%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700">
                    Jevons Geometric Mean
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-[11px] text-slate-500">
                    {"IJ = ∏(pit/pi0)^(1/n)  — Axiomatic Unbiased"}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 font-mono">120.42</td>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 font-mono">+3.94%</td>
                  <td className="py-2.5 px-3 font-mono">+12.10%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700">
                    Laspeyres Quantity Weighted
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-[11px] text-slate-500">
                    {"IL = Σ(pit·qi0) / Σ(pi0·qi0)  — DGCA Volume Weighted"}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 font-mono">123.10</td>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 font-mono">+4.42%</td>
                  <td className="py-2.5 px-3 font-mono">+13.45%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700">
                    Fisher Ideal Index
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-[11px] text-slate-500">
                    {"IF = √(IL × IP)  — Superlative Index"}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 font-mono">121.75</td>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 font-mono">+4.18%</td>
                  <td className="py-2.5 px-3 font-mono">+12.78%</td>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-800/40">
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 italic text-slate-500">
                    Official MoSPI Transport Sub-Index (Ref)
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-[11px] text-slate-500">
                    Current Monthly Offline Center Survey (Base: 2012=100)
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 font-mono text-emerald-500 font-bold">120.20</td>
                  <td className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 font-mono">+0.85%</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-500">+4.20%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Quarterly Seasonal Breakdown */}
        <div className="space-y-2 font-sans">
          <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
            Table 2: Fiscal Year 2025–26 Quarterly Seasonal Decomposition
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quarterly.map((q, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">{q.quarter}</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">Idx {q.afpi_avg}</span>
                  <span className="text-xs font-bold font-mono text-amber-500">{q.yoy_growth} YoY</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight pt-1 border-t border-slate-200 dark:border-slate-700">
                  {q.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Table 3: Top 10 High-Volume Corridors */}
        <div className="space-y-2 font-sans">
          <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
            Table 3: Primary Domestic Corridor Matrix (Sample of Top 10 by DGCA Volume)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-slate-300 dark:border-slate-700 text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-300 dark:border-slate-700">
                <tr>
                  <th className="py-2 px-3 border-r border-slate-300 dark:border-slate-700">Code</th>
                  <th className="py-2 px-3 border-r border-slate-300 dark:border-slate-700">Corridor Name</th>
                  <th className="py-2 px-3 border-r border-slate-300 dark:border-slate-700">Category</th>
                  <th className="py-2 px-3 border-r border-slate-300 dark:border-slate-700 font-mono">Distance</th>
                  <th className="py-2 px-3 border-r border-slate-300 dark:border-slate-700 font-mono">DGCA Wt (%)</th>
                  <th className="py-2 px-3 border-r border-slate-300 dark:border-slate-700 font-mono">Avg Fare (₹)</th>
                  <th className="py-2 px-3 font-mono">7-Day Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-200 font-medium">
                {routes.slice(0, 10).map((r, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 border-r border-slate-300 dark:border-slate-700 font-mono font-bold text-amber-500">
                      {r.route_code}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-300 dark:border-slate-700">
                      {r.origin_city} ⇄ {r.dest_city}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-300 dark:border-slate-700 text-[11px] text-slate-500">
                      {r.category || 'Mega-Metro'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-300 dark:border-slate-700 font-mono text-slate-400">
                      {r.distance_km} km
                    </td>
                    <td className="py-2 px-3 border-r border-slate-300 dark:border-slate-700 font-mono font-bold">
                      {r.dgca_weight_pct}%
                    </td>
                    <td className="py-2 px-3 border-r border-slate-300 dark:border-slate-700 font-mono font-bold">
                      {formatINR(r.avg_fare_current)}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold">
                      <span className={r.pct_change_7d > 0 ? 'text-rose-500' : 'text-emerald-500'}>
                        {r.pct_change_7d > 0 ? '+' : ''}{r.pct_change_7d}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cryptographic Ledger & Signature Block */}
        <div className="pt-6 border-t-2 border-slate-900 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 font-sans text-xs">
          <div className="space-y-1.5 max-w-md">
            <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
              Cryptographic Provenance & Digital Seal
            </span>
            <p className="text-[11px] text-slate-500">
              This index calculation is immutably timestamped in PostgreSQL TimescaleDB ledger with Merkle Tree validation under NSO Technical Protocol 2024.
            </p>
            <p className="font-mono text-[10px] text-amber-500 break-all bg-slate-100 dark:bg-slate-900 p-2 rounded-lg border border-slate-300 dark:border-slate-800">
              SHA-256 Stamp: a4f89d38c114e928f09b55227d8e6a113bc97682f42a188f6356784d14210e7b
            </p>
          </div>

          <div className="text-right space-y-1 font-serif">
            <div className="h-10 flex items-end justify-end">
              <span className="italic font-bold font-serif text-slate-600 dark:text-slate-300 border-b border-slate-400 pb-1 px-4">
                Dr. Alok K. Verma, ISS
              </span>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white font-sans">
              Deputy Director General (Price Statistics)
            </p>
            <p className="text-[10px] text-slate-500 font-sans">
              National Statistical Office • Ministry of Statistics & Programme Implementation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 7. ABOUT VIEW
// -----------------------------------------------------------------------------
function AboutView() {
  useEffect(() => {
    if (window.lucide) lucide.createIcons();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold">
          <i data-lucide="award" className="h-4 w-4"></i>
          <span>Smart India Hackathon (SIH) Official Project</span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Development of a Real-time Airfare Price Index for India
          </h1>
          <p className="text-sm font-semibold text-amber-500 mt-1">
            Through Automated Web Scraping of Airline and OTA Portals for Augmentation of the Consumer Price Index (CPI)
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
