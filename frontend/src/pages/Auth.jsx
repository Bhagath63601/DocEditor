import React, { useState, useEffect } from 'react';
import { useSignIn, useSignUp, AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Layout as LayoutIcon, Chrome } from 'lucide-react';

const Auth = () => {
    const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
    const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
    const navigate = useNavigate();
    const location = useLocation();
    
    const isSignInPath = location.pathname.includes('/auth') && !location.pathname.includes('/sign-up');
    const [isSignInMode, setIsSignInMode] = useState(isSignInPath);
    
    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [keepSignedIn, setKeepSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setIsSignInMode(isSignInPath);
    }, [isSignInPath]);

    const handleEmailSignIn = async (e) => {
        e.preventDefault();
        if (!signInLoaded) return;
        
        setIsLoading(true);
        setError('');
        
        try {
            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === 'complete') {
                await setSignInActive({ session: result.createdSessionId });
                navigate('/dashboard');
            } else {
                console.log('Sign in result:', result);
                setError('Additional steps required. Please check your email.');
            }
        } catch (err) {
            console.error('Sign in error:', err);
            setError(err.errors?.[0]?.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailSignUp = async (e) => {
        e.preventDefault();
        if (!signUpLoaded) return;

        setIsLoading(true);
        setError('');

        try {
            await signUp.create({
                emailAddress: email,
                password,
            });

            // For simplicity in this demo, we'll assume email verification is handled via Clerk's default components 
            // or redirected. In a full custom flow, we'd need to handle verification codes here.
            // For now, let's try to prepare verification.
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            
            // Redirect to a verification page or show code input
            alert('A verification code has been sent to your email.');
            // This would normally transition to a code input state
        } catch (err) {
            console.error('Sign up error:', err);
            setError(err.errors?.[0]?.message || 'Error creating account');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        const strategy = 'oauth_google';
        try {
            if (isSignInMode) {
                if (!signInLoaded) return;
                await signIn.authenticateWithRedirect({
                    strategy,
                    redirectUrl: '/auth/sso-callback',
                    redirectUrlComplete: '/dashboard',
                });
            } else {
                if (!signUpLoaded) return;
                await signUp.authenticateWithRedirect({
                    strategy,
                    redirectUrl: '/auth/sso-callback',
                    redirectUrlComplete: '/dashboard',
                });
            }
        } catch (err) {
            console.error('Google auth error:', err);
            setError('Could not connect to Google. Please try again.');
        }
    };

    const toggleMode = () => {
        const newMode = !isSignInMode;
        setIsSignInMode(newMode);
        navigate(newMode ? '/auth' : '/auth/sign-up');
    };

    if (location.pathname === '/auth/sso-callback') {
        return <AuthenticateWithRedirectCallback />;
    }

    return (
        <div className="auth-v2-page">
            {/* Left Side: Form */}
            <div className="auth-v2-form-side">
                <div className="auth-v2-animate-child">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }} className="auth-v2-anim-1">
                        <div style={{ 
                            background: 'var(--auth-v2-accent)', 
                            padding: '0.5rem', 
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <LayoutIcon size={20} color="white" />
                        </div>
                        <span style={{ fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.03em' }}>DocEditor</span>
                    </div>

                    <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.04em' }} className="auth-v2-anim-2">
                        {isSignInMode ? 'Welcome' : 'Join Us'}
                    </h1>
                    <p style={{ color: 'var(--auth-v2-text-muted)', fontSize: '1.15rem', marginBottom: '3rem', maxWidth: '400px' }} className="auth-v2-anim-3">
                        {isSignInMode 
                            ? 'Access your account and continue your journey with us' 
                            : 'Create your account and start collaborating in real-time'}
                    </p>

                    <form onSubmit={isSignInMode ? handleEmailSignIn : handleEmailSignUp}>
                        <div className="auth-v2-input-group auth-v2-anim-4">
                            <label className="auth-v2-label">Email Address</label>
                            <div className="auth-v2-input-wrapper">
                                <input 
                                    type="email" 
                                    className="auth-v2-input" 
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-v2-input-group auth-v2-anim-5">
                            <label className="auth-v2-label">Password</label>
                            <div className="auth-v2-input-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="auth-v2-input" 
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <div className="auth-v2-input-icon" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div style={{ color: '#ef4444', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                                {error}
                            </div>
                        )}

                        <div className="auth-v2-footer-links auth-v2-anim-6">
                            <div className="auth-v2-checkbox-group" onClick={() => setKeepSignedIn(!keepSignedIn)}>
                                <div className={`auth-v2-checkbox ${keepSignedIn ? 'active' : ''}`}>
                                    {keepSignedIn && <div style={{ width: '10px', height: '10px', background: 'white', borderRadius: '2px' }}></div>}
                                </div>
                                <span>Keep me signed in</span>
                            </div>
                            <a href="#" className="auth-v2-reset-link">Reset password</a>
                        </div>

                        <button 
                            type="submit" 
                            className="auth-v2-btn-primary auth-v2-anim-7"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : (isSignInMode ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>

                    <div className="auth-v2-divider auth-v2-anim-7">
                        Or continue with
                    </div>

                    <button className="auth-v2-btn-social auth-v2-anim-7" onClick={handleGoogleAuth}>
                        <Chrome size={22} />
                        Continue with Google
                    </button>

                    <div className="auth-v2-switch-mode auth-v2-anim-7">
                        {isSignInMode ? "New to our platform?" : "Already have an account?"}
                        <button 
                            onClick={toggleMode}
                            style={{ background: 'none', border: 'none', padding: 0 }}
                            className="auth-v2-switch-link"
                        >
                            {isSignInMode ? 'Create Account' : 'Sign In'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Side: Visual Placeholder */}
            <div className="auth-v2-visual-side">
                <div className="auth-v2-visual-placeholder">
                    {/* Animated Testimonial Removed */}
                </div>
            </div>
        </div>
    );
};

export default Auth;
