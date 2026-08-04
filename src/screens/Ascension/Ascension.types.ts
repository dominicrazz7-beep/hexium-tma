export type AscensionScreenProps = {
  hex: number;
  shards: number;
  reactorLevel: number;
  totalHexMined: number;
  onNavigate: (screen: string) => void;
  dispatch: (action: any) => void;
};
