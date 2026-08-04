// ============================================================
// HEXIUM CLICKER · Share System · Templates
// ============================================================
// Text templates for every shareable content type.
// Each template has {placeholders} filled from ShareContext.
// Bilingual: Ukrainian primary, English fallback in comments.
// ============================================================

import type { ShareTemplate, ShareContentType } from "./shareTypes";
import { getDeepLinkBase, getAppLinkBase } from "./shareData";

// ============================================================
// TEMPLATE REGISTRY
// ============================================================

const TEMPLATES: ShareTemplate[] = [

  // ─────────────── INVITE FRIEND ───────────────
  {
    contentType: "invite_friend",
    name: "Invite Friend",
    icon: "👥",
    textTemplate:
      "🎮 Грай в HEXIUM CLICKER! ☢️\n\n" +
      "Я вже на рівні {level} — приєднуйся!\n" +
      "🎁 Бонус для нових гравців!\n\n" +
      "👇 Запускай:",
    urlTemplate: "{deepLinkBase}?start=ref_{referralCode}",
    defaults: { level: "1", referralCode: "unknown" },
    supportsImage: false,
  },

  // ─────────────── REFERRAL LINK ───────────────
  {
    contentType: "referral_link",
    name: "Referral Link",
    icon: "🔗",
    textTemplate:
      "🎮 HEXIUM CLICKER ☢️\n\n" +
      "Мій реферальний код: {referralCode}\n" +
      "🎁 Отримай бонус при старті!\n\n" +
      "👇 Грати:",
    urlTemplate: "{deepLinkBase}?start=ref_{referralCode}",
    defaults: { referralCode: "unknown" },
    supportsImage: false,
  },

  // ─────────────── ACHIEVEMENT ───────────────
  {
    contentType: "achievement",
    name: "Achievement Unlocked",
    icon: "🏆",
    textTemplate:
      "🏆 Досягнення розблоковано!\n\n" +
      "{achievementIcon} *{achievementName}*\n" +
      "{achievementDesc}\n\n" +
      "🎮 HEXIUM CLICKER ☢️",
    urlTemplate: "{appLinkBase}?startapp=ach_{achievementId}",
    defaults: {
      achievementIcon: "⭐",
      achievementName: "Unknown",
      achievementDesc: "",
      achievementId: "0",
    },
    supportsImage: true,
  },

  // ─────────────── BOSS KILL ───────────────
  {
    contentType: "boss_kill",
    name: "Boss Kill",
    icon: "💀",
    textTemplate:
      "💀 BOSS DEFEATED!\n\n" +
      "☢️ *{bossName}* — знищений!\n" +
      "⚔️ Урон: {damage} | Час: {time}\n" +
      "🏅 Ранг: #{rank}\n\n" +
      "🎮 HEXIUM CLICKER",
    urlTemplate: "{appLinkBase}?startapp=boss_{bossId}",
    defaults: {
      bossName: "World Boss",
      damage: "0",
      time: "0:00",
      rank: "?",
      bossId: "0",
    },
    supportsImage: true,
  },

  // ─────────────── CASE DROP ───────────────
  {
    contentType: "case_drop",
    name: "Rare Case Drop",
    icon: "📦",
    textTemplate:
      "📦 РІДКІСНИЙ ДРОП!\n\n" +
      "{rarityIcon} *{itemName}*\n" +
      "Рідкість: {rarity}\n" +
      "З кейса: {caseName}\n\n" +
      "🎮 HEXIUM CLICKER ☢️",
    urlTemplate: "{appLinkBase}?startapp=drop_{dropId}",
    defaults: {
      rarityIcon: "✨",
      itemName: "Unknown Item",
      rarity: "Common",
      caseName: "Standard Case",
      dropId: "0",
    },
    supportsImage: true,
  },

  // ─────────────── BATTLE PASS LEVEL ───────────────
  {
    contentType: "battle_pass_level",
    name: "Battle Pass Level",
    icon: "🎖️",
    textTemplate:
      "🎖️ BATTLE PASS — Рівень {bpLevel}!\n\n" +
      "{rewardIcon} Нагорода: {rewardName}\n" +
      "📊 Сезон: {season}\n" +
      "{premiumBadge}\n\n" +
      "🎮 HEXIUM CLICKER ☢️",
    urlTemplate: "{appLinkBase}?startapp=bp_{season}_{bpLevel}",
    defaults: {
      bpLevel: "1",
      rewardIcon: "🎁",
      rewardName: "Reward",
      season: "1",
      premiumBadge: "",
    },
    supportsImage: true,
  },

  // ─────────────── CORPORATION INVITE ───────────────
  {
    contentType: "corporation_invite",
    name: "Corporation Invite",
    icon: "🏢",
    textTemplate:
      "🏢 Приєднуйся до корпорації!\n\n" +
      "☢️ *{corpName}*\n" +
      "👥 Учасників: {memberCount}/{maxMembers}\n" +
      "🏅 Ранг: #{corpRank}\n" +
      "🎁 Бонус за вступ!\n\n" +
      "👇 Вступити:",
    urlTemplate: "{deepLinkBase}?start=corp_{corpId}",
    defaults: {
      corpName: "Unknown Corp",
      memberCount: "0",
      maxMembers: "50",
      corpRank: "?",
      corpId: "0",
    },
    supportsImage: false,
  },

  // ─────────────── EVENT ───────────────
  {
    contentType: "event",
    name: "Game Event",
    icon: "📅",
    textTemplate:
      "📅 ІВЕНТ В HEXIUM!\n\n" +
      "{eventIcon} *{eventName}*\n" +
      "{eventDesc}\n" +
      "⏰ Закінчується: {endsAt}\n" +
      "🎁 Нагороди: {rewards}\n\n" +
      "🎮 HEXIUM CLICKER ☢️",
    urlTemplate: "{appLinkBase}?startapp=event_{eventId}",
    defaults: {
      eventIcon: "🎉",
      eventName: "Event",
      eventDesc: "",
      endsAt: "soon",
      rewards: "exclusive items",
      eventId: "0",
    },
    supportsImage: true,
  },

  // ─────────────── VIP STATUS ───────────────
  {
    contentType: "vip_status",
    name: "VIP Status",
    icon: "👑",
    textTemplate:
      "👑 VIP ACTIVE!\n\n" +
      "☢️ HEXIUM CLICKER\n" +
      "🔥 +50% до всього income\n" +
      "⭐ VIP до: {expiresAt}\n\n" +
      "Хочеш теж? 👇",
    urlTemplate: "{appLinkBase}?startapp=vip",
    defaults: { expiresAt: "..." },
    supportsImage: false,
  },

  // ─────────────── PURCHASE BRAG ───────────────
  {
    contentType: "purchase_brag",
    name: "Purchase Brag",
    icon: "💎",
    textTemplate:
      "💎 НОВИЙ ПАКЕТ!\n\n" +
      "{packIcon} *{packName}*\n" +
      "Отримав: {rewards}\n\n" +
      "🎮 HEXIUM CLICKER ☢️",
    urlTemplate: "{appLinkBase}?startapp=shop",
    defaults: {
      packIcon: "💰",
      packName: "Pack",
      rewards: "...",
    },
    supportsImage: false,
  },

  // ─────────────── LEADERBOARD RANK ───────────────
  {
    contentType: "leaderboard_rank",
    name: "Leaderboard Rank",
    icon: "📊",
    textTemplate:
      "📊 РЕЙТИНГ HEXIUM!\n\n" +
      "🏅 Моє місце: #{rank}\n" +
      "💰 Hexium: {hexiumAmount}\n" +
      "⚡ Рівень: {level}\n\n" +
      "Зможеш обігнати? 😏\n" +
      "🎮 HEXIUM CLICKER ☢️",
    urlTemplate: "{appLinkBase}?startapp=lb",
    defaults: {
      rank: "?",
      hexiumAmount: "0",
      level: "1",
    },
    supportsImage: false,
  },
];

// ============================================================
// TEMPLATE API
// ============================================================

/** Get template by content type */
export function getTemplate(contentType: ShareContentType): ShareTemplate | undefined {
  return TEMPLATES.find((t) => t.contentType === contentType);
}

/** Get all templates */
export function getAllTemplates(): ShareTemplate[] {
  return [...TEMPLATES];
}

/** Get templates that support images */
export function getImageTemplates(): ShareTemplate[] {
  return TEMPLATES.filter((t) => t.supportsImage);
}

/**
 * Fill a text template with values.
 * Replaces all {key} placeholders with provided values or defaults.
 */
export function fillTemplate(
  template: string,
  values: Record<string, string | number>,
  defaults: Record<string, string> = {}
): string {
  let result = template;

  // Merge defaults and values (values override)
  const merged: Record<string, string> = { ...defaults };
  for (const [k, v] of Object.entries(values)) {
    merged[k] = String(v);
  }

  // Inject dynamic bases
  merged.deepLinkBase = merged.deepLinkBase ?? getDeepLinkBase();
  merged.appLinkBase = merged.appLinkBase ?? getAppLinkBase();

  // Replace placeholders
  for (const [key, val] of Object.entries(merged)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), val);
  }

  return result;
}

/**
 * Build share text from template and context values.
 */
export function buildShareText(
  contentType: ShareContentType,
  values: Record<string, string | number>
): string {
  const template = getTemplate(contentType);
  if (!template) return `🎮 HEXIUM CLICKER ☢️\n\n👇 Грати: ${getAppLinkBase()}`;

  return fillTemplate(template.textTemplate, values, template.defaults);
}

/**
 * Build share URL from template and context values.
 */
export function buildShareUrl(
  contentType: ShareContentType,
  values: Record<string, string | number>
): string {
  const template = getTemplate(contentType);
  if (!template) return getAppLinkBase();

  return fillTemplate(template.urlTemplate, values, template.defaults);
}

/**
 * Register a custom template.
 */
export function registerTemplate(template: ShareTemplate): void {
  const idx = TEMPLATES.findIndex((t) => t.contentType === template.contentType);
  if (idx >= 0) {
    TEMPLATES[idx] = template;
  } else {
    TEMPLATES.push(template);
  }
}
