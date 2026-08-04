import type { GameReward, HexiumGameState, InventoryItem } from "./hexiumTypes";

function rewardToInventoryItem(reward: GameReward, source = "system"): InventoryItem | null {
  if (reward.type === "case") {
    return {
      id: `${reward.caseType}-case`,
      name: `${reward.caseType.toUpperCase()} CASE`,
      type: "case",
      tab: "cases",
      rarity: reward.caseType === "quantum" ? "quantum" : reward.caseType === "exotic" ? "legendary" : reward.caseType === "premium" ? "epic" : reward.caseType === "advanced" ? "rare" : "common",
      amount: reward.amount,
      usable: true,
      equippable: false,
      source,
      description: `Кейс отримано з ${source}.`,
    };
  }

  if (reward.type === "boost") {
    return {
      id: reward.boostId,
      name: reward.boostId.replaceAll("-", " ").toUpperCase(),
      type: "boost",
      tab: "boosts",
      rarity: "rare",
      amount: reward.amount,
      usable: true,
      equippable: false,
      source,
      description: `Буст отримано з ${source}.`,
    };
  }

  if (reward.type === "bot_fragment") {
    return {
      id: `${reward.botId}-fragment`,
      name: `${reward.botId.replaceAll("-", " ").toUpperCase()} FRAGMENT`,
      type: "bot_fragment",
      tab: "bot_fragments",
      rarity: "rare",
      amount: reward.amount,
      usable: false,
      equippable: false,
      source,
      description: "Фрагмент для збору або прокачки HEX-BOT.",
    };
  }

  if (reward.type === "quantum_resource") {
    return {
      id: reward.resourceId,
      name: reward.resourceId.replace(/[A-Z]/g, m => ` ${m}`).toUpperCase(),
      type: "quantum_resource",
      tab: "quantum",
      rarity: "quantum",
      amount: reward.amount,
      usable: false,
      equippable: false,
      source,
      description: "Quantum ресурс для пізнього ендгейму.",
    };
  }

  if (["frame", "title", "badge", "skin"].includes(reward.type)) {
    const id = "frameId" in reward ? reward.frameId : "titleId" in reward ? reward.titleId : "badgeId" in reward ? reward.badgeId : "skinId" in reward ? reward.skinId : "cosmetic";
    return {
      id,
      name: id.replaceAll("-", " ").toUpperCase(),
      type: reward.type as InventoryItem["type"],
      tab: "cosmetics",
      rarity: "epic",
      amount: 1,
      usable: false,
      equippable: true,
      source,
      description: "Косметичний предмет профілю.",
    };
  }

  return null;
}

function addOrStackItem(items: InventoryItem[], item: InventoryItem): InventoryItem[] {
  const existing = items.find(current => current.id === item.id);
  if (!existing) return [...items, item];

  return items.map(current =>
    current.id === item.id
      ? { ...current, amount: current.amount + item.amount }
      : current,
  );
}

export function applyReward(state: HexiumGameState, reward: GameReward, source = "system"): HexiumGameState {
  if (reward.type === "hex") {
    return {
      ...state,
      currencies: { ...state.currencies, hex: state.currencies.hex + reward.amount },
      player: { ...state.player, totalHexMined: state.player.totalHexMined + reward.amount },
    };
  }

  if (reward.type === "shards") return { ...state, currencies: { ...state.currencies, shards: state.currencies.shards + reward.amount } };
  if (reward.type === "premium") return { ...state, currencies: { ...state.currencies, premium: state.currencies.premium + reward.amount } };
  if (reward.type === "quantum_cores") return { ...state, currencies: { ...state.currencies, quantumCores: state.currencies.quantumCores + reward.amount } };
  if (reward.type === "research_points") return { ...state, currencies: { ...state.currencies, researchPoints: state.currencies.researchPoints + reward.amount } };
  if (reward.type === "corporation_credits") return { ...state, currencies: { ...state.currencies, corporationCredits: state.currencies.corporationCredits + reward.amount } };
  if (reward.type === "war_credits") return { ...state, currencies: { ...state.currencies, warCredits: state.currencies.warCredits + reward.amount } };

  if (reward.type === "quantum_resource") {
    return {
      ...state,
      quantumResources: {
        ...state.quantumResources,
        [reward.resourceId]: state.quantumResources[reward.resourceId] + reward.amount,
      },
      inventory: addOrStackItem(state.inventory, rewardToInventoryItem(reward, source)!),
    };
  }

  const inventoryItem = rewardToInventoryItem(reward, source);
  if (!inventoryItem) return state;

  return {
    ...state,
    inventory: addOrStackItem(state.inventory, inventoryItem),
  };
}

export function applyRewards(state: HexiumGameState, rewards: GameReward[], source = "system"): HexiumGameState {
  return rewards.reduce((nextState, reward) => applyReward(nextState, reward, source), state);
}
