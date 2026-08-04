import type { EquippedModules, ModuleId, ReactorModule } from "../../game/reactorModules/reactorModulesData";

export type ReactorModulesScreenProps = {
  hex: number;
  shards: number;
  premium: number;
  reactorLevel: number;
  equipped: EquippedModules;
  onNavigate: (screen: string) => void;
  onEquipModule: (moduleId: ModuleId, slotIndex: 0 | 1 | 2) => void;
  onUnequipModule: (slotIndex: 0 | 1 | 2) => void;
  onPurchaseModule: (moduleId: ModuleId) => void;
};

export type ModuleCardProps = {
  module: ReactorModule;
  isOwned: boolean;
  isEquipped: boolean;
  canAfford: boolean;
  isUnlocked: boolean;
  onEquip?: (slotIndex: 0 | 1 | 2) => void;
  onUnequip?: () => void;
  onPurchase?: () => void;
  selectedSlot?: 0 | 1 | 2 | null;
};

export type SlotDisplayProps = {
  slotIndex: 0 | 1 | 2;
  module: ReactorModule | null;
  onUnequip: () => void;
  onSelect: () => void;
};

export type DailyComboProps = {
  combo: {
    date: string;
    modules: [ModuleId, ModuleId, ModuleId];
    bonus: { type: string; value: number };
    active: boolean;
  };
  equipped: EquippedModules;
  matchCount: number;
};
