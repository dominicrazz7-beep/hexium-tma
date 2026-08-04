// ============================================================
// HEXIUM CLICKER · Telegram Stars System · Barrel Export
// ============================================================

export { starsService } from "./starsService";

export type {
  // Product types
  ProductCategory,
  StarsProduct,
  ProductReward,
  ProductRewardType,

  // Purchase types
  PurchaseStatus,
  PurchaseState,
  PurchaseRecord,

  // Invoice
  InvoiceAdapter,
  InvoiceParams,
  InvoiceResult,
  InvoiceResultStatus,

  // Refund
  RefundRequest,

  // Events
  StarsEventType,
  StarsEvent,
  StarsAnalyticsEventType,
  StarsAnalyticsEvent,

  // Display
  CategoryDisplay,
} from "./starsTypes";

export {
  // Constants
  STARS_SYSTEM_VERSION,
  PURCHASE_HISTORY_KEY,
  CLOUD_SAVE_STARS_KEY,

  // Utils
  formatStarsPrice,
  calcDiscountPercent,
  getCategoryDisplay,
  getSortedCategories,
} from "./starsData";

export {
  // Product catalog
  getAllProducts,
  getAvailableProducts,
  getProductsByCategory,
  getProductById,
  getProductsByTag,
  getFeaturedProducts,
  registerProduct,
  removeProduct,
} from "./starsProducts";

export {
  // Logic
  validatePurchase,
  convertRewardsToGame,
  getDiscountInfo,
  calcValueScore,
  sortByValue,
  getTotalSpent,
  getSpendingByCategory,
  type GameRewardOutput,
} from "./starsLogic";
