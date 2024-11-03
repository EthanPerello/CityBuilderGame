export interface Player {
    address: string;
    username: string;
    password: string;
}

export interface AuthContextType {
    currentPlayer: Player | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    register: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
}

export interface GameState {
    playerMoney: { [address: string]: number };
    tiles: TileData[][];
  }
  
  export interface TileData {
    id: string;
    roads: {
      top: boolean;
      right: boolean;
      bottom: boolean;
      left: boolean;
    };
    owner: string | null;
    building: string | null;
  }