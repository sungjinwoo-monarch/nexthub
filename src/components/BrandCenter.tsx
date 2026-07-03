import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Download, Check, Sparkles, Sliders, Image as ImageIcon } from 'lucide-react';

interface BrandCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LogoAsset {
  id: string;
  name: string;
  description: string;
  type: 'logos' | 'icons' | 'specs';
  dimensions: string;
  bgType: 'dark' | 'light' | 'transparent' | 'grid';
  renderFn: (theme: { bg: string; text: string; accent: string; frame: string; textHub: string; showTagline: boolean; layout: 'vertical' | 'horizontal' | 'icon-only' }) => React.ReactNode;
}

export function BrandCenter({ isOpen, onClose }: BrandCenterProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'logos' | 'icons' | 'specs'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Common styles/attributes for the geometric N and outer frame
  const renderLogoContent = ({
    bg = '#000000',
    text = '#FFFFFF',
    accent = '#FFD400',
    frame = '#FFD400',
    textHub = '#FFD400',
    showTagline = true,
    layout = 'vertical',
  }: {
    bg: string;
    text: string;
    accent: string;
    frame: string;
    textHub: string;
    showTagline: boolean;
    layout: 'vertical' | 'horizontal' | 'icon-only';
  }) => {
    // Shared N polygon path
    const nPolygonPoints = "165,150 195,110 245,110 245,240 355,380 355,110 435,110 435,370 405,410 355,410 355,280 245,140 245,410 165,410";
    
    // Incomplete outer yellow frame path
    const framePath = "M 225,68 H 415 L 477,130 V 350 L 415,412 H 265";
    
    // GitHub element positioned inside the N cavity (cx=300, cy=190, r=35)
    const renderGitHubCat = () => (
      <g id="github-badge">
        <circle cx="300" cy="190" r="35" fill={accent} stroke={bg === 'transparent' ? '#111111' : bg} strokeWidth="4" />
        {/* Minimal Cat Silhouette */}
        <circle cx="300" cy="192" r="16" fill={bg === 'transparent' ? '#111111' : bg} />
        {/* Left Ear */}
        <path d="M 287,184 L 286,171 L 293,178 Z" fill={bg === 'transparent' ? '#111111' : bg} />
        {/* Right Ear */}
        <path d="M 313,184 L 314,171 L 307,178 Z" fill={bg === 'transparent' ? '#111111' : bg} />
        {/* Shoulders */}
        <path d="M 288,206 C 288,206 290,218 300,218 C 310,218 312,206 312,206 H 288 Z" fill={bg === 'transparent' ? '#111111' : bg} />
        {/* Tail */}
        <path d="M 288,212 Q 280,214 281,202" stroke={bg === 'transparent' ? '#111111' : bg} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </g>
    );

    if (layout === 'icon-only') {
      return (
        <svg viewBox="0 0 600 500" width="100%" height="100%" className="overflow-visible">
          {bg !== 'transparent' && <rect width="600" height="500" fill={bg} rx="16" />}
          
          {/* Main Icon Group */}
          <g transform="translate(0, 15)">
            {/* Outer Frame (Incomplete Rounded Square with Chamfered Corners) */}
            <path d={framePath} stroke={frame} strokeWidth="24" strokeLinejoin="miter" strokeLinecap="square" fill="none" />
            
            {/* N Polygon with clean flat color and subtle inner stroke */}
            <polygon points={nPolygonPoints} fill={text} />
            
            {/* GitHub Element */}
            {renderGitHubCat()}
          </g>
        </svg>
      );
    }

    if (layout === 'horizontal') {
      return (
        <svg viewBox="0 0 850 360" width="100%" height="100%" className="overflow-visible">
          {bg !== 'transparent' && <rect width="850" height="360" fill={bg} rx="16" />}
          
          {/* Small Left Icon Group (Scaled down to sit nicely alongside text) */}
          <g transform="translate(-40, -40) scale(0.72)">
            <path d={framePath} stroke={frame} strokeWidth="24" strokeLinejoin="miter" strokeLinecap="square" fill="none" />
            <polygon points={nPolygonPoints} fill={text} />
            {renderGitHubCat()}
          </g>

          {/* Right Wordmark Text */}
          <g transform="translate(320, 160)">
            <text x="0" y="30" fontStyle="normal" fontFamily="'Space Grotesk', 'Satoshi', 'Inter', sans-serif" fontWeight="800" fontSize="105" letterSpacing="-4">
              <tspan fill={text}>Next</tspan>
              <tspan fill={textHub}>Hub</tspan>
            </text>
            
            {/* Tagline */}
            <text x="4" y="95" fill={text} fontFamily="'Space Grotesk', 'Inter', sans-serif" fontWeight="700" fontSize="16" letterSpacing="6">
              DISCOVER <tspan fill={accent}>•</tspan> CONNECT <tspan fill={accent}>•</tspan> COLLABORATE
            </text>
          </g>
        </svg>
      );
    }

    // Default: Vertical layout
    return (
      <svg viewBox="0 0 600 660" width="100%" height="100%" className="overflow-visible">
        {bg !== 'transparent' && <rect width="600" height="660" fill={bg} rx="24" />}
        
        {/* 1. Icon (Top centered) */}
        <g transform="translate(0, 20)">
          <path d={framePath} stroke={frame} strokeWidth="24" strokeLinejoin="miter" strokeLinecap="square" fill="none" />
          <polygon points={nPolygonPoints} fill={text} />
          {renderGitHubCat()}
        </g>

        {/* 2. Wordmark "NextHub" */}
        <text x="300" y="500" textAnchor="middle" fontFamily="'Space Grotesk', 'Satoshi', 'Inter', sans-serif" fontWeight="800" fontSize="76" letterSpacing="-3">
          <tspan fill={text}>Next</tspan>
          <tspan fill={textHub}>Hub</tspan>
        </text>

        {/* 3. Divider Line with Hexagon Center */}
        <g transform="translate(0, 0)">
          <line x1="120" y1="540" x2="275" y2="540" stroke={accent} strokeWidth="3" />
          <polygon points="308,540 304,547 296,547 292,540 296,533 304,533" fill={accent} stroke={accent} strokeWidth="2" />
          <line x1="325" y1="540" x2="480" y2="540" stroke={accent} strokeWidth="3" />
        </g>

        {/* 4. Tagline DISCOVER • CONNECT • COLLABORATE */}
        {showTagline && (
          <text x="304" y="585" textAnchor="middle" fill={text} fontFamily="'Space Grotesk', 'Inter', sans-serif" fontWeight="700" fontSize="13.5" letterSpacing="6">
            DISCOVER <tspan fill={accent} fontWeight="900">•</tspan> CONNECT <tspan fill={accent} fontWeight="900">•</tspan> COLLABORATE
          </text>
        )}
      </svg>
    );
  };

  const assetsList: LogoAsset[] = [
    {
      id: 'master-dark',
      name: 'Master SVG Logo (Dark)',
      description: 'Official primary vertical lockup optimized for dark surfaces and applications.',
      type: 'logos',
      dimensions: '600 × 660 px',
      bgType: 'dark',
      renderFn: () => renderLogoContent({ bg: '#000000', text: '#FFFFFF', accent: '#FFD400', frame: '#FFD400', textHub: '#FFD400', showTagline: true, layout: 'vertical' }),
    },
    {
      id: 'master-light',
      name: 'Light Mode Version',
      description: 'Clean high-contrast adaptation optimized for white or bright marketing materials.',
      type: 'logos',
      dimensions: '600 × 660 px',
      bgType: 'light',
      renderFn: () => renderLogoContent({ bg: '#FFFFFF', text: '#000000', accent: '#FFD400', frame: '#111111', textHub: '#000000', showTagline: true, layout: 'vertical' }),
    },
    {
      id: 'horizontal-dark',
      name: 'Horizontal Logo (Dark)',
      description: 'Wide format header layout for navigation rails, footers, and dashboard banners.',
      type: 'logos',
      dimensions: '850 × 360 px',
      bgType: 'dark',
      renderFn: () => renderLogoContent({ bg: '#000000', text: '#FFFFFF', accent: '#FFD400', frame: '#FFD400', textHub: '#FFD400', showTagline: true, layout: 'horizontal' }),
    },
    {
      id: 'horizontal-light',
      name: 'Horizontal Logo (Light)',
      description: 'Wide format landscape lockup styled for light mode surfaces.',
      type: 'logos',
      dimensions: '850 × 360 px',
      bgType: 'light',
      renderFn: () => renderLogoContent({ bg: '#FFFFFF', text: '#000000', accent: '#FFD400', frame: '#111111', textHub: '#000000', showTagline: true, layout: 'horizontal' }),
    },
    {
      id: 'monochrome',
      name: 'Monochrome Version',
      description: 'Pure high-contrast black-and-white asset for print, branding badges, or stamping.',
      type: 'logos',
      dimensions: '600 × 660 px',
      bgType: 'light',
      renderFn: () => renderLogoContent({ bg: '#FFFFFF', text: '#000000', accent: '#000000', frame: '#000000', textHub: '#000000', showTagline: true, layout: 'vertical' }),
    },
    {
      id: 'transparent-png-svg',
      name: 'Transparent Vector Logo',
      description: 'Alpha-channel cutout layout ideal for overlaying on complex UI patterns or custom cards.',
      type: 'logos',
      dimensions: '600 × 660 px',
      bgType: 'grid',
      renderFn: () => renderLogoContent({ bg: 'transparent', text: '#111111', accent: '#FFD400', frame: '#FFD400', textHub: '#111111', showTagline: true, layout: 'vertical' }),
    },
    {
      id: 'app-icon',
      name: 'App Icon / Favicon',
      description: 'Standalone geometric symbol with compact padding for system trays and launcher decks.',
      type: 'icons',
      dimensions: '512 × 512 px',
      bgType: 'dark',
      renderFn: () => renderLogoContent({ bg: '#000000', text: '#FFFFFF', accent: '#FFD400', frame: '#FFD400', textHub: '#FFD400', showTagline: false, layout: 'icon-only' }),
    },
    {
      id: 'social-media',
      name: 'Social Media / Avatar',
      description: 'High-contrast square avatar layout ideal for GitHub profile pictures, Twitter, or Discord.',
      type: 'icons',
      dimensions: '500 × 500 px',
      bgType: 'dark',
      renderFn: () => renderLogoContent({ bg: '#000000', text: '#FFFFFF', accent: '#FFD400', frame: '#FFD400', textHub: '#FFD400', showTagline: false, layout: 'icon-only' }),
    }
  ];

  const filteredAssets = activeTab === 'all' 
    ? assetsList 
    : assetsList.filter(a => a.type === activeTab);

  const getSvgString = (id: string): string => {
    // Generates the raw clean SVG code as a copyable string based on the asset ID
    const baseSvgHeader = `<?xml version="1.0" encoding="utf-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" `;
    const nPolygon = `<polygon points="165,150 195,110 245,110 245,240 355,380 355,110 435,110 435,370 405,410 355,410 355,280 245,140 245,410 165,410" `;
    const frame = `<path d="M 225,68 H 415 L 477,130 V 350 L 415,412 H 265" stroke-width="24" stroke-linejoin="miter" stroke-linecap="square" fill="none" `;
    const github = `<g id="github-badge"><circle cx="300" cy="190" r="35" fill="#FFD400" stroke="#000000" stroke-width="4" /><circle cx="300" cy="192" r="16" fill="#000000" /><path d="M 287,184 L 286,171 L 293,178 Z" fill="#000000" /><path d="M 313,184 L 314,171 L 307,178 Z" fill="#000000" /><path d="M 288,206 C 288,206 290,218 300,218 C 310,218 312,206 312,206 H 288 Z" fill="#000000" /><path d="M 288,212 Q 280,214 281,202" stroke="#000000" stroke-width="3.5" stroke-linecap="round" fill="none" /></g>`;

    if (id === 'app-icon' || id === 'social-media') {
      return `${baseSvgHeader}viewBox="0 0 600 500" width="512" height="512">\n  <rect width="600" height="500" fill="#000000" rx="16" />\n  <g transform="translate(0, 15)">\n    ${frame}stroke="#FFD400" />\n    ${nPolygon}fill="#FFFFFF" />\n    ${github}\n  </g>\n</svg>`;
    }
    
    if (id === 'horizontal-dark' || id === 'horizontal-light') {
      const isLight = id === 'horizontal-light';
      return `${baseSvgHeader}viewBox="0 0 850 360" width="850" height="360">\n  <rect width="850" height="360" fill="${isLight ? '#FFFFFF' : '#000000'}" rx="16" />\n  <g transform="translate(-40, -40) scale(0.72)">\n    ${frame}stroke="${isLight ? '#111111' : '#FFD400'}" />\n    ${nPolygon}fill="${isLight ? '#000000' : '#FFFFFF'}" />\n    ${github.replace(/#000000/g, isLight ? '#FFFFFF' : '#000000')}\n  </g>\n  <g transform="translate(320, 160)">\n    <text x="0" y="30" font-family="'Space Grotesk', sans-serif" font-weight="800" font-size="105" letter-spacing="-4">\n      <tspan fill="${isLight ? '#000000' : '#FFFFFF'}">Next</tspan>\n      <tspan fill="${isLight ? '#000000' : '#FFD400'}">Hub</tspan>\n    </text>\n    <text x="4" y="95" fill="${isLight ? '#000000' : '#FFFFFF'}" font-family="'Space Grotesk', sans-serif" font-weight="700" font-size="16" letter-spacing="6">DISCOVER <tspan fill="#FFD400">•</tspan> CONNECT <tspan fill="#FFD400">•</tspan> COLLABORATE</text>\n  </g>\n</svg>`;
    }

    const isLight = id === 'master-light' || id === 'monochrome';
    const isMono = id === 'monochrome';
    const isTrans = id === 'transparent-png-svg';
    
    const bgColor = isTrans ? 'transparent' : (isLight ? '#FFFFFF' : '#000000');
    const txtColor = isLight ? '#000000' : '#FFFFFF';
    const actColor = isMono ? '#000000' : '#FFD400';
    const frmColor = isMono ? '#000000' : (isLight ? '#111111' : '#FFD400');
    const hubColor = isMono ? '#000000' : (isLight ? '#000000' : '#FFD400');

    return `${baseSvgHeader}viewBox="0 0 600 660" width="600" height="660">\n  ${isTrans ? '' : `<rect width="600" height="660" fill="${bgColor}" rx="24" />`}\n  <g transform="translate(0, 20)">\n    ${frame}stroke="${frmColor}" />\n    ${nPolygon}fill="${txtColor}" />\n    ${github.replace(/#FFD400/g, actColor).replace(/#000000/g, bgColor === 'transparent' ? '#111111' : bgColor)}\n  </g>\n  <text x="300" y="500" text-anchor="middle" font-family="'Space Grotesk', sans-serif" font-weight="800" font-size="76" letter-spacing="-3">\n    <tspan fill="${txtColor}">Next</tspan>\n    <tspan fill="${hubColor}">Hub</tspan>\n  </text>\n  <g>\n    <line x1="120" y1="540" x2="275" y2="540" stroke="${actColor}" stroke-width="3" />\n    <polygon points="308,540 304,547 296,547 292,540 296,533 304,533" fill="${actColor}" stroke="${actColor}" stroke-width="2" />\n    <line x1="325" y1="540" x2="480" y2="540" stroke="${actColor}" stroke-width="3" />\n  </g>\n  <text x="304" y="585" text-anchor="middle" fill="${txtColor}" font-family="'Space Grotesk', sans-serif" font-weight="700" font-size="13.5" letter-spacing="6">DISCOVER <tspan fill="${actColor}" font-weight="900">•</tspan> CONNECT <tspan fill="${actColor}" font-weight="900">•</tspan> COLLABORATE</text>\n</svg>`;
  };

  const handleCopyCode = (id: string) => {
    const svgCode = getSvgString(id);
    navigator.clipboard.writeText(svgCode);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSvg = (id: string, name: string) => {
    const svgCode = getSvgString(id);
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="brand-center-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-[#090909]/90 backdrop-blur-md p-4 overflow-y-auto">
          
          <motion.div 
            initial={{ scale: 0.95, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
            className="bg-[#111111] border border-white/10 rounded-[28px] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]"
          >
            {/* Header section with branding background */}
            <div className="bg-[#171717] p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#FFD400]" />
              
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 text-[#FFD400] border border-white/10 rounded-lg font-mono text-[9px] font-bold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>BRAND GUIDELINES SYSTEM</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight leading-none">
                  NEXT<span className="text-[#FFD400]">HUB</span> ASSET SUITE
                </h2>
                <p className="text-neutral-400 text-xs md:text-sm max-w-2xl font-mono leading-relaxed">
                  Interactive media kit containing vector-perfect, production-ready brand logo packages for the NextHub platform. Scalable to billboard sizes with geometric precision.
                </p>
              </div>

              <button 
                onClick={onClose}
                className="bg-neutral-800 hover:bg-neutral-700 text-white border border-white/10 p-3 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer self-start md:self-center"
              >
                <X className="w-5 h-5 stroke-[2.5px]" />
              </button>
            </div>

            {/* Filter tab bar */}
            <div className="bg-[#111111] px-8 py-4 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {(['all', 'logos', 'icons', 'specs'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 border rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer hover:translate-y-[-1px] ${
                      activeTab === tab 
                        ? 'bg-[#FFD400] text-[#090909] border-[#FFD400] font-extrabold' 
                        : 'bg-white/5 text-neutral-300 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'all' ? '🔍 ALL ASSETS' : tab === 'logos' ? '🎨 WORDMARKS' : tab === 'icons' ? '🧱 ICONS & FAVICONS' : '📐 BRAND SPECS'}
                  </button>
                ))}
              </div>
              
              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-mono font-bold text-neutral-500">
                  FORMAT: VECTOR SVG • RESPONSIVE CANVAS
                </span>
              </div>
            </div>

            {/* Modal Body Container */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#090909] max-h-[60vh]">
              
              {activeTab !== 'specs' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredAssets.map((asset) => (
                    <div 
                      key={asset.id}
                      className="bg-[#171717] border border-white/8 rounded-[24px] overflow-hidden flex flex-col shadow-xl hover:border-white/20 transition-all"
                    >
                      {/* Logo Preview Canvas */}
                      <div 
                        className={`h-64 flex items-center justify-center p-8 border-b border-white/5 relative select-none ${
                          asset.bgType === 'dark' ? 'bg-[#000000]' : 
                          asset.bgType === 'light' ? 'bg-white' : 
                          'bg-[#111111] bg-[radial-gradient(rgba(255,255,255,0.06)_1.5px,transparent_1.5px)] [background-size:16px_16px]'
                        }`}
                      >
                        {/* Background watermarks or size grids */}
                        <div className="absolute top-3 left-3 px-2 py-0.5 border border-white/10 bg-black/40 rounded font-mono text-[8px] font-bold text-neutral-400">
                          {asset.dimensions}
                        </div>
                        
                        <div className="w-full h-full max-w-[280px] max-h-[220px] flex items-center justify-center">
                          {asset.renderFn({ bg: asset.id.includes('transparent') ? 'transparent' : '', text: '', accent: '', frame: '', textHub: '', showTagline: true, layout: 'vertical' })}
                        </div>
                      </div>

                      {/* Details & Action Panel */}
                      <div className="p-5 flex-1 flex flex-col justify-between bg-[#171717]">
                        <div className="space-y-1.5 mb-4">
                          <h4 className="font-display font-extrabold text-base text-white uppercase tracking-wide">
                            {asset.name}
                          </h4>
                          <p className="text-neutral-400 font-mono text-[11px] leading-relaxed">
                            {asset.description}
                          </p>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => handleCopyCode(asset.id)}
                            className="flex-1 py-3 bg-[#111111] hover:bg-neutral-800 border border-white/10 text-white rounded-xl text-xs font-mono font-bold transition-all hover:border-white/20 active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {copiedId === asset.id ? (
                              <>
                                <Check className="w-4 h-4 text-green-400 stroke-[3px]" />
                                <span className="text-green-400 font-extrabold">COPIED VECTOR</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 text-neutral-300" />
                                <span>COPY SVG CODE</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDownloadSvg(asset.id, asset.name)}
                            className="py-3 px-5 bg-[#FFD400] hover:bg-white text-black font-extrabold rounded-xl text-xs font-mono transition-all active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Download className="w-4 h-4 stroke-[2.5px]" />
                            <span>DOWNLOAD</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Specs Sheet */
                <div className="bg-[#171717] border border-white/8 rounded-[24px] p-8 shadow-2xl space-y-8">
                  <div className="border-b border-white/5 pb-6">
                    <h3 className="font-display font-extrabold text-xl md:text-2xl uppercase tracking-wide text-white">
                      📐 BRAND SPECIFICATIONS & STYLE GUIDE
                    </h3>
                    <p className="text-neutral-400 font-mono text-xs mt-1">
                      Our official design guidelines and typographic variables to ensure consistent visual aesthetics across all platforms.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Color Palette Block */}
                    <div className="space-y-4">
                      <h4 className="font-display font-extrabold text-sm text-neutral-400 uppercase tracking-wider">
                        COLOR PALETTE
                      </h4>
                      
                      <div className="space-y-3 font-mono">
                        <div className="flex items-center justify-between p-3 border border-white/10 rounded-xl bg-[#000000] text-white">
                          <span className="font-bold">PRIMARY BLACK</span>
                          <span>#000000</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-white/10 rounded-xl bg-[#FFFFFF] text-[#000000]">
                          <span className="font-bold">PRIMARY WHITE</span>
                          <span>#FFFFFF</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-white/10 rounded-xl bg-[#FFD400] text-[#000000]">
                          <span className="font-bold">ACCENT YELLOW</span>
                          <span>#FFD400</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-white/10 rounded-xl bg-[#111111] text-white">
                          <span className="font-bold">SECONDARY DARK</span>
                          <span>#111111</span>
                        </div>
                      </div>
                    </div>

                    {/* Typography Block */}
                    <div className="space-y-4">
                      <h4 className="font-display font-extrabold text-sm text-neutral-400 uppercase tracking-wider">
                        TYPOGRAPHIC SYSTEM
                      </h4>
                      
                      <div className="p-5 border border-white/8 rounded-xl bg-[#111111] space-y-4 font-mono">
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase font-bold">Primary Display Font</span>
                          <p className="text-lg font-bold text-white">Space Grotesk / Geist / Satoshi</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase font-bold">Font Weight & Leading</span>
                          <p className="text-xs text-white">Font Weight: <span className="font-bold">800 (Extra Bold)</span> • Tracking: <span className="font-bold">Slightly Tight (-3%)</span></p>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase font-bold">Logo Text Colors</span>
                          <p className="text-xs text-white">
                            "Next" is styled in <span className="font-bold">Primary White</span>, and "Hub" in <span className="font-bold text-[#FFD400]">Accent Yellow (#FFD400)</span> with perfect baseline alignment.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logo Rules Grid */}
                  <div className="border-t border-white/5 pt-6 space-y-4">
                    <h4 className="font-display font-extrabold text-sm text-neutral-400 uppercase tracking-wider">
                      VISUAL ASSET PHILOSOPHY
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[11px] text-neutral-400 leading-relaxed">
                      <div className="p-4 border border-white/5 rounded-lg bg-[#111111]">
                        <span className="font-bold text-white block mb-1">1. HEAVY GEOMETRY</span>
                        The vector "N" is constructed with ultra-thick columns and custom 45-degree corner chamfers for an industrial, premium tech look.
                      </div>
                      <div className="p-4 border border-white/5 rounded-lg bg-[#111111]">
                        <span className="font-bold text-white block mb-1">2. DEV BADGES</span>
                        A minimal GitHub Cat silhouette is embedded inside the upper cavity of the "N" as a developer credential badge.
                      </div>
                      <div className="p-4 border border-white/5 rounded-lg bg-[#111111]">
                        <span className="font-bold text-white block mb-1">3. FLAT CONTRAST</span>
                        No gradients or opacities are permitted. We use 100% solid flat, highly saturated colors for ultimate clarity at 16px or billboard sizes.
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer with branding slogan */}
            <div className="bg-[#171717] px-8 py-4 border-t border-white/5 text-center flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-neutral-400 font-mono text-[10px] tracking-widest uppercase">
                NEXTHUB • REVOLUTIONIZING THE GITHUB TRADING CARD STANDARDS
              </span>
              <span className="px-3 py-1 bg-white/5 text-[#FFD400] border border-white/10 rounded-lg font-mono text-[9px] font-extrabold">
                DESIGN SUITE v2.0
              </span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
