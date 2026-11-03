import { useState } from 'react'
import LoginPage from './pages/login'
import FeedPage from './pages/feed'

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [username, setUsername] = useState('')

    const handleLogin = (loggedInUsername: string) => {
        setUsername(loggedInUsername)
        setIsAuthenticated(true)
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0705] font-serif text-slate-100">
            <div
                className="fixed inset-0 z-0 bg-cover bg-center brightness-[0.45]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at center, rgba(30, 20, 15, 0.4) 0%, rgba(10, 7, 5, 0.95) 100%), url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1920&auto=format&fit=crop')",
                }}
            />

            <div className="relative z-10 min-h-screen">
                {isAuthenticated ? (
                    <FeedPage
                        username={username}
                        onLogout={() => setIsAuthenticated(false)}
                    />
                ) : (
                    <LoginPage onLogin={handleLogin} />
                )}
            </div>
        </div>
    )
}

export default App
