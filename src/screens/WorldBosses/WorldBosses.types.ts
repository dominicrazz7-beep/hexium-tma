export type WorldBossesProps = {
  hex: number;
  shards: number;
  tapPower: number;
  moduleEffects: {
    tapPowerBonus: number;
    hexMultiplierBonus: number;
    critChanceBonus: number;
  };
  artifactEffects: {
    tapPower: number;
    hexMultiplier: number;
    critChance: number;
    modulePower: number;
  };
  onNavigate: (screen: string, payload?: string) => void;
  dispatch: (action: any) => void;
};
