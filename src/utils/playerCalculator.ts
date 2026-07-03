import { PlayerCardData, PlayerStats } from '../types';

// Deterministic hash based on username to seed stats when live stats are unavailable or for procedural padding
function getUsernameSeed(username: string): number {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Map country names or codes to standard ISO codes
export function getCountryCode(location: string | null, override?: string | null): { code: string; name: string } {
  if (override) {
    const cleanOverride = override.trim().toUpperCase();
    if (cleanOverride.length === 2) {
      return { code: cleanOverride.toLowerCase(), name: cleanOverride };
    }
  }

  if (!location) {
    return { code: 'un', name: 'Global' }; // Unknown / United Nations
  }

  const loc = location.toLowerCase();
  
  const countryMap: { [key: string]: { code: string; name: string } } = {
    'algeria': { code: 'dz', name: 'Algeria' },
    'dz': { code: 'dz', name: 'Algeria' },
    'usa': { code: 'us', name: 'United States' },
    'united states': { code: 'us', name: 'United States' },
    'america': { code: 'us', name: 'United States' },
    'california': { code: 'us', name: 'United States' },
    'new york': { code: 'us', name: 'United States' },
    'uk': { code: 'gb', name: 'United Kingdom' },
    'united kingdom': { code: 'gb', name: 'United Kingdom' },
    'london': { code: 'gb', name: 'United Kingdom' },
    'england': { code: 'gb', name: 'United Kingdom' },
    'france': { code: 'fr', name: 'France' },
    'paris': { code: 'fr', name: 'France' },
    'germany': { code: 'de', name: 'Germany' },
    'deutschland': { code: 'de', name: 'Germany' },
    'india': { code: 'in', name: 'India' },
    'brazil': { code: 'br', name: 'Brazil' },
    'brasil': { code: 'br', name: 'Brazil' },
    'canada': { code: 'ca', name: 'Canada' },
    'japan': { code: 'jp', name: 'Japan' },
    'tokyo': { code: 'jp', name: 'Japan' },
    'australia': { code: 'au', name: 'Australia' },
    'spain': { code: 'es', name: 'Spain' },
    'espana': { code: 'es', name: 'Spain' },
    'italy': { code: 'it', name: 'Italy' },
    'italia': { code: 'it', name: 'Italy' },
    'china': { code: 'cn', name: 'China' },
    'ukraine': { code: 'ua', name: 'Ukraine' },
    'netherlands': { code: 'nl', name: 'Netherlands' },
    'holland': { code: 'nl', name: 'Netherlands' },
    'sweden': { code: 'se', name: 'Sweden' },
    'norway': { code: 'no', name: 'Norway' },
    'denmark': { code: 'dk', name: 'Denmark' },
    'finland': { code: 'fi', name: 'Finland' },
    'switzerland': { code: 'ch', name: 'Switzerland' },
    'singapore': { code: 'sg', name: 'Singapore' },
    'indonesia': { code: 'id', name: 'Indonesia' },
    'malaysia': { code: 'my', name: 'Malaysia' },
    'vietnam': { code: 'vn', name: 'Vietnam' },
    'philippines': { code: 'ph', name: 'Philippines' },
    'mexico': { code: 'mx', name: 'Mexico' },
    'argentina': { code: 'ar', name: 'Argentina' },
    'colombia': { code: 'co', name: 'Colombia' },
    'nigeria': { code: 'ng', name: 'Nigeria' },
    'egypt': { code: 'eg', name: 'Egypt' },
    'morocco': { code: 'ma', name: 'Morocco' },
    'turkey': { code: 'tr', name: 'Turkey' },
    'turkiye': { code: 'tr', name: 'Turkey' },
    'russia': { code: 'ru', name: 'Russia' },
    'poland': { code: 'pl', name: 'Poland' },
    'south korea': { code: 'kr', name: 'South Korea' },
    'korea': { code: 'kr', name: 'South Korea' },
    'ireland': { code: 'ie', name: 'Ireland' },
    'new zealand': { code: 'nz', name: 'New Zealand' },
    'portugal': { code: 'pt', name: 'Portugal' },
    'belgium': { code: 'be', name: 'Belgium' },
    'austria': { code: 'at', name: 'Austria' },
    'greece': { code: 'gr', name: 'Greece' },
    'pakistan': { code: 'pk', name: 'Pakistan' },
    'bangladesh': { code: 'bd', name: 'Bangladesh' },
  };

  for (const [key, val] of Object.entries(countryMap)) {
    if (loc.includes(key)) {
      return val;
    }
  }

  // Fallback to a clean two-letter guess or global
  const parts = location.split(',').map(p => p.trim());
  const lastPart = parts[parts.length - 1];
  if (lastPart && lastPart.length === 2) {
    return { code: lastPart.toLowerCase(), name: lastPart.toUpperCase() };
  }

  return { code: 'un', name: 'Global' };
}

// Normalize stat out of 99 using standard logarithmic scale & ceilings
function normalizeStat(val: number, minVal: number, maxVal: number): number {
  if (val <= minVal) return 30 + Math.floor(Math.random() * 10);
  
  // Logarithmic scaling so it's harder to get high ratings
  const ratio = Math.log(val - minVal + 1) / Math.log(maxVal - minVal + 1);
  const score = Math.round(35 + ratio * 64);
  return Math.min(99, Math.max(35, score));
}

export function calculatePlayerCard(
  username: string,
  userProfile: any,
  stats: PlayerStats,
  countryOverride?: string | null
): PlayerCardData {
  const seed = getUsernameSeed(username);

  // Parse location
  const countryData = getCountryCode(userProfile?.location || null, countryOverride);

  // 1. COD (Coding / Shooting): based on commits & contributions
  const codRaw = stats.commits + (stats.contributions * 0.2);
  const cod = normalizeStat(codRaw, 0, 1500);

  // 2. CRE (Creativity / Passing): based on PRs & repositories owned
  const creRaw = stats.prs * 8 + (userProfile?.public_repos || 0) * 3;
  const cre = normalizeStat(creRaw, 0, 300);

  // 3. TEC (Technical / Dribbling): based on stars & language variety
  const tecRaw = stats.stars * 5 + stats.languages.length * 15;
  const tec = normalizeStat(tecRaw, 0, 500);

  // 4. DEF (Defense / Defending): based on closed issues & reviews done
  const defRaw = stats.issues * 6 + stats.reviews * 12;
  const def = normalizeStat(defRaw, 0, 200);

  // 5. SPD (Speed / Pace): based on lifetime activity density, public gists, or calculated from account age vs total repos
  const yearsActive = Math.max(1, (new Date().getFullYear() - new Date(userProfile?.created_at || '2020-01-01').getFullYear()));
  const spdRaw = (stats.contributions + (userProfile?.public_gists || 0) * 10) / yearsActive;
  const spd = normalizeStat(spdRaw, 0, 800);

  // 6. PWR (Power / Physicality): based on followers and star backing
  const pwrRaw = (userProfile?.followers || 0) * 4 + stats.stars * 2;
  const pwr = normalizeStat(pwrRaw, 0, 1000);

  // Average of stats shapes the overall rating
  const averageStat = (cod + cre + tec + def + spd + pwr) / 6;
  
  // Boost/adjust overall slightly based on follower tier
  const followerBoost = Math.min(5, Math.floor(Math.log10((userProfile?.followers || 0) + 1) * 1.5));
  let overallRating = Math.round(averageStat + followerBoost);
  overallRating = Math.min(99, Math.max(45, overallRating));

  // Determine Card Finish based on overall
  let cardType: PlayerCardData['cardType'] = 'bronze';
  if (overallRating >= 96) {
    cardType = 'icon';
  } else if (overallRating >= 90) {
    cardType = 'toty';
  } else if (overallRating >= 85) {
    cardType = 'special';
  } else if (overallRating >= 75) {
    cardType = 'gold';
  } else if (overallRating >= 65) {
    cardType = 'silver';
  } else {
    cardType = 'bronze';
  }

  // Determine Position and Archetype based on stat profile
  const statsList = [
    { name: 'COD', val: cod, pos: 'ST', arch: 'Feature Machine' },
    { name: 'CRE', val: cre, pos: 'CAM', arch: 'Architect' },
    { name: 'TEC', val: tec, pos: 'LW', arch: 'Full-Stack Maestro' },
    { name: 'DEF', val: def, pos: 'CB', arch: 'The Code Defender' },
    { name: 'SPD', val: spd, pos: 'RW', arch: 'Speedster Developer' },
    { name: 'PWR', val: pwr, pos: 'CDM', arch: 'Community Icon' }
  ];

  // Sort descending by value
  statsList.sort((a, b) => b.val - a.val);
  const topStat = statsList[0];
  const secondStat = statsList[1];

  let position = topStat.pos;
  let archetype = topStat.arch;

  // Refined combinations
  if (topStat.name === 'COD' && secondStat.name === 'TEC') {
    position = 'ST';
    archetype = '10x Developer';
  } else if (topStat.name === 'CRE' && secondStat.name === 'DEF') {
    position = 'CM';
    archetype = 'Open Source Maintainer';
  } else if (topStat.name === 'DEF' && secondStat.name === 'PWR') {
    position = 'CB';
    archetype = 'Security Specialist';
  } else if (topStat.name === 'TEC' && secondStat.name === 'CRE') {
    position = 'CAM';
    archetype = 'System Architect';
  } else if (topStat.name === 'SPD' && secondStat.name === 'COD') {
    position = 'RW';
    archetype = 'Rapid Shipper';
  } else if (topStat.name === 'DEF' && stats.reviews > 10) {
    position = 'CB';
    archetype = 'Review Gatekeeper';
  }

  return {
    username: userProfile?.login || username,
    name: userProfile?.name || userProfile?.login || username,
    avatarUrl: userProfile?.avatar_url || `https://github.com/identicons/${username}.png`,
    bio: userProfile?.bio || 'An outstanding code athlete from the GitHub league.',
    country: countryData.code,
    countryName: countryData.name,
    overallRating,
    position,
    archetype,
    cardType,
    stats: { cod, cre, tec, def, spd, pwr },
    rawStats: stats,
    createdAt: new Date().toISOString()
  };
}

// Generate fully procedural deterministic stats for any username (seeded fallback)
export function generateProceduralStats(username: string): PlayerStats {
  const seed = getUsernameSeed(username);
  
  const commits = 20 + (seed % 1200);
  const stars = seed % 350;
  const prs = 5 + (seed % 120);
  const followers = seed % 450;
  const issues = seed % 180;
  const reviews = seed % 80;
  const contributions = commits + prs + issues;
  
  const allLanguages = ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Ruby', 'HTML', 'CSS', 'C++', 'Java', 'Kotlin', 'Swift', 'PHP'];
  const numLangs = 2 + (seed % 5);
  const languages: string[] = [];
  for (let i = 0; i < numLangs; i++) {
    const lang = allLanguages[(seed + i * 7) % allLanguages.length];
    if (!languages.includes(lang)) {
      languages.push(lang);
    }
  }

  return {
    commits,
    stars,
    prs,
    followers,
    issues,
    languages,
    contributions,
    reviews
  };
}

export function generateProceduralProfile(username: string): any {
  const seed = getUsernameSeed(username);
  const countries = ['Algeria', 'USA', 'Germany', 'United Kingdom', 'India', 'Canada', 'France', 'Brazil', 'Japan', 'Ukraine', 'Netherlands'];
  const country = countries[seed % countries.length];
  
  return {
    login: username,
    name: username.charAt(0).toUpperCase() + username.slice(1) + ' Code-Ath',
    avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`, // Nice robot avatar as backup
    bio: 'A passionate developer pushing code to production with absolute speed.',
    location: country,
    followers: seed % 450,
    public_repos: 5 + (seed % 65),
    public_gists: seed % 15,
    created_at: '2021-03-12T10:00:00Z'
  };
}
