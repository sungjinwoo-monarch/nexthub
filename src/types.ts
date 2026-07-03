export interface PlayerStats {
  commits: number;
  stars: number;
  prs: number;
  followers: number;
  issues: number;
  languages: string[];
  contributions: number;
  reviews: number;
}

export interface PlayerCardData {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  country: string; // ISO 2-letter code or country name
  countryName: string;
  overallRating: number;
  position: string;
  archetype: string;
  cardType: 'bronze' | 'silver' | 'gold' | 'special' | 'toty' | 'icon';
  stats: {
    cod: number; // Coding (Commits)
    cre: number; // Creativity (PRs)
    tec: number; // Technical (Stars/Languages)
    def: number; // Defense (Issues/Reviews)
    spd: number; // Speed (Frequency/Streaks)
    pwr: number; // Power (Followers/Influence)
  };
  rawStats: PlayerStats;
  createdAt: string;
}
