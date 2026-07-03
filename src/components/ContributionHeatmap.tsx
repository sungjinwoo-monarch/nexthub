import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Flame, Award, HelpCircle } from 'lucide-react';
import { PlayerCardData } from '../types';

interface ContributionHeatmapProps {
  playerData: PlayerCardData;
}

// Deterministic PRNG seeded by username
function createSeededRng(seedStr: string) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_SHORT = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];

export function ContributionHeatmap({ playerData }: ContributionHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    date: Date;
    count: number;
    level: number;
    x: number;
    y: number;
  } | null>(null);

  const { username, rawStats } = playerData;

  // Generate deterministic contribution dataset for the past year (53 weeks)
  const heatmapData = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 364); // 52 weeks ago
    
    // Align startDate to the nearest Sunday
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    const rng = createSeededRng(username);
    
    // Scale density based on actual stats
    const baseContributions = rawStats.contributions || 
      Math.max(50, Math.floor(rawStats.commits * 1.1 + rawStats.prs * 3.5 + rawStats.reviews * 2.5));
    
    const targetAvgPerDay = baseContributions / 365;

    const weeks: { date: Date; count: number; level: number }[][] = [];
    let currentDate = new Date(startDate);
    
    let generatedTotal = 0;
    let busiestDay = { date: new Date(), count: 0 };
    let currentStreak = 0;
    let maxStreak = 0;
    let activeDaysCount = 0;

    // Loop for 53 weeks
    for (let w = 0; w < 53; w++) {
      const weekDays: { date: Date; count: number; level: number }[] = [];
      
      for (let d = 0; d < 7; d++) {
        const dayDate = new Date(currentDate);
        
        // Ensure no contributions in the future
        if (dayDate > endDate) {
          weekDays.push({ date: dayDate, count: 0, level: -1 });
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        const rand = rng();
        
        // Add waving/seasonal trends (high and low periods)
        const wave = Math.sin(w / 4) * 0.4 + 0.6; // 0.2 to 1.0
        const dayOfWeekFactor = (d === 0 || d === 6) ? 0.3 : 1.0; // lower weekend activity
        
        const activityFactor = rand * wave * dayOfWeekFactor * (targetAvgPerDay * 2.8);
        
        let count = 0;
        let level = 0;

        if (activityFactor > 0.35) {
          activeDaysCount++;
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;

          if (activityFactor < 1.2) {
            count = Math.floor(rand * 2) + 1;
            level = 1;
          } else if (activityFactor < 2.5) {
            count = Math.floor(rand * 3) + 3;
            level = 2;
          } else if (activityFactor < 4.5) {
            count = Math.floor(rand * 4) + 6;
            level = 3;
          } else {
            count = Math.floor(rand * 6) + 10;
            level = 4;
          }
        } else {
          currentStreak = 0; // broken streak
          count = 0;
          level = 0;
        }

        generatedTotal += count;
        if (count > busiestDay.count) {
          busiestDay = { date: dayDate, count };
        }

        weekDays.push({ date: dayDate, count, level });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(weekDays);
    }

    return {
      weeks,
      generatedTotal,
      busiestDay,
      maxStreak,
      activeDaysPercent: Math.round((activeDaysCount / 365) * 100),
    };
  }, [username, rawStats]);

  // Determine label placement for months (approximate week indices for each month start)
  const monthLabels = useMemo(() => {
    const labels: { text: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    heatmapData.weeks.forEach((week, wIdx) => {
      // Check the first day of the week
      const month = week[0].date.getMonth();
      if (month !== lastMonth && week[0].date.getDate() <= 7) {
        labels.push({
          text: MONTHS_SHORT[month],
          weekIndex: wIdx
        });
        lastMonth = month;
      }
    });

    return labels;
  }, [heatmapData]);

  const getCellColor = (level: number) => {
    switch (level) {
      case -1:
        return 'bg-transparent border-transparent'; // future
      case 0:
        return 'bg-[#18181b]/60 border-white/5 hover:border-white/10'; // empty dark
      case 1:
        return 'bg-[#ffd400]/15 border-[#ffd400]/20 hover:bg-[#ffd400]/25'; // Level 1 (dim gold)
      case 2:
        return 'bg-[#ffd400]/40 border-[#ffd400]/40 hover:bg-[#ffd400]/50'; // Level 2 (mid gold)
      case 3:
        return 'bg-[#ffd400]/70 border-[#ffd400]/60 hover:bg-[#ffd400]/80'; // Level 3 (high gold)
      case 4:
        return 'bg-[#ffd400] border-[#ffd400] shadow-[0_0_8px_rgba(255,212,0,0.4)] hover:scale-[1.15]'; // Level 4 (signature gold glow)
      default:
        return 'bg-[#18181b]/60 border-white/5';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div 
      className="p-8 bg-[#111111] border border-white/5 rounded-[28px] shadow-2xl relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
    >
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#FFD400]/5 rounded-full blur-[40px] pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-[#FFD400]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-tight">
              Annual Activity Heatmap
            </h3>
            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mt-0.5">
              Deterministic Player Calendar (365-Day Cycle)
            </p>
          </div>
        </div>

        {/* Stats Summary Badges */}
        <div className="flex flex-wrap gap-2.5">
          <div className="px-3 py-1.5 bg-[#171717] border border-white/5 rounded-xl flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[#FFD400]" />
            <span className="text-[10px] font-mono text-neutral-400">STREAK:</span>
            <span className="text-[11px] font-mono font-bold text-white">{heatmapData.maxStreak} DAYS</span>
          </div>

          <div className="px-3 py-1.5 bg-[#171717] border border-white/5 rounded-xl flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-mono text-neutral-400">ACTIVE:</span>
            <span className="text-[11px] font-mono font-bold text-white">{heatmapData.activeDaysPercent}%</span>
          </div>
        </div>
      </div>

      {/* Calendar Heatmap Block */}
      <div className="relative">
        {/* Heatmap Layout with horizontal scroll */}
        <div className="overflow-x-auto scrollbar-thin pb-4 select-none relative">
          <div className="min-w-[640px] flex flex-col pt-2 pr-2">
            
            {/* Months Header Row */}
            <div className="flex h-5 font-mono text-[9px] text-neutral-500 font-semibold mb-1 ml-7 relative">
              {monthLabels.map((lbl, idx) => (
                <div 
                  key={idx} 
                  className="absolute" 
                  style={{ left: `${lbl.weekIndex * 11.5}px` }}
                >
                  {lbl.text.toUpperCase()}
                </div>
              ))}
            </div>

            {/* Heatmap Grid (7 Rows of Days) */}
            <div className="flex items-start">
              {/* Day Labels Column */}
              <div className="grid grid-rows-7 gap-[2px] pr-2 font-mono text-[8px] text-neutral-500 text-left h-[81px] w-7 justify-between leading-none pt-[3px]">
                {DAYS_SHORT.map((day, idx) => (
                  <span key={idx} className="h-[9px] flex items-center">{day}</span>
                ))}
              </div>

              {/* Grid of Weeks */}
              <div className="flex gap-[2px]">
                {heatmapData.weeks.map((week, wIdx) => (
                  <div key={wIdx} className="grid grid-rows-7 gap-[2px]">
                    {week.map((day, dIdx) => (
                      <div
                        key={dIdx}
                        onMouseEnter={(e) => {
                          if (day.level === -1) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            date: day.date,
                            count: day.count,
                            level: day.level,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-[9px] h-[9px] rounded-[2px] border transition-all duration-150 ${getCellColor(day.level)}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Floating Tooltip Component */}
        <AnimatePresence>
          {hoveredCell && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="fixed z-50 pointer-events-none bg-neutral-900 border border-white/10 px-3 py-2 rounded-xl shadow-xl flex flex-col gap-0.5 font-mono text-[10px] text-left"
              style={{
                left: hoveredCell.x,
                top: hoveredCell.y,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="text-white font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD400]" />
                <span>{hoveredCell.count === 0 ? 'No' : hoveredCell.count} Contributions</span>
              </div>
              <div className="text-neutral-400 text-[9px]">{formatDate(hoveredCell.date)}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Heatmap Footer Legend & Busiest Day Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6 pt-4 border-t border-white/5 font-mono text-[10px]">
        {/* Total Contributions & Busiest Day */}
        <div className="text-neutral-400 space-y-1">
          <div>
            TOTAL COMPILED YEARLY DECK VOLUME:{' '}
            <span className="text-white font-extrabold">{heatmapData.generatedTotal.toLocaleString()} CONTRIBUTIONS</span>
          </div>
          <div>
            PEAK ATHLETE TRAINING DAY:{' '}
            <span className="text-[#FFD400] font-bold">
              {heatmapData.busiestDay.count} IN{` `}
              {heatmapData.busiestDay.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 text-[9px]">LESS</span>
          <div className="flex gap-[2px]">
            <div className="w-[9px] h-[9px] rounded-[2px] border bg-[#18181b]/60 border-white/5" />
            <div className="w-[9px] h-[9px] rounded-[2px] border bg-[#ffd400]/15 border-[#ffd400]/20" />
            <div className="w-[9px] h-[9px] rounded-[2px] border bg-[#ffd400]/40 border-[#ffd400]/40" />
            <div className="w-[9px] h-[9px] rounded-[2px] border bg-[#ffd400]/70 border-[#ffd400]/60" />
            <div className="w-[9px] h-[9px] rounded-[2px] border bg-[#ffd400] border-[#ffd400]" />
          </div>
          <span className="text-neutral-500 text-[9px]">MORE</span>
        </div>
      </div>
    </motion.div>
  );
}
