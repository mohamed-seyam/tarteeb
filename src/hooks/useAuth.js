const { React } = window;

export const useAuth = () => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Listen to auth state changes
    React.useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Sign up with email and password
    const signup = async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
            return result.user;
        } catch (err) {
            setError(getErrorMessage(err.code));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Login with email and password
    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            const result = await firebase.auth().signInWithEmailAndPassword(email, password);
            return result.user;
        } catch (err) {
            setError(getErrorMessage(err.code));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = async () => {
        try {
            setError(null);
            await firebase.auth().signOut();
        } catch (err) {
            setError(getErrorMessage(err.code));
            throw err;
        }
    };

    // Helper function to get user-friendly error messages
    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'This email is already registered. Please login instead.';
            case 'auth/invalid-email':
                return 'Invalid email address.';
            case 'auth/user-not-found':
                return 'No account found with this email.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection.';
            default:
                return 'An error occurred. Please try again.';
        }
    };

    return {
        user,
        loading,
        error,
        signup,
        login,
        logout
    };
};
