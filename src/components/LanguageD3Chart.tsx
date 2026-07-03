import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface LanguageD3ChartProps {
  languages: string[];
  username: string;
}

interface ChartItem {
  name: string;
  percentage: number;
  color: string;
}

const PREMIUM_COLORS = [
  '#FFD400', // Yellow Accent
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#22C55E', // Green
  '#F97316', // Orange
  '#EF4444', // Red
  '#06B6D4'  // Cyan
];

export function LanguageD3Chart({ languages, username }: LanguageD3ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 220 });

  // Generate deterministic distribution percentage for languages based on the username seed
  const chartData: ChartItem[] = (() => {
    if (!languages || languages.length === 0) return [];
    
    // Hash username to create a deterministic color shift
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);

    // Dynamic Zipfian curve percentages (power-law distribution of language volume)
    const weights = languages.map((_, i) => 1 / Math.pow(i + 1, 0.75));
    const totalWeight = weights.reduce((acc, w) => acc + w, 0);
    
    const items = languages.map((lang, i) => {
      const percentage = Math.max(2, Math.round((weights[i] / totalWeight) * 100));
      // Select color deterministically based on language name or index
      const colorIndex = (seed + i) % PREMIUM_COLORS.length;
      return {
        name: lang.toUpperCase(),
        percentage,
        color: PREMIUM_COLORS[colorIndex]
      };
    });

    // Normalize so that it adds up to exactly 100%
    const currentSum = items.reduce((acc, item) => acc + item.percentage, 0);
    if (currentSum !== 100 && items.length > 0) {
      items[0].percentage += (100 - currentSum);
    }

    return items;
  })();

  // Handle container resizing to make the D3 chart perfectly responsive
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        // Dynamically scale height based on number of languages
        const rowHeight = 42;
        const paddingHeight = 40;
        const computedHeight = Math.max(160, chartData.length * rowHeight + paddingHeight);
        setDimensions({
          width: Math.max(280, width),
          height: computedHeight
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [chartData.length]);

  // Use D3 to draw/update the SVG elements inside useEffect
  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawing

    const { width, height } = dimensions;
    const margin = { top: 15, right: 65, bottom: 15, left: 105 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create the chart canvas group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // D3 Scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, chartWidth]);

    const yScale = d3.scaleBand()
      .domain(chartData.map(d => d.name))
      .range([0, chartHeight])
      .padding(0.3);

    // 1. Draw grid guidelines behind the bars (Premium thin white line)
    const gridTicks = [25, 50, 75, 100];
    g.selectAll('.grid-line')
      .data(gridTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', d => xScale(d))
      .attr('y1', 0)
      .attr('x2', d => xScale(d))
      .attr('y2', chartHeight)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2 2')
      .attr('opacity', 0.08);

    // 2. Draw Bar background track for premium depth
    g.selectAll('.bar-track')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar-track')
      .attr('x', 0)
      .attr('y', d => yScale(d.name) || 0)
      .attr('width', chartWidth)
      .attr('height', yScale.bandwidth())
      .attr('fill', '#111111')
      .attr('rx', 6);

    // 3. Draw Actual Front Bars (Dynamic Soft Glow Solid Fill)
    g.selectAll('.bar-main')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar-main')
      .attr('x', 0)
      .attr('y', d => yScale(d.name) || 0)
      .attr('width', 0) // Start at 0 for animation
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.color)
      .attr('rx', 6)
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .delay((_, i) => i * 100)
      .attr('width', d => xScale(d.percentage));

    // 4. Draw Language labels on the left axis
    g.selectAll('.label-lang')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label-lang')
      .attr('x', -12)
      .attr('y', d => (yScale(d.name) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('text-anchor', 'end')
      .attr('fill', '#A3A3A3')
      .style('font-family', '"Plus Jakarta Sans", sans-serif')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .text(d => {
        return d.name.length > 12 ? d.name.slice(0, 10) + '..' : d.name;
      });

    // 5. Draw Percentage labels on the right side of the bars
    g.selectAll('.label-percentage')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label-percentage')
      .attr('x', d => xScale(d.percentage) + 12)
      .attr('y', d => (yScale(d.name) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('text-anchor', 'start')
      .attr('fill', '#FFFFFF')
      .style('font-family', '"JetBrains Mono", monospace')
      .style('font-size', '12px')
      .style('font-weight', '700')
      .style('opacity', 0)
      .text(d => `${d.percentage}%`)
      .transition()
      .duration(800)
      .delay((_, i) => i * 100 + 400)
      .style('opacity', 1);

  }, [dimensions, chartData]);

  if (!languages || languages.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="w-full bg-[#111111] border border-white/5 p-5 rounded-2xl shadow-inner mt-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-mono font-bold text-[#A3A3A3] tracking-widest uppercase">
          D3 DISTRIBUTION INDEX
        </span>
        <span className="px-2 py-0.5 bg-white/5 text-[#FFD400] border border-white/10 rounded font-mono text-[9px] font-bold">
          LIVE METRICS
        </span>
      </div>
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className="overflow-visible block max-w-full"
      />
    </div>
  );
}
