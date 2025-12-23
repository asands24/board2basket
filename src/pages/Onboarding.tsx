import { useState } from 'react';
import { useHouseholds } from '../hooks/useHouseholds';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, LogIn } from 'lucide-react';

export default function Onboarding() {
    const { createHousehold, joinHousehold } = useHouseholds();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [mode, setMode] = useState<'create' | 'join'>('create');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsCreating(true);
        try {
            const household = await createHousehold(name);
            navigate(`/household/${household.id}`);
        } catch (error: any) {
            alert('Error creating household: ' + error.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCode.trim()) return;

        setIsJoining(true);
        try {
            const household = await joinHousehold(inviteCode);
            navigate(`/household/${household.id}`);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-lg space-y-8 rounded-xl bg-white p-8 shadow-lg text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome to Board2Basket</h2>
                <p className="text-gray-600">Create or join a household to start managing groceries together.</p>

                {/* Mode Toggle */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                    <button
                        onClick={() => setMode('create')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${mode === 'create' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Plus className="inline h-4 w-4 mr-1" />
                        Create New
                    </button>
                    <button
                        onClick={() => setMode('join')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${mode === 'join' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <LogIn className="inline h-4 w-4 mr-1" />
                        Join Existing
                    </button>
                </div>

                {mode === 'create' ? (
                    <form onSubmit={handleCreate} className="mt-8 space-y-4">
                        <div>
                            <label htmlFor="name" className="sr-only">Household Name</label>
                            <input
                                type="text"
                                id="name"
                                placeholder="e.g. The Smith Family"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-4"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4" />
                            {isCreating ? 'Creating...' : 'Create Household'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleJoin} className="mt-8 space-y-4">
                        <div>
                            <label htmlFor="inviteCode" className="sr-only">Invite Code</label>
                            <input
                                type="text"
                                id="inviteCode"
                                placeholder="Paste invite code here"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-4 font-mono text-xs"
                            />
                            <p className="mt-2 text-xs text-gray-500">Ask your roommate for the household invite code</p>
                        </div>
                        <button
                            type="submit"
                            disabled={isJoining}
                            className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                        >
                            <LogIn className="h-4 w-4" />
                            {isJoining ? 'Joining...' : 'Join Household'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
