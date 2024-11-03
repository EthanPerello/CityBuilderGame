import { useEffect, useState } from "react";
import { SDK } from "@dojoengine/sdk";
import { addAddressPadding } from "starknet";

import { Schema } from "./bindings";
import { useDojo } from "./useDojo";
import StartScreen from "../components/StartScreen";
import GameBoard from "../components/GameBoard";
import { createDojoStore } from "@dojoengine/sdk";
import { useAuth } from "../context/AuthContext";

export const useDojoStore = createDojoStore<Schema>();

interface StoreState {
    entities: Record<string, any>;
    updateEntity: (entity: any) => void;
}

interface Player {
    address: string;
    username: string;
}

function App({ sdk }: { sdk: SDK<Schema> }) {
    const {
        account,
    } = useDojo();
    
    const { currentPlayer: authPlayer, isAuthenticated, logout } = useAuth();
    const [players, setPlayers] = useState<Player[]>([]);
    const state = useDojoStore((state: StoreState) => state);

    const handleCreateAccount = async () => {
        try {
            await account?.create();
            if (!account?.account?.address) {
                throw new Error('Failed to create burner wallet');
            }
        } catch (error) {
            console.error('Error creating account:', error);
        }
    };

    // Effect to track players
    useEffect(() => {
        const playersJson = localStorage.getItem('registeredPlayers');
        if (playersJson) {
            const registeredPlayers: Player[] = JSON.parse(playersJson);
            setPlayers(registeredPlayers);
        }

        const interval = setInterval(() => {
            const currentPlayersJson = localStorage.getItem('registeredPlayers');
            if (currentPlayersJson) {
                const currentPlayers: Player[] = JSON.parse(currentPlayersJson);
                setPlayers(currentPlayers);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);
    
    useEffect(() => {
        if (!isAuthenticated || !authPlayer || !account?.account?.address) return;

        let unsubscribe: (() => void) | undefined;

        const subscribe = async () => {
            const subscription = await sdk.subscribeEntityQuery(
                {
                    dojo_starter: {
                        Moves: {
                            $: {
                                where: {
                                    player: {
                                        $is: addAddressPadding(
                                            account.account.address
                                        ),
                                    },
                                },
                            },
                        },
                        Position: {
                            $: {
                                where: {
                                    player: {
                                        $is: addAddressPadding(
                                            account.account.address
                                        ),
                                    },
                                },
                            },
                        },
                    },
                },
                (response) => {
                    if (response.error) {
                        console.error(
                            "Error setting up entity sync:",
                            response.error
                        );
                    } else if (
                        response.data &&
                        response.data[0].entityId !== "0x0"
                    ) {
                        state.updateEntity(response.data[0]);
                    }
                }
            );

            unsubscribe = () => subscription.cancel();
        };

        subscribe();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [sdk, authPlayer, isAuthenticated, account?.account?.address, state]);

    if (!isAuthenticated || !authPlayer) {
        return (
            <StartScreen 
                onCreateBurner={handleCreateAccount}
                isDeploying={!!account?.isDeploying}
            />
        );
    }

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-900">
            {/* Header */}
            <div className="flex-none h-16 bg-gray-800 shadow-lg">
                <div className="flex justify-between items-center h-full px-4">
                    <div className="text-white">
                        Playing as: {authPlayer.username} 
                        {account?.account?.address && ` (${account.account.address})`}
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-white">
                            Players Online: {players.length}
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Game Container */}
            <div className="flex-1 relative overflow-hidden">
                <GameBoard />
            </div>
        </div>
    );
}

export default App;