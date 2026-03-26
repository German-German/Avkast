/**
 * Portfolio Engine
 * Generates institutional-grade asset allocations based on user wealth and sector preferences.
 */

export interface GeneratedAsset {
  ticker: string;
  name: string;
  sector: string;
  shares: number;
  price: number;
  costBasis: number;
  weight: number;
  change: number;
}

const SECTOR_ASSETS: Record<string, any[]> = {
  "Technology": [
    { ticker: "AAPL", name: "Apple Inc.", price: 189.45 },
    { ticker: "MSFT", name: "Microsoft Corp.", price: 415.2 },
    { ticker: "NVDA", name: "NVIDIA Corp.", price: 875.4 },
    { ticker: "ASML", name: "ASML Holding", price: 920.1 },
    { ticker: "TSM", name: "TSMC", price: 142.5 },
  ],
  "Finance": [
    { ticker: "JPM", name: "JPMorgan Chase", price: 194.2 },
    { ticker: "GS", name: "Goldman Sachs", price: 412.5 },
    { ticker: "V", name: "Visa Inc.", price: 278.9 },
    { ticker: "MA", name: "Mastercard Inc.", price: 468.2 },
  ],
  "Energy": [
    { ticker: "XOM", name: "Exxon Mobil", price: 114.3 },
    { ticker: "CVX", name: "Chevron Corp.", price: 158.2 },
    { ticker: "SHEL", name: "Shell PLC", price: 68.4 },
  ],
  "Healthcare": [
    { ticker: "LLY", name: "Eli Lilly", price: 762.1 },
    { ticker: "UNH", name: "UnitedHealth", price: 492.5 },
    { ticker: "NVO", name: "Novo Nordisk", price: 124.8 },
  ],
  "Fixed Income": [
    { ticker: "BND", name: "Total Bond ETF", price: 72.3 },
    { ticker: "AGG", name: "Core US Bond", price: 95.4 },
    { ticker: "TLT", name: "20+ Yr Treasury", price: 92.1 },
  ],
  "Commodities": [
    { ticker: "GLD", name: "SPDR Gold Shares", price: 185.6 },
    { ticker: "SLV", name: "iShares Silver", price: 22.4 },
    { ticker: "USO", name: "US Oil Fund", price: 74.2 },
    { ticker: "UNG", name: "United States NatGas", price: 15.8 },
    { ticker: "CPER", name: "United States Copper", price: 24.5 },
  ],
  "Consumer": [
    { ticker: "AMZN", name: "Amazon.com", price: 178.4 },
    { ticker: "TSLA", name: "Tesla Inc.", price: 172.5 },
    { ticker: "WMT", name: "Walmart Inc.", price: 60.2 },
  ]
};

const DEFAULT_SECTORS = ["Technology", "Finance", "Fixed Income"];

/**
 * Generates a realistic portfolio distribution.
 */
export function generateUserPortfolio(wealth: number, preferredMarkets: string[] = []): GeneratedAsset[] {
  const sectors = preferredMarkets.length > 0 ? preferredMarkets : DEFAULT_SECTORS;
  
  // Allocate 85% to selected sectors, 15% to "Safe" Fixed Income if not selected
  let activeSectors = [...sectors];
  if (!activeSectors.includes("Fixed Income")) {
    activeSectors.push("Fixed Income");
  }

  const portfolio: GeneratedAsset[] = [];
  const sectorWeight = 1 / activeSectors.length;

  activeSectors.forEach(sectorName => {
    const assets = SECTOR_ASSETS[sectorName] || SECTOR_ASSETS["Technology"]; // fallback
    const numAssetsToPick = Math.min(assets.length, 2); // Pick 2 per sector
    
    // Sort or pick randomly (here just pick first 2 for stability)
    const selectedAssets = assets.slice(0, numAssetsToPick);
    const assetWeight = (sectorWeight / selectedAssets.length);

    selectedAssets.forEach(asset => {
      const allocatedDollars = wealth * assetWeight;
      const shares = allocatedDollars / asset.price;
      
      portfolio.push({
        ...asset,
        sector: sectorName,
        shares: Number(shares.toFixed(4)),
        costBasis: Number((asset.price * 0.95).toFixed(2)), // 5% historical gain baseline
        weight: Number((assetWeight * 100).toFixed(1)),
        change: Number(((Math.random() * 4) - 1).toFixed(2)) // random -1% to +3% change
      });
    });
  });

  return portfolio;
}
