import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { ShoppingBasket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let emailForSignIn = window.localStorage.getItem('emailForSignIn');
            if (!emailForSignIn) {
                emailForSignIn = window.prompt('Please provide your email for confirmation');
            }

            if (emailForSignIn) {
                setLoading(true);
                signInWithEmailLink(auth, emailForSignIn, window.location.href)
                    .then(() => {
                        window.localStorage.removeItem('emailForSignIn');
                        navigate('/');
                    })
                    .catch((error) => {
                        console.error("Error signing in with email link", error);
                        setMessage(error.message);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            }
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const actionCodeSettings = {
            url: window.location.origin + '/login', // Redirect to /login to handle the link
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setMessage('Check your email for the login link!');
        } catch (error: any) {
            console.error("Error sending email link", error);
            alert(error.message);
        }

        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <ShoppingBasket className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Board2Basket
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to manage your household grocery lists
                    </p>
                </div>

                {message ? (
                    <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
                        {message}
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                            >
                                {loading ? 'Sending magic link...' : 'Sign in with Email'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
