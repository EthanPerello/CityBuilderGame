import React, { useState, useEffect, KeyboardEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { GameState, Player } from '../src/types';
import Leaderboard from './Leaderboard';

const TILE_COST = 100;
const INITIAL_MONEY = 1000;
const GRID_SIZE = 20;
const TILE_SIZE = 100;
const GAME_STATE_KEY = 'gameState';
const PLAYERS_KEY = 'players';

const GameBoard: React.FC = () => {
  const { currentPlayer } = useAuth();
  const [cameraPosition, setCameraPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [players, setPlayers] = useState<{ [address: string]: Player }>(() => {
    const savedPlayers = localStorage.getItem(PLAYERS_KEY);
    if (savedPlayers) {
      return JSON.parse(savedPlayers);
    }
    return currentPlayer ? { [currentPlayer.address]: currentPlayer } : {};
  });

  const [gameState, setGameState] = useState<GameState>(() => {
    const savedState = localStorage.getItem(GAME_STATE_KEY);
    if (savedState) {
      const parsed = JSON.parse(savedState) as GameState;
      return parsed;
    }

    return {
      playerMoney: { [currentPlayer?.address || '']: INITIAL_MONEY },
      tiles: Array(GRID_SIZE).fill(null).map((_, i) => 
        Array(GRID_SIZE).fill(null).map((_, j) => ({
          id: `tile-${i}-${j}`,
          roads: { top: true, right: true, bottom: true, left: true },
          owner: null,
          building: null
        }))
      )
    };
  });

  useEffect(() => {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    if (currentPlayer) {
      // Update players list
      setPlayers(prev => ({
        ...prev,
        [currentPlayer.address]: currentPlayer
      }));

      // Initialize money if needed
      if (!gameState.playerMoney[currentPlayer.address]) {
        setGameState(prevState => ({
          ...prevState,
          playerMoney: {
            ...prevState.playerMoney,
            [currentPlayer.address]: INITIAL_MONEY
          }
        }));
      }
    }
  }, [currentPlayer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const moveSpeed = 50;
      const zoomSpeed = 0.1;
      
      switch (e.key.toLowerCase()) {
        case 'w':
          setCameraPosition(prev => ({ ...prev, y: prev.y + moveSpeed }));
          break;
        case 's':
          setCameraPosition(prev => ({ ...prev, y: prev.y - moveSpeed }));
          break;
        case 'a':
          setCameraPosition(prev => ({ ...prev, x: prev.x + moveSpeed }));
          break;
        case 'd':
          setCameraPosition(prev => ({ ...prev, x: prev.x - moveSpeed }));
          break;
        case 'r':
          setZoom(prev => Math.min(prev + zoomSpeed, 2));
          break;
        case 'f':
          setZoom(prev => Math.max(prev - zoomSpeed, 0.5));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown as unknown as EventListener);
    return () => window.removeEventListener('keydown', handleKeyDown as unknown as EventListener);
  }, []);

  const handleTileClick = (x: number, y: number) => {
    if (!currentPlayer) return;
    
    const tile = gameState.tiles[x][y];
    if (tile.owner && tile.owner !== currentPlayer.address) {
      setSelectedTile(null);
      return;
    }
    
    setSelectedTile({ x, y });
  };

  const handleBuyTile = () => {
    if (!currentPlayer || !selectedTile) return;
    
    const { x, y } = selectedTile;
    const currentMoney = gameState.playerMoney[currentPlayer.address] || 0;
    const tile = gameState.tiles[x][y];

    // Check if the tile is already owned by the player
    if (tile.owner === currentPlayer.address) {
      return; // Exit if the tile is already owned by the player
    }

    if (currentMoney >= TILE_COST) {
      setGameState(prevState => {
        const newTiles = prevState.tiles.map((row, i) => 
          row.map((tile, j) => {
            if (i === x && j === y) {
              return {
                ...tile,
                owner: currentPlayer.address
              };
            }
            return tile;
          })
        );

        return {
          ...prevState,
          playerMoney: {
            ...prevState.playerMoney,
            [currentPlayer.address]: currentMoney - TILE_COST
          },
          tiles: newTiles
        };
      });
      setSelectedTile(null);
    }
  };

  if (!currentPlayer) {
    return <div>Loading...</div>;
  }

  const currentMoney = gameState.playerMoney[currentPlayer.address] || 0;

  return (
    <div style={{ 
      position: 'fixed',
      top: '64px',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#1a1a1a',
      overflow: 'hidden'
    }}>
      {/* Game Board */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${cameraPosition.x}px, ${cameraPosition.y}px) scale(${zoom})`,
          transformOrigin: 'center',
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`,
            gap: '1px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {gameState.tiles.map((row, i) => 
            row.map((tile, j) => {
              const isSelected = selectedTile?.x === i && selectedTile?.y === j;
              const isOwned = tile.owner !== null;
              const isOwnedByPlayer = tile.owner === currentPlayer.address;
              
              return (
                <div 
                  key={tile.id}
                  onClick={() => handleTileClick(i, j)}
                  style={{
                    width: `${TILE_SIZE}px`,
                    height: `${TILE_SIZE}px`,
                    backgroundColor: isSelected ? '#1a365d' :
                                  isOwnedByPlayer ? '#1c4532' :
                                  isOwned ? '#742a2a' :
                                  '#2d3748',
                    border: `2px solid ${
                      isSelected ? '#3182ce' :
                      isOwnedByPlayer ? '#48bb78' :
                      isOwned ? '#f56565' :
                      '#4a5568'
                    }`,
                    position: 'relative',
                    cursor: isOwned && !isOwnedByPlayer ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Roads */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: '#718096',
                    transform: 'translateY(-50%)'
                  }} />
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    backgroundColor: '#718096',
                    transform: 'translateX(-50%)'
                  }} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(26, 32, 44, 0.9)',
        padding: '12px',
        borderRadius: '8px',
        color: 'white',
        zIndex: 100
      }}>
        Money: ${currentMoney}
      </div>

      {/* Leaderboard */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(26, 32, 44, 0.9)',
        padding: '12px',
        borderRadius: '8px',
        color: 'white',
        zIndex: 100
      }}>
        {currentPlayer && (
        <Leaderboard 
          playerMoney={gameState.playerMoney}
          currentPlayerAddress={currentPlayer.address}
          players={players}
        />
      )}
      </div>

      {/* Buy Tile Button */}
      {selectedTile && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'rgba(26, 32, 44, 0.9)',
          padding: '12px',
          borderRadius: '8px',
          zIndex: 100
        }}>
          <button
            onClick={handleBuyTile}
            disabled={currentMoney < TILE_COST || gameState.tiles[selectedTile.x][selectedTile.y].owner === currentPlayer.address}
            style={{
              padding: '8px 16px',
              backgroundColor: currentMoney >= TILE_COST && gameState.tiles[selectedTile.x][selectedTile.y].owner !== currentPlayer.address ? '#48bb78' : '#4a5568',
              color: 'white',
              borderRadius: '6px',
              cursor: currentMoney >= TILE_COST && gameState.tiles[selectedTile.x][selectedTile.y].owner !== currentPlayer.address ? 'pointer' : 'not-allowed'
            }}
          >
            Buy Tile - ${TILE_COST}
          </button>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
