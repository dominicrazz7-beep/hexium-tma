export type ExpeditionsProps = {
  hex: number;
  shards: number;
  reactorLevel: number;
  onNavigate: (screen: string, payload?: string) => void;
  dispatch: (action: any) => void;
};
