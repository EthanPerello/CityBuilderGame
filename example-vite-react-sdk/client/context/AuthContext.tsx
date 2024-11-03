import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player, AuthContextType } from '../src/types';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const savedPlayer = localStorage.getItem('currentPlayer');
        if (savedPlayer) {
            setCurrentPlayer(JSON.parse(savedPlayer));
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const playersJson = localStorage.getItem('registeredPlayers');
            const players: Player[] = playersJson ? JSON.parse(playersJson) : [];
            
            const player = players.find(
                p => p.username === username && p.password === password
            );
            
            if (player) {
                setCurrentPlayer(player);
                setIsAuthenticated(true);
                localStorage.setItem('currentPlayer', JSON.stringify(player));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const register = async (username: string, password: string): Promise<boolean> => {
        try {
            const playersJson = localStorage.getItem('registeredPlayers');
            const players: Player[] = playersJson ? JSON.parse(playersJson) : [];
            
            if (players.some(p => p.username === username)) {
                return false;
            }

            const newPlayer: Player = {
                username,
                password,
                address: `0x${Math.random().toString(16).slice(2)}`,
            };

            players.push(newPlayer);
            localStorage.setItem('registeredPlayers', JSON.stringify(players));

            setCurrentPlayer(newPlayer);
            setIsAuthenticated(true);
            localStorage.setItem('currentPlayer', JSON.stringify(newPlayer));
            
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        }
    };

    const logout = (): void => {
        setCurrentPlayer(null);
        setIsAuthenticated(false);
        localStorage.removeItem('currentPlayer');
    };

    const value: AuthContextType = {
        currentPlayer,
        isAuthenticated,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
