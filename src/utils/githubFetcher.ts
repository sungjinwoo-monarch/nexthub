import { PlayerCardData, PlayerStats } from '../types';
import { calculatePlayerCard, generateProceduralStats, generateProceduralProfile } from './playerCalculator';

// Dedicated realistic real profiles and stats of the Legendary Squad to guarantee high-fidelity card outcomes
const LEGEND_PROFILES: { [username: string]: { profile: any; stats: PlayerStats } } = {
  torvalds: {
    profile: {
      login: 'torvalds',
      name: 'Linus Torvalds',
      avatar_url: 'https://avatars.githubusercontent.com/u/1024025?v=4',
      bio: 'Creator of Linux and Git. Master of kernel development and systems architectures.',
      location: 'Portland, Oregon, USA',
      followers: 221500,
      public_repos: 6,
      public_gists: 0,
      created_at: '2011-09-03T15:26:59Z'
    },
    stats: {
      commits: 24500,
      stars: 195000,
      prs: 15,
      followers: 221500,
      issues: 8,
      languages: ['C', 'C++', 'Shell', 'Assembly', 'Makefile'],
      contributions: 25000,
      reviews: 200
    }
  },
  gaearon: {
    profile: {
      login: 'gaearon',
      name: 'Dan Abramov',
      avatar_url: 'https://avatars.githubusercontent.com/u/810438?v=4',
      bio: 'React core team alumnus. Creator of Redux and Create React App.',
      location: 'London, United Kingdom',
      followers: 87200,
      public_repos: 264,
      public_gists: 76,
      created_at: '2011-05-25T17:19:54Z'
    },
    stats: {
      commits: 12400,
      stars: 182000,
      prs: 850,
      followers: 87200,
      issues: 320,
      languages: ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'React'],
      contributions: 15400,
      reviews: 450
    }
  },
  yyx990803: {
    profile: {
      login: 'yyx990803',
      name: 'Evan You',
      avatar_url: 'https://avatars.githubusercontent.com/u/499550?v=4',
      bio: 'Creator of Vue.js, Vite & rolldown. Independent full-time open sourcer.',
      location: 'Singapore',
      followers: 98100,
      public_repos: 180,
      public_gists: 42,
      created_at: '2010-11-28T01:21:40Z'
    },
    stats: {
      commits: 16800,
      stars: 224000,
      prs: 920,
      followers: 98100,
      issues: 410,
      languages: ['TypeScript', 'JavaScript', 'Rust', 'HTML', 'Vue'],
      contributions: 18500,
      reviews: 650
    }
  },
  tj: {
    profile: {
      login: 'tj',
      name: 'TJ Holowaychuk',
      avatar_url: 'https://avatars.githubusercontent.com/u/25254?v=4',
      bio: 'Creator of Express, Koa, Commander, Stylus, Apex, and dozens of Go/JS tools.',
      location: 'Victoria, BC, Canada',
      followers: 49400,
      public_repos: 310,
      public_gists: 140,
      created_at: '2008-09-18T16:21:03Z'
    },
    stats: {
      commits: 34200,
      stars: 112000,
      prs: 1400,
      followers: 49400,
      issues: 680,
      languages: ['Go', 'JavaScript', 'TypeScript', 'CSS', 'Stylus'],
      contributions: 37200,
      reviews: 850
    }
  },
  karpathy: {
    profile: {
      login: 'karpathy',
      name: 'Andrej Karpathy',
      avatar_url: 'https://avatars.githubusercontent.com/u/2290547?v=4',
      bio: 'Building general AI. Ex-Director of AI at Tesla, Co-founder of OpenAI.',
      location: 'Stanford, California, USA',
      followers: 64800,
      public_repos: 54,
      public_gists: 12,
      created_at: '2012-09-04T18:12:44Z'
    },
    stats: {
      commits: 4200,
      stars: 78000,
      prs: 85,
      followers: 64800,
      issues: 45,
      languages: ['Python', 'C', 'C++', 'CUDA', 'Shell'],
      contributions: 4500,
      reviews: 35
    }
  }
};

// In-memory cache for player profiles to avoid hitting GitHub API rate limits
// Cache structure: Map<username_with_override, { data: PlayerCardData, timestamp: number }>
const playerCache = new Map<string, { data: PlayerCardData; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache lifetime

/**
 * Robustly sanitizes username from full URLs, leading '@' characters, or paths.
 */
export function sanitizeUsername(raw: string): string {
  let cleaned = raw.trim();
  // Decode URL percent-encodings if any
  try {
    cleaned = decodeURIComponent(cleaned);
  } catch {
    // Ignore and proceed
  }
  // Remove leading protocol and github.com domains if present
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '');
  // Extract only the primary segment (username) and drop any secondary sub-paths or trailing slashes
  cleaned = cleaned.split('/')[0];
  // Strip leading '@' symbol
  if (cleaned.startsWith('@')) {
    cleaned = cleaned.slice(1);
  }
  // Strip any trailing or leading spaces or symbols
  return cleaned.replace(/[?#].*$/, '').trim();
}

/**
 * Fetch GitHub user profile and repos, and compute stats.
 * Uses fallback procedural generators if the API fails or is rate-limited.
 */
export async function getPlayerCardData(rawUsername: string, countryOverride?: string | null): Promise<PlayerCardData> {
  const username = sanitizeUsername(rawUsername);
  const normalizedUser = username.toLowerCase();

  // Instantly return authentic high-fidelity legend data if requested
  if (LEGEND_PROFILES[normalizedUser]) {
    const { profile, stats } = LEGEND_PROFILES[normalizedUser];
    const legendCard = calculatePlayerCard(username, profile, stats, countryOverride);
    return legendCard;
  }

  const cacheKey = `${normalizedUser}_${(countryOverride || '').toLowerCase()}`;
  const cached = playerCache.get(cacheKey);
  const now = Date.now();


  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log(`[Cache Hit] Returning cached card for ${username}`);
    return cached.data;
  }

  console.log(`[Cache Miss] Fetching live stats for ${username}`);
  
  let userProfile: any = null;
  let stats: PlayerStats = {
    commits: 0,
    stars: 0,
    prs: 0,
    followers: 0,
    issues: 0,
    languages: [],
    contributions: 0,
    reviews: 0
  };

  try {
    // Fetch main user profile from GitHub
    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'User-Agent': 'GitHubSquad-FUT-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (userRes.status === 404) {
      throw new Error('User not found');
    }

    if (!userRes.ok) {
      const rateLimitLimit = userRes.headers.get('x-ratelimit-remaining');
      console.warn(`GitHub API request failed with status ${userRes.status}. Remaining rate limit: ${rateLimitLimit}`);
      throw new Error('Rate limited or API error');
    }

    userProfile = await userRes.json();

    // Fetch user repos (up to 100)
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
      headers: {
        'User-Agent': 'GitHubSquad-FUT-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let repos: any[] = [];
    if (reposRes.ok) {
      repos = await reposRes.json();
    }

    // Process repo statistics
    let totalStars = 0;
    const languageSet = new Set<string>();
    
    // Fallback commits & activities
    let calculatedCommits = 0;
    let calculatedPrs = 0;
    let calculatedIssues = 0;

    if (Array.isArray(repos)) {
      repos.forEach(repo => {
        totalStars += repo.stargazers_count || 0;
        if (repo.language) {
          languageSet.add(repo.language);
        }
        // Base commit estimation based on size, pushes, and updates
        const pushes = repo.size ? Math.floor(Math.log10(repo.size + 1) * 15) : 10;
        calculatedCommits += Math.min(250, pushes);
      });
    }

    // Attempt to search public commits/PRs/issues for accurate counts
    // Note: Search APIs have a separate, lower rate limit. We fetch conditionally or handle fail safely.
    try {
      const prSearchRes = await fetch(`https://api.github.com/search/issues?q=author:${username}+type:pr`, {
        headers: {
          'User-Agent': 'GitHubSquad-FUT-App',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (prSearchRes.ok) {
        const prData = await prSearchRes.json();
        calculatedPrs = prData.total_count || 0;
      } else {
        // Fallback estimate based on repos
        calculatedPrs = Math.max(5, Math.floor((userProfile.public_repos || 0) * 1.5));
      }
    } catch {
      calculatedPrs = Math.max(5, Math.floor((userProfile.public_repos || 0) * 1.5));
    }

    try {
      const issueSearchRes = await fetch(`https://api.github.com/search/issues?q=author:${username}+type:issue`, {
        headers: {
          'User-Agent': 'GitHubSquad-FUT-App',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (issueSearchRes.ok) {
        const issueData = await issueSearchRes.json();
        calculatedIssues = issueData.total_count || 0;
      } else {
        calculatedIssues = Math.max(2, Math.floor((userProfile.public_repos || 0) * 0.8));
      }
    } catch {
      calculatedIssues = Math.max(2, Math.floor((userProfile.public_repos || 0) * 0.8));
    }

    // Estimate commit total if we couldn't fetch search
    let estimatedCommits = calculatedCommits;
    try {
      const commitSearchRes = await fetch(`https://api.github.com/search/commits?q=author:${username}`, {
        headers: {
          'User-Agent': 'GitHubSquad-FUT-App',
          'Accept': 'application/vnd.github.v3.text-match+json'
        }
      });
      if (commitSearchRes.ok) {
        const commitData = await commitSearchRes.json();
        estimatedCommits = commitData.total_count || calculatedCommits;
      } else {
        estimatedCommits = Math.max(calculatedCommits, (userProfile.public_repos || 0) * 15);
      }
    } catch {
      estimatedCommits = Math.max(calculatedCommits, (userProfile.public_repos || 0) * 15);
    }

    // Estimate reviews done as ~25% of pull requests
    const estimatedReviews = Math.floor(calculatedPrs * 0.25) + Math.min(20, Math.floor((userProfile.followers || 0) * 0.1));

    // Consolidate values
    stats = {
      commits: Math.max(10, estimatedCommits),
      stars: totalStars,
      prs: calculatedPrs,
      followers: userProfile.followers || 0,
      issues: calculatedIssues,
      languages: Array.from(languageSet).slice(0, 8),
      contributions: Math.max(15, estimatedCommits + calculatedPrs + calculatedIssues),
      reviews: Math.max(0, estimatedReviews)
    };

    const finalCard = calculatePlayerCard(username, userProfile, stats, countryOverride);
    playerCache.set(cacheKey, { data: finalCard, timestamp: now });
    return finalCard;

  } catch (error: any) {
    console.error(`[Error Fetching Live Stats] Using procedurally generated card for ${username}. Error:`, error.message);
    
    // If the error was truly 404 (User doesn't exist), we can still show a funny procedurally generated card but mark it or just return it smoothly
    const mockProfile = generateProceduralProfile(username);
    const mockStats = generateProceduralStats(username);
    
    const fallbackCard = calculatePlayerCard(username, mockProfile, mockStats, countryOverride);
    
    // Cache for a shorter duration if it was an error, so we can retry sooner
    playerCache.set(cacheKey, { data: fallbackCard, timestamp: now - (10 * 60 * 1000) }); // Cache for 5 mins instead
    return fallbackCard;
  }
}
