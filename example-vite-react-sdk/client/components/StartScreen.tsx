import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StartScreenProps {
    onCreateBurner: (username: string) => void;
    isDeploying: boolean;
}

type ScreenState = 'initial' | 'login' | 'register';

const StartScreen: React.FC<StartScreenProps> = ({ onCreateBurner, isDeploying }) => {
    const [screenState, setScreenState] = useState<ScreenState>('initial');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const [isResetting, setIsResetting] = useState(false);

    const handleResetAll = async () => {
        if (window.confirm('Are you sure you want to reset all game data? This will remove all accounts and game progress.')) {
            setIsResetting(true);
            try {
                localStorage.clear();
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.reload();
            } catch (error) {
                console.error('Error resetting game:', error);
                setError('Failed to reset game data');
            } finally {
                setIsResetting(false);
            }
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please fill in all fields');
            return;
        }

        const success = await login(username, password);
        if (!success) {
            setError('Invalid username or password');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        const success = await register(username, password);
        if (!success) {
            setError('Username already taken');
            return;
        }

        onCreateBurner(username);
    };

    const inputClass = `
        w-full
        px-6 
        py-4 
        bg-[#1E1E1E] 
        text-white 
        !text-white
        placeholder:text-gray-500
        border 
        border-gray-600 
        rounded-lg 
        text-lg 
        focus:outline-none 
        focus:ring-2 
        focus:ring-blue-500 
        focus:border-transparent
        [color:white]
        [background-color:#1E1E1E]
    `;

    return (
        <div className="fixed inset-0 w-full h-full bg-[#1a1a1a] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <Card className="w-full border-gray-700 [background:rgb(31,41,55)] shadow-xl">
                    <CardHeader className="text-center p-8 [background:rgb(31,41,55)]">
                        <div className="mx-auto mb-6">
                            <Building2 
                                size={72}
                                className="text-blue-500 transition-transform duration-300 hover:scale-110"
                            />
                        </div>
                        <CardTitle className="text-3xl font-bold text-white mb-4 !text-white">
                            Welcome to City Builder
                        </CardTitle>
                        <p className="text-gray-300 text-lg mb-6">
                            Build, manage, and compete in this multiplayer city building experience
                        </p>
                        
                        <button
                            onClick={handleResetAll}
                            disabled={isResetting}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {isResetting ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Resetting...</span>
                                </div>
                            ) : (
                                'Reset All Game Data'
                            )}
                        </button>
                    </CardHeader>

                    <CardContent className="p-8 [background:rgb(31,41,55)]">
                        {screenState === 'initial' && (
                            <div className="space-y-6">
                                <button
                                    onClick={() => setScreenState('register')}
                                    type="button"
                                    className="!text-white w-full py-6 px-8 !bg-blue-600 hover:!bg-blue-700 font-medium rounded-lg text-xl shadow-lg border-0"
                                >
                                    Create New Account
                                </button>
                                <button
                                    onClick={() => setScreenState('login')}
                                    type="button"
                                    className="!text-white w-full py-6 px-8 !bg-slate-600 hover:!bg-slate-700 font-medium rounded-lg text-xl shadow-lg border-0"
                                >
                                    Login to Existing Account
                                </button>
                            </div>
                        )}

                        {screenState === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="username" className="block text-white text-lg font-medium">
                                        Username
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            setError('');
                                        }}
                                        className={inputClass}
                                        style={{
                                            color: 'white',
                                            backgroundColor: '#1E1E1E',
                                            caretColor: 'white'
                                        }}
                                        placeholder="Enter your username"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-white text-lg font-medium">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError('');
                                        }}
                                        className={inputClass}
                                        style={{
                                            color: 'white',
                                            backgroundColor: '#1E1E1E',
                                            caretColor: 'white'
                                        }}
                                        placeholder="Enter your password"
                                    />
                                </div>
                                {error && <p className="text-red-400 text-md">{error}</p>}
                                <button
                                    type="submit"
                                    className="!text-white w-full py-5 px-8 !bg-blue-600 hover:!bg-blue-700 font-medium rounded-lg text-xl shadow-lg border-0"
                                >
                                    Login
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setScreenState('initial');
                                        setUsername('');
                                        setPassword('');
                                        setError('');
                                    }}
                                    className="!text-white w-full py-4 px-8 !bg-slate-600 hover:!bg-slate-700 font-medium rounded-lg text-lg shadow-lg border-0"
                                >
                                    Back
                                </button>
                            </form>
                        )}

                        {screenState === 'register' && (
                            <form onSubmit={handleRegister} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="reg-username" className="block text-white text-lg font-medium">
                                        Choose a username
                                    </label>
                                    <input
                                        id="reg-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            setError('');
                                        }}
                                        className={inputClass}
                                        style={{
                                            color: 'white',
                                            backgroundColor: '#1E1E1E',
                                            caretColor: 'white'
                                        }}
                                        placeholder="Enter desired username"
                                        disabled={isDeploying}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="reg-password" className="block text-white text-lg font-medium">
                                        Choose a password
                                    </label>
                                    <input
                                        id="reg-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError('');
                                        }}
                                        className={inputClass}
                                        style={{
                                            color: 'white',
                                            backgroundColor: '#1E1E1E',
                                            caretColor: 'white'
                                        }}
                                        placeholder="Enter desired password"
                                        disabled={isDeploying}
                                    />
                                </div>
                                {error && <p className="text-red-400 text-md">{error}</p>}
                                <button
                                    type="submit"
                                    className={`!text-white w-full py-5 px-8 !bg-blue-600 hover:!bg-blue-700 font-medium rounded-lg text-xl flex items-center justify-center space-x-3 shadow-lg border-0
                                        ${isDeploying ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isDeploying}
                                >
                                    {isDeploying ? (
                                        <>
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Creating Account...</span>
                                        </>
                                    ) : (
                                        <span>Create Account</span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setScreenState('initial');
                                        setUsername('');
                                        setPassword('');
                                        setError('');
                                    }}
                                    className="!text-white w-full py-4 px-8 !bg-slate-600 hover:!bg-slate-700 font-medium rounded-lg text-lg shadow-lg border-0"
                                >
                                    Back
                                </button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StartScreen;