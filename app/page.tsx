'use client';

import { BRAND_NAME, TAGLINE } from './config/brand';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RadarGridOverlay from './components/RadarGridOverlay';

export default function Home() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAnalysisMode, setIsAnalysisMode] = useState(false);
  const [showRadarGrid, setShowRadarGrid] = useState(false);
  const [originalChartOpacity, setOriginalChartOpacity] = useState(1);
  const [humanSilhouetteOpacity, setHumanSilhouetteOpacity] = useState(1);
  const router = useRouter();

  // Handle click on "Discover your signal" button
  const handleDiscoverClick = () => {
    setIsTransitioning(true);
    // Immediately trigger analysis mode and start fade out
    setIsAnalysisMode(true);
    setOriginalChartOpacity(0);
    setHumanSilhouetteOpacity(0);
    
    // Navigate to assessment page after short fade transition (1.5s)
    setTimeout(() => {
      router.push('/assessment?transition=true');
    }, 1500);
  };

  useEffect(() => {
    // Only create custom cursor on non-touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
      // Remove cursor-custom class on touch devices to show default cursor
      document.body.classList.remove('cursor-custom');
      return;
    }
    
    // Create cursor elements for desktop only
    const cursorMain = document.createElement('div');
    cursorMain.className = 'cursor-main';
    document.body.appendChild(cursorMain);
    
    const cursorRing = document.createElement('div');
    cursorRing.className = 'cursor-ring';
    document.body.appendChild(cursorRing);
    
    const trailDots: HTMLElement[] = [];
    
    // Create trail dots
    for (let i = 0; i < 4; i++) {
      const dot = document.createElement('div');
      dot.className = 'cursor-trail';
      dot.style.opacity = (0.6 - i * 0.12).toString();
      document.body.appendChild(dot);
      trailDots.push(dot);
    }
    
    const positions: Array<{x: number, y: number}> = [];
    let isHovering = false;
    
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      
      // Update main cursor
      cursorMain.style.left = x + 'px';
      cursorMain.style.top = y + 'px';
      
      // Update ring
      cursorRing.style.left = x + 'px';
      cursorRing.style.top = y + 'px';
      
      // Add current position to trail
      positions.unshift({ x, y });
      if (positions.length > 4) {
        positions.pop();
      }
      
      // Update trail dots
      trailDots.forEach((dot, index) => {
        if (positions[index]) {
          dot.style.left = positions[index].x + 'px';
          dot.style.top = positions[index].y + 'px';
        }
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON') {
        isHovering = true;
        cursorMain.style.background = 'rgba(217, 94, 64, 1)';
        cursorMain.style.transform = 'translate(-50%, -50%) scale(1.4)';
        cursorRing.style.borderColor = 'rgba(217, 94, 64, 0.6)';
        cursorRing.style.transform = 'translate(-50%, -50%) scale(1.5)';
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON') {
        isHovering = false;
        cursorMain.style.background = 'rgba(122, 140, 196, 0.9)';
        cursorMain.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorRing.style.borderColor = 'rgba(122, 140, 196, 0.4)';
        cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    
    return () => {
      if (!isTouchDevice) {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseover', handleMouseOver);
        document.removeEventListener('mouseout', handleMouseOut);
        
        // Clean up cursor elements only if they exist
        if (cursorMain && document.body.contains(cursorMain)) {
          document.body.removeChild(cursorMain);
        }
        if (cursorRing && document.body.contains(cursorRing)) {
          document.body.removeChild(cursorRing);
        }
        trailDots.forEach(dot => {
          if (document.body.contains(dot)) {
            document.body.removeChild(dot);
          }
        });
      }
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-[#f8f6f2] relative overflow-hidden cursor-custom">
      
      {/* Home page background SVG with texture */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <img 
          src="/home_page.svg" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        
        {/* Centered Human Signal Visualization - top section */}
        <div className="w-full flex items-center justify-center mb-12 sm:mb-16">
          <div 
            className="relative animate-signal-emerge"
            style={{
              opacity: originalChartOpacity,
              transition: 'opacity 1.5s ease-in-out'
            }}
          >
            {/* Outer aura - Violet with rotating and scaling animation - responsive sizing */}
            <div 
              className={`absolute w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] lg:w-[280px] lg:h-[280px] opacity-40 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 transition-all duration-500 ${isAnalysisMode ? 'analysis-mode-outer' : ''}`}
              style={{
                animation: isAnalysisMode 
                  ? 'auraFloatAnalysis 6s ease-in-out infinite, auraSpin 20s linear infinite'
                  : 'auraFloatSubtle 12s ease-in-out infinite, auraSpin 20s linear infinite'
              }}
            >
              <img 
                src="/outer-aura-violet.svg" 
                alt="" 
                className="w-full h-full object-contain"
                style={{
                  filter: 'blur(1px)'
                }}
              />
            </div>
            {/* Middle aura - Periwinkle with counter-rotating animation - responsive sizing */}
            <div 
              className={`absolute w-[170px] h-[170px] sm:w-[200px] sm:h-[200px] lg:w-[240px] lg:h-[240px] opacity-50 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 transition-all duration-500 ${isAnalysisMode ? 'analysis-mode-middle' : ''}`}
              style={{
                animation: isAnalysisMode
                  ? 'auraFloatAnalysis 5s ease-in-out infinite 1s, auraSpin -15s linear infinite'
                  : 'auraFloatSubtle 8s ease-in-out infinite 2s, auraSpin -15s linear infinite'
              }}
            >
              <img 
                src="/middle-aura-periwinkle.svg" 
                alt="" 
                className="w-full h-full object-contain"
                style={{
                  filter: 'blur(0.5px)'
                }}
              />
            </div>
            {/* Inner aura - Indigo with breathing effect - responsive sizing */}
            <div 
              className={`absolute w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] lg:w-[200px] lg:h-[200px] opacity-60 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 transition-all duration-500 ${isAnalysisMode ? 'analysis-mode-inner' : ''}`}
              style={{
                animation: isAnalysisMode
                  ? 'auraFloatAnalysis 4s ease-in-out infinite 2s'
                  : 'auraFloatSubtle 6s ease-in-out infinite 4s'
              }}
            >
              <img 
                src="/inner-aura-indigo.svg" 
                alt="" 
                className="w-full h-full object-contain"
                style={{
                  filter: 'blur(0.2px)'
                }}
              />
            </div>
            
            {/* Phase 3: Animated radar grid overlay - appears after aura analysis mode begins */}
            {showRadarGrid && (
              <RadarGridOverlay startAnimation={true} />
            )}
            {/* Human silhouette with ripple effects centered behind it - responsive sizing */}
            <div 
              className="relative flex items-center justify-center w-[200px] h-[160px] sm:w-[240px] sm:h-[190px] lg:w-[300px] lg:h-[240px] pointer-events-none"
              style={{
                opacity: humanSilhouetteOpacity,
                transition: 'opacity 1.5s ease-in-out'
              }}
            >
              
              {/* Ripple effect container - positioned absolutely to center properly */}
              <div className="absolute inset-0 flex items-center justify-center">
                
                {/* Aura rings rippling outward - smooth hardware accelerated */}
                <div 
                  className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full opacity-0"
                  style={{
                    background: 'radial-gradient(circle, rgba(75, 111, 168, 0.6) 0%, rgba(75, 111, 168, 0.1) 60%, transparent 100%)',
                    animation: 'auraRipple 3s ease-out infinite',
                    willChange: 'transform, opacity'
                  }}
                ></div>
                <div 
                  className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full opacity-0"
                  style={{
                    background: 'radial-gradient(circle, rgba(122, 140, 196, 0.5) 0%, rgba(122, 140, 196, 0.1) 60%, transparent 100%)',
                    animation: 'auraRipple 3s ease-out infinite 0.2s',
                    willChange: 'transform, opacity'
                  }}
                ></div>
                
                {/* Thin solid rings rippling outward - smooth hardware accelerated */}
                <div 
                  className="absolute w-16 h-16 sm:w-20 sm:h-20 border-[0.5px] border-[#4b6fa8] rounded-full opacity-0"
                  style={{
                    animation: 'ringRipple 3s ease-out infinite',
                    willChange: 'transform, opacity'
                  }}
                ></div>
                <div 
                  className="absolute w-16 h-16 sm:w-20 sm:h-20 border-[0.5px] border-[#7a8cc4] rounded-full opacity-0"
                  style={{
                    animation: 'ringRipple 3s ease-out infinite 0.1s',
                    willChange: 'transform, opacity'
                  }}
                ></div>
              </div>
              
              {/* Human silhouette - static, on top of ripples - responsive sizing */}
              <div className="relative z-10">
                <img 
                  src="/human.svg" 
                  alt="" 
                  className="w-auto h-[120px] sm:h-[140px] lg:h-[160px] object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 40px rgba(75, 111, 168, 0.3))'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Centered Brand messaging - bottom section */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="space-y-6 sm:space-y-8">
            
            {/* Main headline with wave entrance */}
            <div className={`animate-wave-text mb-4 ${isTransitioning ? 'fade-out-transition-1' : ''}`}>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-wide text-[#3a3a3a] leading-tight">
                {BRAND_NAME}
              </h1>
            </div>
            
            {/* Subtitle with fade entrance - reduced gap */}
            <div className={`animate-fade-in-elegant -mt-2 sm:-mt-4 ${isTransitioning ? 'fade-out-transition-2' : ''}`}>
              <p className="text-xl sm:text-2xl md:text-3xl font-normal text-[#3a3a3a] opacity-80 leading-relaxed">
                {TAGLINE}
              </p>
            </div>
            
            {/* Body copy with subtle slide */}
            <div className={`animate-content-rise ${isTransitioning ? 'fade-out-transition-3' : ''}`}>
              <p className="text-base sm:text-lg md:text-xl font-normal text-[#3a3a3a] opacity-70 leading-relaxed max-w-2xl mx-auto px-4 sm:px-0">
                Discover your unique health patterns through a living, visual representation that evolves with your wellness journey. Experience personalized insights that feel as individual as you are.
              </p>
            </div>
            
            {/* CTA button with signal pulse entrance */}
            <div className={`pt-4 sm:pt-6 animate-button-emerge ${isTransitioning ? 'fade-out-transition-4' : ''}`}>
              <button 
                onClick={handleDiscoverClick}
                className="inline-block w-full sm:w-auto border border-[#AE7401] text-[#AE7401] hover:bg-[#AE7401] hover:text-white font-normal px-4 py-2 rounded-full text-lg sm:text-xl transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(174,116,1,0.4)] text-center shadow-sm"
                disabled={isTransitioning}
              >
                Discover your signal
              </button>
            </div>
            
          </div>
        </div>
        
        {/* Subtle footer note */}
        <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center ${isTransitioning ? 'fade-out-transition-5' : ''}`}>
          <p className="text-sm text-[#3a3a3a] opacity-50">
            Interactive demo experience
          </p>
        </div>
      </main>
    </div>
  );
}