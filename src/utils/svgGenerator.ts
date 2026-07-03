import { PlayerCardData } from '../types';

export function generateCardSvg(data: PlayerCardData): string {
  // Define Neo-Brutalist premium color schemes for different card grades
  let cardBg = '#FFFFFF';
  let cardBorder = '#111111';
  let primaryAccent = '#FFD93D'; // Accent Yellow (Default)
  let secondaryAccent = '#4D96FF'; // Accent Blue
  let headerBg = '#FF6B6B'; // Accent Red
  let badgeBg = '#6BCB77'; // Accent Green
  let cardShadowColor = '#111111';
  let cardBadgeText = 'LEAGUE ';

  switch (data.cardType) {
    case 'bronze':
      cardBg = '#FFF9EC';
      primaryAccent = '#E59866'; // Bronze/Orange
      secondaryAccent = '#D35400';
      headerBg = '#EDBB99';
      badgeBg = '#F5CBA7';
      cardBadgeText = 'BRONZE CLASS';
      break;

    case 'silver':
      cardBg = '#F2F3F4';
      primaryAccent = '#5D6D7E'; // Silver Slate
      secondaryAccent = '#4D96FF';
      headerBg = '#AEB6BF';
      badgeBg = '#D5D8DC';
      cardBadgeText = 'SILVER SQUAD';
      break;

    case 'gold':
      cardBg = '#FFFFFF';
      primaryAccent = '#FFD93D'; // Vivid Golden Yellow
      secondaryAccent = '#9D4EDD';
      headerBg = '#F4D03F';
      badgeBg = '#F7DC6F';
      cardBadgeText = 'GOLD ELITE';
      break;

    case 'special':
      cardBg = '#FFF2F2';
      primaryAccent = '#FF6B6B'; // Deep Red
      secondaryAccent = '#9D4EDD'; // Purple
      headerBg = '#FF8B8B';
      badgeBg = '#E8DAEF';
      cardBadgeText = 'SPECIAL EX';
      break;

    case 'toty': // Team of the Year
      cardBg = '#F4EEFF';
      primaryAccent = '#9D4EDD'; // Intense Purple
      secondaryAccent = '#FFD93D'; // Gold
      headerBg = '#D2B4DE';
      badgeBg = '#BB8FCE';
      cardBadgeText = 'TOTY SQUAD';
      break;

    case 'icon': // Legendary Icon
      cardBg = '#FFFFFF';
      primaryAccent = '#111111'; // Stark Black
      secondaryAccent = '#FF6B6B'; // Bold Hinomaru Red
      headerBg = '#E5E7EB';
      badgeBg = '#FFD93D';
      cardBadgeText = 'LEGEND ICON';
      break;
  }

  // Escape XML characters
  const cleanName = data.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').toUpperCase();
  const cleanUsername = data.username.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const cleanArchetype = data.archetype.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').toUpperCase();

  const flagUrl = `https://flagcdn.com/w80/${data.country.toLowerCase()}.png`;

  // Metric formatter helper
  const formatMetric = (val: number): string => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (val >= 1000) {
      return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return val.toString();
  };

  // Font and size adjustments to ensure absolutely NO overlaps
  let nameFontSize = 26;
  if (cleanName.length > 14) nameFontSize = 20;
  if (cleanName.length > 18) nameFontSize = 16;
  if (cleanName.length > 24) nameFontSize = 13;
  if (cleanName.length > 30) nameFontSize = 10;

  let usernameFontSize = 13;
  if (cleanUsername.length > 12) usernameFontSize = 11;
  if (cleanUsername.length > 16) usernameFontSize = 9.5;
  if (cleanUsername.length > 20) usernameFontSize = 8;

  let archFontSize = 12;
  if (cleanArchetype.length > 18) archFontSize = 10;
  if (cleanArchetype.length > 24) archFontSize = 8.5;
  if (cleanArchetype.length > 30) archFontSize = 7.5;

  // Dynamically calculate width of the username sticker based on length to guarantee no text boundary overflow
  const stickerWidth = Math.max(100, Math.min(180, cleanUsername.length * 7.5 + 24));
  const usernameXTranslate = 319 - stickerWidth;

  return `<svg width="375" height="600" viewBox="0 0 375 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Fonts -->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&amp;family=Plus+Jakarta+Sans:wght@700;800&amp;family=JetBrains+Mono:wght@700&amp;display=swap');
      
      .display-bold { font-family: 'Space Grotesk', sans-serif; font-weight: 800; }
      .display-medium { font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
      .sans-bold { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; }
      .mono-bold { font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    </style>

    <!-- Clip Path for the avatar window inside a thick brutalist box -->
    <clipPath id="avatarClip">
      <rect x="145" y="45" width="185" height="205" rx="12" ry="12" />
    </clipPath>
  </defs>

  <!-- Hard Offset Neo-Brutalist Shadow (Solid pure black rectangle) -->
  <rect x="23" y="23" width="342" height="562" rx="24" ry="24" fill="${cardBorder}" />

  <!-- Main Card Body Frame -->
  <rect x="15" y="15" width="342" height="562" rx="24" ry="24" fill="${cardBg}" stroke="${cardBorder}" stroke-width="4" />

  <!-- Plus Signs on Card Corners for Tech blueprint visual detail -->
  <g stroke="${cardBorder}" stroke-width="2" opacity="0.8">
    <path d="M 25,25 L 35,25 M 30,20 L 30,30" />
    <path d="M 340,25 L 350,25 M 345,20 L 345,30" />
    <path d="M 25,565 L 35,565 M 30,560 L 30,570" />
    <path d="M 340,565 L 350,565 M 345,560 L 345,570" />
  </g>

  <!-- LEFT BAR: Bold rating block and Flag stamp -->
  <g transform="translate(30, 45)">
    <!-- OVR Rating Bubble (Oversized Badge with solid background & thick borders) -->
    <rect x="-2" y="-2" width="64" height="84" rx="16" fill="${primaryAccent}" stroke="${cardBorder}" stroke-width="4" />
    <text x="30" y="48" class="display-bold" font-size="44" fill="${cardBorder}" text-anchor="middle" letter-spacing="-2">${data.overallRating}</text>
    
    <!-- Position Sub-badge inside OVR bubble -->
    <rect x="6" y="54" width="48" height="20" rx="6" fill="${cardBg}" stroke="${cardBorder}" stroke-width="2.5" />
    <text x="30" y="68" class="mono-bold" font-size="10" fill="${cardBorder}" text-anchor="middle">${data.position}</text>

    <!-- Country Flag badge styled to look physical -->
    <g transform="translate(5, 105)">
      <rect x="-2" y="-2" width="54" height="34" rx="8" fill="#FFFFFF" stroke="${cardBorder}" stroke-width="3.5" />
      <image href="${flagUrl}" x="1" y="1" width="48" height="28" preserveAspectRatio="none" clip-path="inset(0% 0% 0% 0% round 5px)"/>
    </g>

    <!-- Class Tag Badge (Brutalist ribbon label) -->
    <g transform="translate(0, 158)">
      <rect x="-2" y="-2" width="64" height="24" rx="8" fill="${badgeBg}" stroke="${cardBorder}" stroke-width="3" />
      <text x="30" y="13" class="mono-bold" font-size="8" fill="${cardBorder}" text-anchor="middle" letter-spacing="0.5">GRADE</text>
      <text x="30" y="21" class="mono-bold" font-size="7" fill="${cardBorder}" text-anchor="middle" letter-spacing="0.5">S-26</text>
    </g>

    <!-- Star stickers as high-end visual accents -->
    <g transform="translate(14, 212)" stroke="${cardBorder}" stroke-width="2.5" fill="${secondaryAccent}">
      <!-- Star polygon path -->
      <polygon points="15,0 18,9 28,9 20,15 23,24 15,18 7,24 10,15 2,9 12,9" />
    </g>
  </g>

  <!-- RIGHT PLAYER IMAGE WINDOW: Placed inside a thick brutalist box with offset shadow -->
  <g>
    <!-- Solid Black Frame Shadow -->
    <rect x="148" y="48" width="185" height="205" rx="14" ry="14" fill="${cardBorder}" />
    <!-- Main Frame Border -->
    <rect x="145" y="45" width="185" height="205" rx="14" ry="14" fill="#FFFFFF" stroke="${cardBorder}" stroke-width="4" />

    <!-- Circular Japanese Motif Sun inside -->
    <circle cx="237" cy="147" r="55" fill="${primaryAccent}" stroke="${cardBorder}" stroke-width="3" />

    <!-- Avatar cropped with high contrast outline inside clip path -->
    <image href="${data.avatarUrl}" x="145" y="45" width="185" height="205" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarClip)" />
    
    <!-- Outer Image Clip Frame Border Overlap for safety -->
    <rect x="145" y="45" width="185" height="205" rx="14" ry="14" fill="none" stroke="${cardBorder}" stroke-width="4" />
  </g>

  <!-- PLAYER DETAILS CONTAINER (Name, Handle) -->
  <g transform="translate(30, 275)">
    <!-- Flat background badge for the name to look like a bold label tag -->
    <rect x="-2" y="-2" width="319" height="54" rx="14" fill="${headerBg}" stroke="${cardBorder}" stroke-width="4" />
    <text x="16" y="34" class="sans-bold" font-size="${nameFontSize}" fill="${cardBorder}" letter-spacing="0.5">${cleanName}</text>
    
    <!-- Float sticker for username -->
    <g transform="translate(${usernameXTranslate}, -14)">
      <rect x="-2" y="-2" width="${stickerWidth}" height="26" rx="8" fill="${secondaryAccent}" stroke="${cardBorder}" stroke-width="3" />
      <text x="${stickerWidth / 2}" y="15" class="mono-bold" font-size="${usernameFontSize}" fill="#FFFFFF" text-anchor="middle">@${cleanUsername}</text>
    </g>
  </g>

  <!-- STATS GRID: Thick structured brutalist sub-boxes -->
  <g transform="translate(30, 350)">
    
    <!-- STAT 1: COD (Commits) -->
    <g transform="translate(0, 0)">
      <!-- Hard Shadow -->
      <rect x="3" y="3" width="149" height="42" rx="10" fill="${cardBorder}" />
      <!-- Main Stat Card -->
      <rect x="0" y="0" width="149" height="42" rx="10" fill="#FFFFFF" stroke="${cardBorder}" stroke-width="3" />
      <text x="12" y="27" class="display-bold" font-size="22" fill="${cardBorder}">${data.stats.cod}</text>
      <text x="50" y="25" class="mono-bold" font-size="11" fill="${cardBorder}">COD</text>
      <!-- Sub value metric -->
      <rect x="92" y="11" width="48" height="20" rx="5" fill="${badgeBg}" stroke="${cardBorder}" stroke-width="2" />
      <text x="116" y="24" class="mono-bold" font-size="8" fill="${cardBorder}" text-anchor="middle">${formatMetric(data.rawStats.commits)}</text>
    </g>

    <!-- STAT 2: CRE (Pull Requests) -->
    <g transform="translate(166, 0)">
      <!-- Hard Shadow -->
      <rect x="3" y="3" width="149" height="42" rx="10" fill="${cardBorder}" />
      <!-- Main Stat Card -->
      <rect x="0" y="0" width="149" height="42" rx="10" fill="#FFFFFF" stroke="${cardBorder}" stroke-width="3" />
      <text x="12" y="27" class="display-bold" font-size="22" fill="${cardBorder}">${data.stats.cre}</text>
      <text x="50" y="25" class="mono-bold" font-size="11" fill="${cardBorder}">CRE</text>
      <!-- Sub value metric -->
      <rect x="92" y="11" width="48" height="20" rx="5" fill="${primaryAccent}" stroke="${cardBorder}" stroke-width="2" />
      <text x="116" y="24" class="mono-bold" font-size="8" fill="${cardBorder}" text-anchor="middle">${formatMetric(data.rawStats.prs)} PR</text>
    </g>

    <!-- STAT 3: TEC (Languages) -->
    <g transform="translate(0, 56)">
      <!-- Hard Shadow -->
      <rect x="3" y="3" width="149" height="42" rx="10" fill="${cardBorder}" />
      <!-- Main Stat Card -->
      <rect x="0" y="0" width="149" height="42" rx="10" fill="#FFFFFF" stroke="${cardBorder}" stroke-width="3" />
      <text x="12" y="27" class="display-bold" font-size="22" fill="${cardBorder}">${data.stats.tec}</text>
      <text x="50" y="25" class="mono-bold" font-size="11" fill="${cardBorder}">TEC</text>
      <!-- Sub value metric -->
      <rect x="92" y="11" width="48" height="20" rx="5" fill="${secondaryAccent}" stroke="${cardBorder}" stroke-width="2" />
      <text x="116" y="24" class="mono-bold" font-size="8" fill="#FFFFFF" text-anchor="middle">${formatMetric(data.rawStats.languages.length)} LNG</text>
    </g>

    <!-- STAT 4: DEF (Issues Fixed) -->
    <g transform="translate(166, 56)">
      <!-- Hard Shadow -->
      <rect x="3" y="3" width="149" height="42" rx="10" fill="${cardBorder}" />
      <!-- Main Stat Card -->
      <rect x="0" y="0" width="149" height="42" rx="10" fill="#FFFFFF" stroke="${cardBorder}" stroke-width="3" />
      <text x="12" y="27" class="display-bold" font-size="22" fill="${cardBorder}">${data.stats.def}</text>
      <text x="50" y="25" class="mono-bold" font-size="11" fill="${cardBorder}">DEF</text>
      <!-- Sub value metric -->
      <rect x="92" y="11" width="48" height="20" rx="5" fill="${headerBg}" stroke="${cardBorder}" stroke-width="2" />
      <text x="116" y="24" class="mono-bold" font-size="8" fill="${cardBorder}" text-anchor="middle">${formatMetric(data.rawStats.issues)} ISS</text>
    </g>

    <!-- STAT 5: SPD (Contributions) -->
    <g transform="translate(0, 112)">
      <!-- Hard Shadow -->
      <rect x="3" y="3" width="149" height="42" rx="10" fill="${cardBorder}" />
      <!-- Main Stat Card -->
      <rect x="0" y="0" width="149" height="42" rx="10" fill="#FFFFFF" stroke="${cardBorder}" stroke-width="3" />
      <text x="12" y="27" class="display-bold" font-size="22" fill="${cardBorder}">${data.stats.spd}</text>
      <text x="50" y="25" class="mono-bold" font-size="11" fill="${cardBorder}">SPD</text>
      <!-- Sub value metric -->
      <rect x="92" y="11" width="48" height="20" rx="5" fill="${badgeBg}" stroke="${cardBorder}" stroke-width="2" />
      <text x="116" y="24" class="mono-bold" font-size="8" fill="${cardBorder}" text-anchor="middle">${formatMetric(data.rawStats.contributions)}</text>
    </g>

    <!-- STAT 6: PWR (Followers) -->
    <g transform="translate(166, 112)">
      <!-- Hard Shadow -->
      <rect x="3" y="3" width="149" height="42" rx="10" fill="${cardBorder}" />
      <!-- Main Stat Card -->
      <rect x="0" y="0" width="149" height="42" rx="10" fill="#FFFFFF" stroke="${cardBorder}" stroke-width="3" />
      <text x="12" y="27" class="display-bold" font-size="22" fill="${cardBorder}">${data.stats.pwr}</text>
      <text x="50" y="25" class="mono-bold" font-size="11" fill="${cardBorder}">PWR</text>
      <!-- Sub value metric -->
      <rect x="92" y="11" width="48" height="20" rx="5" fill="${primaryAccent}" stroke="${cardBorder}" stroke-width="2" />
      <text x="116" y="24" class="mono-bold" font-size="8" fill="${cardBorder}" text-anchor="middle">${formatMetric(data.rawStats.followers)}</text>
    </g>
  </g>

  <!-- FOOTER BLOCK: Archetype and ID Label with thick divider -->
  <g transform="translate(30, 520)">
    <!-- Dividing Line -->
    <line x1="0" y1="0" x2="315" y2="0" stroke="${cardBorder}" stroke-width="4" />
    
    <!-- Archetype label stamp -->
    <rect x="0" y="10" width="315" height="32" rx="8" fill="${badgeBg}" stroke="${cardBorder}" stroke-width="3" />
    <text x="12" y="31" class="mono-bold" font-size="11" fill="${cardBorder}">ARCHETYPE:</text>
    <text x="95" y="31" class="display-bold" font-size="${archFontSize}" fill="${cardBorder}">${cleanArchetype}</text>

    <!-- Cute Neo-Brutalist Sticker on lower right corner -->
    <text x="315" y="-10" class="mono-bold" font-size="8" fill="${cardBorder}" opacity="0.6" text-anchor="end">DECK ID: #${data.overallRating}${data.position}</text>
  </g>
</svg>`;
}
