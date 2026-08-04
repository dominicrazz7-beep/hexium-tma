export type CorporationProps = {
  hex?: number;
  shards?: number;
  onNavigate?: (screen: string, payload?: string) => void;
  onStateChange?: (state: unknown) => void;
};
