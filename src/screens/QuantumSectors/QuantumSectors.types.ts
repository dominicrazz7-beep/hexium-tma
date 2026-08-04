export type QuantumSectorsProps = {
  hex?: number;
  shards?: number;
  onNavigate?: (screen: string, payload?: string) => void;
  onStateChange?: (state: unknown) => void;
};
