const { React } = window;

export const AuthForm = ({ onLogin, onSignup, error, loading }) => {
    const [isLogin, setIsLogin] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isLogin && password !== confirmPassword) {
            return;
        }

        if (isLogin) {
            onLogin(email, password);
        } else {
            onSignup(email, password);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Tarteeb</h1>
                    <p className="auth-subtitle">Organize Your Tasks Smartly</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <h2 className="auth-form-title">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <div className="auth-input-group">
                        <label className="auth-label">Email</label>
                        <input
                            type="email"
                            className="auth-input"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Password</label>
                        <input
                            type="password"
                            className="auth-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={loading}
                        />
                    </div>

                    {!isLogin && (
                        <div className="auth-input-group">
                            <label className="auth-label">Confirm Password</label>
                            <input
                                type="password"
                                className="auth-input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                disabled={loading}
                            />
                            {password !== confirmPassword && confirmPassword && (
                                <span className="auth-error-text">Passwords don't match</span>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading || (!isLogin && password !== confirmPassword)}
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>

                    <div className="auth-toggle">
                        <span className="auth-toggle-text">
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                        </span>
                        <button
                            type="button"
                            className="auth-toggle-btn"
                            onClick={toggleMode}
                            disabled={loading}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
