import React from 'react';
import { Crown } from 'lucide-react';
import { Player } from '../src/types';

interface LeaderboardProps {
  playerMoney: { [address: string]: number };
  currentPlayerAddress: string;
  players: { [address: string]: Player };
}

const Leaderboard: React.FC<LeaderboardProps> = ({ playerMoney, currentPlayerAddress, players }) => {
  const rankings = Object.entries(playerMoney)
    .map(([address, money]) => ({
      address,
      username: players[address]?.username || 'Unknown Player',
      money,
      isCurrentPlayer: address === currentPlayerAddress
    }))
    .sort((a, b) => b.money - a.money)
    .map((player, index) => ({
      ...player,
      rank: index + 1
    }));

  return (
    <div 
      className="fixed right-5 top-20 w-64 bg-slate-900/90 text-white rounded-lg shadow-xl"
      style={{
        zIndex: 9999,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
      }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Crown className="h-5 w-5 text-yellow-400" />
          Leaderboard
        </div>
      </div>
      <div className="p-4 pt-0">
        <div className="space-y-2">
          {rankings.map((player) => (
            <div
              key={player.address}
              className={`flex items-center justify-between rounded-lg p-2 ${
                player.isCurrentPlayer ? 'bg-blue-900/50' : 'bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="min-w-6 text-sm font-bold text-slate-400">
                  #{player.rank}
                </span>
                <span className="text-sm truncate flex-1">
                  {player.username}: ${player.money}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;