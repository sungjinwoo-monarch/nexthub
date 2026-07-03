import { useState, useEffect, useRef, FormEvent, MouseEvent } from 'react';
import { 
  Search, Copy, Check, ExternalLink, Share2, Award, 
  Star, Users, Code, Zap, Flame, ChevronRight, ArrowLeft, 
  AlertCircle, Info, Sparkles, Github, Terminal, Globe, Cpu, Layers, BookOpen, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerCardData } from './types';
import { generateCardSvg } from './utils/svgGenerator';
import { sanitizeUsername } from './utils/githubFetcher';
import { LanguageD3Chart } from './components/LanguageD3Chart';
import { BrandCenter } from './components/BrandCenter';
import { AnimatedCounter } from './components/AnimatedCounter';
import { ContributionHeatmap } from './components/ContributionHeatmap';

// Framer Motion staggered variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    }
  }
};

// Famous preset players for the quick-start showcase
const PRESET_PLAYERS = [
  { username: 'torvalds', label: 'Linus Torvalds', desc: 'Legendary CB / Code Bastion', color: '#EF4444' },
  { username: 'gaearon', label: 'Dan Abramov', desc: 'Elite CAM / Architect', color: '#3B82F6' },
  { username: 'yyx990803', label: 'Evan You', desc: 'Elite RW / Speedster', color: '#22C55E' },
  { username: 'tj', label: 'TJ Holowaychuk', desc: 'Iconic ST / Machine', color: '#8B5CF6' },
  { username: 'karpathy', label: 'Andrej Karpathy', desc: 'TOTY LW / AI Specialist', color: '#FFD400' },
];

const COMMON_COUNTRIES = [
  { code: 'un', name: 'GLOBAL FEDERATION' },
  { code: 'dz', name: 'Algeria 🇩🇿' },
  { code: 'us', name: 'United States 🇺🇸' },
  { code: 'gb', name: 'United Kingdom 🇬🇧' },
  { code: 'fr', name: 'France 🇫🇷' },
  { code: 'de', name: 'Germany 🇩🇪' },
  { code: 'in', name: 'India 🇮🇳' },
  { code: 'br', name: 'Brazil 🇧🇷' },
  { code: 'ca', name: 'Canada 🇨🇦' },
  { code: 'jp', name: 'Japan 🇯🇵' },
  { code: 'ua', name: 'Ukraine 🇺🇦' },
  { code: 'nl', name: 'Netherlands 🇳🇱' },
  { code: 'au', name: 'Australia 🇦🇺' },
  { code: 'es', name: 'Spain 🇪🇸' },
];

export default function App() {
  const [usernameInput, setUsernameInput] = useState('');
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [playerData, setPlayerData] = useState<PlayerCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'markdown' | 'html' | 'link' | null>(null);
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [showBrandCenter, setShowBrandCenter] = useState(false);
  
  // 3D Tilt state
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, scale: 1 });

  // Synced client routing
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Parse path and query parameters on path change
  useEffect(() => {
    const username = currentPath.slice(1); // Remove leading slash
    if (username && username !== 'favicon.ico') {
      const urlParams = new URLSearchParams(window.location.search);
      const countryParam = urlParams.get('country') || '';
      setCountryFilter(countryParam);
      fetchPlayerData(username, countryParam);
    } else {
      setPlayerData(null);
      setError(null);
    }
  }, [currentPath]);

  const fetchPlayerData = async (uname: string, countryCode?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/player/${encodeURIComponent(uname)}`;
      if (countryCode) {
        url += `?country=${encodeURIComponent(countryCode)}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch squad player statistics');
      }
      const data = await res.json();
      setPlayerData(data);
    } catch (err: any) {
      console.error(err);
      setError('Could not connect to GitHub League. Please check the username and try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (pathStr: string, searchStr = '') => {
    window.history.pushState({}, '', pathStr + searchStr);
    setCurrentPath(pathStr);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanUsername = sanitizeUsername(usernameInput);
    if (cleanUsername) {
      navigateTo(`/${cleanUsername}`, countryFilter ? `?country=${countryFilter}` : '');
    }
  };

  const handleCountryChange = (newCountry: string) => {
    setCountryFilter(newCountry);
    if (playerData) {
      const searchStr = newCountry ? `?country=${newCountry}` : '';
      navigateTo(`/${playerData.username}`, searchStr);
    }
  };

  // Generate Scout Commentary based on profile
  const getScoutReport = (data: PlayerCardData) => {
    const name = data.name;
    const pos = data.position;
    const arch = data.archetype;
    const rating = data.overallRating;

    if (rating >= 90) {
      return `Absolute powerhouse of the digital pitch. Boasting an elite ${rating} OVR rating as a ${pos} (${arch}), ${name} exhibits legendary technical versatility. Pumping features, review sweeps, and language flexibility, they are a vital franchise player.`;
    }
    if (rating >= 80) {
      return `Outstanding playmaking athlete. Showing exceptional speed (${data.stats.spd} SPD) and clean attack work (${data.stats.cod} COD). They are the perfect team catalyst, linking dependencies and delivering continuous commits.`;
    }
    if (rating >= 70) {
      return `A rock-solid squad fixture. Defensively sound, shutting down bugs and processing pull requests with ${data.stats.def} DEF. A trusted node anchor who guarantees code health and repository sanity with diligent reviews.`;
    }
    return `Rising talent with massive growth potential. Training index displays high speed, clean code lines, and strong core execution. Pushes clean contributions and shows consistent energy for open-source leagues.`;
  };

  const copyToClipboard = (text: string, type: 'markdown' | 'html' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const el = cardRef.current;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    
    // Smooth 3D card tilt
    const rX = -((y - midY) / midY) * 10;
    const rY = ((x - midX) / midX) * 10;
    
    setTilt({ rx: rX, ry: rY, scale: 1.02 });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, scale: 1 });
  };

  const appBaseUrl = window.location.origin;
  const imageUrl = playerData ? `${appBaseUrl}/${playerData.username}.png${countryFilter ? `?country=${countryFilter}` : ''}` : '';
  const shareUrl = playerData ? `${appBaseUrl}/${playerData.username}${countryFilter ? `?country=${countryFilter}` : ''}` : '';

  const markdownSnippet = playerData ? `[![GitHub Squad Player Card](${imageUrl})](${shareUrl})` : '';
  const htmlSnippet = playerData ? `<a href="${shareUrl}"><img src="${imageUrl}" alt="GitHub Squad Card" width="375" height="600" /></a>` : '';

  const getCardGlowClass = (cardType: string) => {
    switch (cardType?.toLowerCase()) {
      case 'toty':
        return 'from-yellow-500/20 via-amber-500/10 to-transparent';
      case 'gold':
        return 'from-yellow-600/15 via-transparent to-transparent';
      case 'special':
        return 'from-purple-500/20 via-pink-500/10 to-transparent';
      case 'icon':
        return 'from-indigo-500/20 via-cyan-500/10 to-transparent';
      case 'silver':
        return 'from-slate-400/15 via-transparent to-transparent';
      default:
        return 'from-amber-700/10 via-transparent to-transparent';
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-[#FFD400]/25 selection:text-white">
      
      {/* Luxury Ambient Glowing Orbs */}
      <div className="absolute top-[5%] left-[-15%] w-[600px] h-[600px] rounded-full bg-[#FFD400]/5 blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[15%] right-[-10%] w-[700px] h-[700px] rounded-full bg-purple-500/5 blur-[160px] pointer-events-none z-0" />
      
      {/* Ambient Dot Grid Pattern Overlay */}
      <div className="absolute inset-0 dot-grid pointer-events-none z-0 opacity-50" />

      {/* Header Container */}
      <header className="relative border-b border-white/5 bg-[#090909]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            id="logo-button"
            onClick={() => navigateTo('/')} 
            className="flex items-center gap-3.5 group text-left cursor-pointer transition-transform duration-150 hover:scale-[1.02]"
          >
            {/* Geometric N Icon */}
            <div className="w-10 h-10 bg-[#111111] border border-white/10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden p-1.5 relative group-hover:border-white/20 transition-all">
              <svg viewBox="0 0 600 500" className="w-full h-full overflow-visible">
                <path d="M 225,68 H 415 L 477,130 V 350 L 415,412 H 265" stroke="#FFD400" strokeWidth="28" strokeLinejoin="miter" strokeLinecap="square" fill="none" />
                <polygon points="165,150 195,110 245,110 245,240 355,380 355,110 435,110 435,370 405,410 355,410 355,280 245,140 245,410 165,410" fill="#FFFFFF" />
                <g>
                  <circle cx="300" cy="190" r="35" fill="#FFD400" stroke="#000000" strokeWidth="4" />
                  <circle cx="300" cy="192" r="16" fill="#000000" />
                  <path d="M 287,184 L 286,171 L 293,178 Z" fill="#000000" />
                  <path d="M 313,184 L 314,171 L 307,178 Z" fill="#000000" />
                  <path d="M 288,206 C 288,206 290,218 300,218 C 310,218 312,206 312,206 H 288 Z" fill="#000000" />
                  <path d="M 288,212 Q 280,214 281,202" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </g>
              </svg>
            </div>
            
            <div>
              <h1 className="font-display font-extrabold text-xl tracking-tight text-white uppercase flex items-center gap-2">
                <span>NEXT<span className="text-[#FFD400]">HUB</span></span>
              </h1>
            </div>
          </button>

          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full font-bold text-emerald-400 hidden md:inline flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              LEAGUE SYSTEM: ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 relative z-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!playerData && !loading && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-12"
            >
              {/* Premium Bento Grid: Hero Block (Cols 8) + Squad Preset (Cols 4) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Hero Search Bento Card */}
                <div className="lg:col-span-8 bg-[#111111] border border-white/5 rounded-[28px] p-8 md:p-12 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FFD400]/5 rounded-full blur-[80px] pointer-events-none" />
                  
                  <div className="space-y-6">
                    {/* Tiny Indicator badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full text-neutral-300 font-mono text-xs font-bold shadow-inner">
                      <Sparkles className="w-4 h-4 text-[#FFD400]" />
                      <span>DRAFT DECK ACTIVE FOR SCOUTING</span>
                    </div>

                    {/* Editorial Modern Typography Heading */}
                    <h2 className="text-4xl md:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.02] uppercase">
                      Convert repos<br/>
                      into <span className="text-[#FFD400] underline decoration-[#FFD400]/30 underline-offset-4">collectible</span><br/>
                      trading cards.
                    </h2>

                    <p className="text-neutral-400 text-base md:text-lg leading-relaxed max-w-xl font-sans">
                      Enter any GitHub username. Our analytics compiler analyzes repositories, contributions, followers, and language ratios to generate an elegant vector trading card.
                    </p>
                  </div>

                  {/* Redesigned Search Form */}
                  <form onSubmit={handleSearchSubmit} className="relative mt-8 max-w-xl">
                    <div className="relative flex flex-col sm:flex-row items-stretch gap-3 p-2 bg-[#171717]/90 border border-white/10 rounded-[22px] shadow-2xl focus-within:border-[#FFD400]/50 transition-all backdrop-blur-md">
                      <div className="flex items-center flex-1 px-3 py-2.5 min-w-0">
                        <Search className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" />
                        <input 
                          id="username-search-input"
                          type="text" 
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          placeholder="ENTER GITHUB USERNAME..."
                          className="w-full bg-transparent text-white placeholder-neutral-500 font-mono tracking-wide focus:outline-none text-sm uppercase"
                        />
                      </div>
                      <button 
                        id="search-submit-btn"
                        type="submit"
                        className="bg-[#FFD400] hover:bg-white text-black font-display font-extrabold text-xs tracking-wider uppercase px-7 py-3.5 rounded-xl transition-all duration-150 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 flex-shrink-0"
                      >
                        <span>SCOUT PROFILE</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Famous Preset Roster Bento Card */}
                <div className="lg:col-span-4 bg-[#111111] border border-white/5 p-8 rounded-[28px] shadow-2xl flex flex-col justify-between relative">
                  <div>
                    <div className="border-b border-white/5 pb-4 mb-6 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-500 tracking-wider font-extrabold uppercase">PRE-SELECTED</span>
                        <h3 className="font-display font-extrabold text-xl text-white uppercase tracking-wide">ELITE ROSTER</h3>
                      </div>
                      <Layers className="w-5 h-5 text-neutral-500" />
                    </div>

                    <div className="space-y-3">
                      {PRESET_PLAYERS.map((player) => (
                        <button
                          id={`preset-player-${player.username}`}
                          key={player.username}
                          onClick={() => navigateTo(`/${player.username}`)}
                          className="w-full p-3 bg-[#171717]/50 hover:bg-[#171717] border border-white/5 rounded-2xl transition-all flex items-center justify-between cursor-pointer group hover:border-[#FFD400]/40"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-neutral-900 flex-shrink-0 relative">
                              <img 
                                src={`https://github.com/${player.username}.png?size=64`} 
                                alt={player.label}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${player.username}`;
                                }}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                              />
                            </div>
                            <div className="text-left">
                              <h4 className="font-display font-bold text-sm text-white group-hover:text-[#FFD400] transition-colors">
                                {player.label}
                              </h4>
                              <p className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider">{player.desc}</p>
                            </div>
                          </div>

                          <div 
                            className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center transition-all bg-[#111111] group-hover:bg-[#FFD400] group-hover:text-black"
                            style={{ color: player.color }}
                          >
                            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-black" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Three bottom micro bento cards to complete the dashboard layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Micro Bento 1 */}
                <div className="bg-[#111111] border border-white/5 rounded-[24px] p-6 hover:border-white/10 transition-all flex items-start gap-4">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[#FFD400]">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-white">Interactive Sifting</h4>
                    <p className="text-xs text-neutral-400 font-mono mt-1.5 leading-relaxed">
                      Sift metadata deterministically. Experience real-time vector response updates on GitHub username queries.
                    </p>
                  </div>
                </div>

                {/* Micro Bento 2 */}
                <div className="bg-[#111111] border border-white/5 rounded-[24px] p-6 hover:border-white/10 transition-all flex items-start gap-4">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-purple-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-white">Algorithmic Ratings</h4>
                    <p className="text-xs text-neutral-400 font-mono mt-1.5 leading-relaxed">
                      Converts repository variables (PRs, commits, forks, followers) into dynamic sports-themed ratings with precise grades.
                    </p>
                  </div>
                </div>

                {/* Micro Bento 3 */}
                <div className="bg-[#111111] border border-white/5 rounded-[24px] p-6 hover:border-white/10 transition-all flex items-start gap-4">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-blue-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-white">README embeds</h4>
                    <p className="text-xs text-neutral-400 font-mono mt-1.5 leading-relaxed">
                      Generates live markdown and HTML iframe codes ready to drop into GitHub developer profile README files.
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* Loading Scouting State */}
          {loading && (
            <motion.div 
              key="loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24 flex flex-col items-center justify-center min-h-[450px]"
            >
              <div className="relative mb-6">
                {/* Premium rotating pulsing loading core */}
                <div className="w-16 h-16 bg-[#111111] border border-[#FFD400]/40 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,212,0,0.15)] animate-spin [animation-duration:3s]">
                  <Flame className="w-8 h-8 text-[#FFD400]" />
                </div>
              </div>
              <h3 className="text-xl font-display font-extrabold tracking-wider text-white mb-2 uppercase">
                Compiling Performance metrics...
              </h3>
              <p className="text-xs text-[#FFD400] font-mono tracking-widest uppercase font-bold bg-white/5 border border-white/5 rounded-full px-5 py-1.5">
                Fetching live commits, PRs, stars & rendering card asset
              </p>
            </motion.div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div 
              key="error-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto text-center py-12 px-8 rounded-[28px] bg-[#111111] border border-red-500/10 shadow-2xl"
            >
              <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="font-display font-extrabold text-xl text-white mb-2 uppercase">Scouting halted</h3>
              <p className="text-xs font-mono text-neutral-400 mb-8 leading-relaxed uppercase">{error}</p>
              <button 
                id="error-return-btn"
                onClick={() => navigateTo('/')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-black font-mono font-bold text-xs rounded-xl tracking-wider hover:bg-neutral-200 transition-all cursor-pointer shadow"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>RETURN TO SEARCH</span>
              </button>
            </motion.div>
          )}

          {/* Player view dashboard */}
          {playerData && !loading && !error && (
            <motion.div 
              key="player-profile"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start py-4 w-full"
            >
              {/* Left Column: Collectible Card Stage */}
              <motion.div className="lg:col-span-5 flex flex-col items-center w-full gap-6" variants={itemVariants}>
                
                {/* Back button */}
                <button 
                  id="profile-back-btn"
                  onClick={() => navigateTo('/')}
                  className="self-start inline-flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-neutral-800 border border-white/10 rounded-xl text-xs font-mono font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>DRAFT ANOTHER ATHLETE</span>
                </button>

                {/* Card Container Stage in premium card bento card */}
                <div className="p-8 bg-[#111111] border border-white/5 rounded-[28px] shadow-2xl relative w-full flex flex-col items-center overflow-hidden">
                  
                  {/* Subtle dynamic background energy glow behind the card */}
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-gradient-to-b ${getCardGlowClass(playerData.cardType)} filter blur-[60px] opacity-40 pointer-events-none z-0`} />

                  {/* Floating Class Tag Badge */}
                  <div className="absolute top-4 left-6 px-3 py-1 bg-white/5 text-[#FFD400] border border-white/10 rounded-full font-mono text-[9px] font-bold shadow-inner uppercase tracking-wider z-20">
                    {playerData.cardType} Class
                  </div>

                  <div 
                    id="3d-card-interactive-wrapper"
                    className="relative cursor-pointer transition-all duration-150 preserve-3d w-full max-w-[340px] aspect-[375/600] mx-auto z-10"
                    style={{
                      perspective: '1200px',
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div 
                      ref={cardRef}
                      className="w-full h-full select-none [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
                      style={{
                        transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.scale})`,
                        transformStyle: 'preserve-3d',
                        transition: tilt.scale === 1 ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                      }}
                      dangerouslySetInnerHTML={{ __html: generateCardSvg(playerData) }}
                    />
                  </div>
                </div>

                {/* Info Tip badge */}
                <div className="w-full px-5 py-3 bg-[#111111] border border-white/5 rounded-2xl font-mono text-xs text-neutral-400 flex items-center gap-2.5 shadow-md">
                  <Info className="w-4 h-4 text-[#FFD400] flex-shrink-0" />
                  <span>Hover to shift card vector reflection</span>
                </div>
              </motion.div>

              {/* Right Column: Premium Dashboard details inside a Bento grid */}
              <div className="lg:col-span-7 flex flex-col gap-6 w-full">
                
                {/* Bento Card 1: Profile Header & Classification */}
                <motion.div className="p-8 bg-[#111111] border border-white/5 rounded-[28px] shadow-2xl relative overflow-hidden" variants={itemVariants}>
                  <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#FFD400]/5 rounded-full blur-[40px] pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 mb-6 border-b border-white/5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2.5 py-0.5 bg-neutral-800 text-[#FFD400] text-[9px] font-mono font-bold uppercase rounded-md border border-white/5">
                          {playerData.cardType} Class
                        </span>
                        <span className="px-2.5 py-0.5 bg-neutral-800 text-white text-[9px] font-mono font-bold uppercase rounded-md border border-white/5">
                          POS: {playerData.position}
                        </span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight uppercase leading-[1.1]">
                        {playerData.name}
                      </h2>
                      <p className="text-xs font-mono text-neutral-500 mt-1 uppercase">SQUAD REGISTRY: @{playerData.username}</p>
                    </div>

                    {/* Flag Selection Dropdown */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <label className="text-[9px] font-mono font-extrabold text-neutral-400 tracking-wider uppercase">FEDERATION</label>
                      <div className="bg-[#171717] border border-white/10 rounded-xl px-3 py-1.5 flex items-center shadow-md focus-within:border-[#FFD400]/30">
                        <select 
                          id="country-selector-select"
                          value={countryFilter}
                          onChange={(e) => handleCountryChange(e.target.value)}
                          className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none border-none cursor-pointer uppercase pr-2"
                        >
                          {COMMON_COUNTRIES.map((ct) => (
                            <option key={ct.code} value={ct.code === 'un' ? '' : ct.code} className="bg-[#171717] text-white">
                              {ct.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#090909]/40 p-4 border border-white/5 rounded-2xl">
                    <span className="text-[9px] font-mono font-bold text-neutral-500 tracking-wider block mb-1">DECK SCROLL PROFILE</span>
                    <p className="text-neutral-300 italic text-xs leading-relaxed">
                      "{playerData.bio || 'No public scout bio recorded on main directory node.'}"
                    </p>
                  </div>
                </motion.div>

                {/* Bento Card 2: AI Sports Scout Memorandum */}
                <motion.div className="p-8 bg-[#111111] border border-white/5 rounded-[28px] shadow-2xl relative overflow-hidden" variants={itemVariants}>
                  <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                    <Award className="w-4.5 h-4.5 text-[#FFD400]" />
                    <h3 className="text-xs font-mono font-bold tracking-wider text-neutral-300 uppercase">
                      OFFICIAL LEAGUE SCOUTING MEMORANDUM
                    </h3>
                  </div>
                  
                  <p className="text-neutral-200 text-sm md:text-base leading-relaxed mb-6 font-sans">
                    {getScoutReport(playerData)}
                  </p>

                  {/* Archetype Breakdown Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase block tracking-wider">STYLE ARCHETYPE</span>
                      <span className="font-display font-extrabold text-sm text-[#FFD400] uppercase block mt-1">{playerData.archetype}</span>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase block tracking-wider">FEDERATION AREA</span>
                      <span className="font-display font-extrabold text-sm text-blue-400 uppercase block mt-1">{playerData.countryName}</span>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase block tracking-wider">LEAGUE GRADE</span>
                      <span className="font-display font-extrabold text-sm text-emerald-400 uppercase block mt-1">
                        {playerData.overallRating >= 85 ? 'S-TIER CLASS' : 'A-TIER CLASS'}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Bento Card 3: Training Compiler Stats & D3 Chart */}
                <motion.div className="p-8 bg-[#111111] border border-white/5 rounded-[28px] shadow-2xl" variants={itemVariants}>
                  <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-6">
                    <span className="w-2.5 h-2.5 bg-[#FFD400] rounded-full inline-block animate-pulse" />
                    <h3 className="text-xs font-mono font-bold tracking-wider text-neutral-300 uppercase">
                      TRAINING COMPILER METRICS (RAW REPOSITORY STATS)
                    </h3>
                  </div>

                  {/* High contrast dark custom stats grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="bg-[#171717] p-4 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-[#FFD400]/25 transition-all">
                      <div>
                        <div className="text-neutral-400 font-mono text-[9px] tracking-wider uppercase">COMMITS VALUE (COD)</div>
                        <div className="text-xl font-display font-bold text-white mt-1"><AnimatedCounter value={playerData.rawStats.commits} /></div>
                      </div>
                      <span className="px-2.5 py-1 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 rounded-lg font-mono text-xs font-bold">
                        {playerData.stats.cod} OVR
                      </span>
                    </div>

                    <div className="bg-[#171717] p-4 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-blue-500/25 transition-all">
                      <div>
                        <div className="text-neutral-400 font-mono text-[9px] tracking-wider uppercase">PULL REQUESTS (CRE)</div>
                        <div className="text-xl font-display font-bold text-white mt-1"><AnimatedCounter value={playerData.rawStats.prs} /></div>
                      </div>
                      <span className="px-2.5 py-1 bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 rounded-lg font-mono text-xs font-bold">
                        {playerData.stats.cre} OVR
                      </span>
                    </div>

                    <div className="bg-[#171717] p-4 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-purple-500/25 transition-all">
                      <div>
                        <div className="text-neutral-400 font-mono text-[9px] tracking-wider uppercase">REPOSITORY STARS (TEC)</div>
                        <div className="text-xl font-display font-bold text-white mt-1"><AnimatedCounter value={playerData.rawStats.stars} /></div>
                      </div>
                      <span className="px-2.5 py-1 bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 rounded-lg font-mono text-xs font-bold">
                        {playerData.stats.tec} OVR
                      </span>
                    </div>

                    <div className="bg-[#171717] p-4 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-[#FFD400]/25 transition-all">
                      <div>
                        <div className="text-neutral-400 font-mono text-[9px] tracking-wider uppercase">SQUAD FOLLOWERS (PWR)</div>
                        <div className="text-xl font-display font-bold text-white mt-1"><AnimatedCounter value={playerData.rawStats.followers} /></div>
                      </div>
                      <span className="px-2.5 py-1 bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/20 rounded-lg font-mono text-xs font-bold">
                        {playerData.stats.pwr} OVR
                      </span>
                    </div>

                  </div>

                  {/* Languages Block */}
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <span className="text-neutral-400 text-[9px] font-mono tracking-wider uppercase font-bold block mb-3">
                      COMPILED LANGUAGE STACK
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {playerData.rawStats.languages.length > 0 ? (
                        playerData.rawStats.languages.map(lang => (
                          <span 
                            key={lang} 
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-neutral-200 text-xs border border-white/10 rounded-lg font-mono tracking-wide transition-all"
                          >
                            {lang.toUpperCase()}
                          </span>
                        ))
                      ) : (
                        <span className="text-neutral-500 text-xs font-mono italic uppercase">NO REGISTERED SKILLS DETECTED IN PRIMARY INDEX</span>
                      )}
                    </div>
                  </div>

                  {/* Language D3 Chart */}
                  <LanguageD3Chart languages={playerData.rawStats.languages} username={playerData.username} />
                </motion.div>

                {/* Contribution Heatmap Card */}
                <ContributionHeatmap playerData={playerData} />

                {/* Bento Card 4: Embed Codes & Sharing Dashboard */}
                <motion.div className="p-8 bg-[#111111] border border-white/5 rounded-[28px] shadow-2xl" variants={itemVariants}>
                  <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                    <Share2 className="w-4.5 h-4.5 text-[#FFD400]" />
                    <h3 className="text-xs font-mono font-bold tracking-wider text-neutral-300 uppercase">
                      PROFILE README DECK EMBEDS
                    </h3>
                  </div>

                  <p className="text-xs font-mono text-neutral-400 mb-6 leading-relaxed">
                    Elevate your GitHub profile README page. Click below to copy the markdown or HTML iframe elements directly.
                  </p>

                  <div className="space-y-4">
                    {/* Markdown snippet */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider">MARKDOWN DECK EMBED</span>
                        <button 
                          id="copy-markdown-btn"
                          onClick={() => copyToClipboard(markdownSnippet, 'markdown')}
                          className="text-xs text-[#FFD400] hover:text-white flex items-center gap-1.5 cursor-pointer font-mono font-bold transition-all"
                        >
                          {copiedType === 'markdown' ? <Check className="w-4.5 h-4.5 stroke-[2.5]" /> : <Copy className="w-4.5 h-4.5 stroke-[2]" />}
                          <span>{copiedType === 'markdown' ? 'COPIED!' : 'COPY CODE'}</span>
                        </button>
                      </div>
                      <div className="bg-[#171717] p-3.5 border border-white/5 rounded-xl font-mono text-xs text-neutral-300 overflow-x-auto whitespace-nowrap scrollbar-thin">
                        <code>{markdownSnippet}</code>
                      </div>
                    </div>

                    {/* HTML code snippet */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider">HTML DECK EMBED</span>
                        <button 
                          id="copy-html-btn"
                          onClick={() => copyToClipboard(htmlSnippet, 'html')}
                          className="text-xs text-[#FFD400] hover:text-white flex items-center gap-1.5 cursor-pointer font-mono font-bold transition-all"
                        >
                          {copiedType === 'html' ? <Check className="w-4.5 h-4.5 stroke-[2.5]" /> : <Copy className="w-4.5 h-4.5 stroke-[2]" />}
                          <span>{copiedType === 'html' ? 'COPIED!' : 'COPY CODE'}</span>
                        </button>
                      </div>
                      <div className="bg-[#171717] p-3.5 border border-white/5 rounded-xl font-mono text-xs text-neutral-300 overflow-x-auto whitespace-nowrap scrollbar-thin">
                        <code>{htmlSnippet}</code>
                      </div>
                    </div>

                  </div>
                </motion.div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#090909] py-12 text-center text-neutral-400 text-xs relative z-10 font-mono">
        <div className="max-w-7xl mx-auto px-6 space-y-4 flex flex-col items-center">
          <p className="tracking-[3px] uppercase font-bold text-neutral-500">© 2026 NEXTHUB </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <a 
              id="sungjinwoo-monarch-github-link"
              href="https://github.com/sungjinwoo-monarch"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-white text-white hover:text-black border border-white/10 rounded-xl font-mono text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Github className="w-4 h-4" />
              <span>SUNGJINWOO-MONARCH</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Brand Guidelines & Asset Downloader Overlay */}
      <BrandCenter isOpen={showBrandCenter} onClose={() => setShowBrandCenter(false)} />
    </div>
  );
}
