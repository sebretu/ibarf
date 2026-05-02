import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Calculator from './pages/Calculator';
import Recipes from './pages/Recipes';
import ShoppingList from './pages/ShoppingList';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import Admin from './pages/Admin';
import Warehouse from './pages/Warehouse';
import Regulamin from './pages/Regulamin';
import PolitykaPrywatnosci from './pages/PolitykaPrywatnosci';
import NaszaMisja from './pages/NaszaMisja';
import Footer from './components/Footer';
import GuestCalculator from './components/GuestCalculator';

import axios from 'axios';

// Global Remote Logger
const remoteLog = (data) => {
    axios.post('/api/log', { ...data, timestamp: new Date().toISOString() }).catch(() => { });
};
window.remoteLog = remoteLog;

window.onerror = (msg, url, lineNo, columnNo, error) => {
    remoteLog({ type: 'error', message: msg, url, lineNo, columnNo, stack: error?.stack });
    return false;
};

// Intercept axios errors too
axios.interceptors.response.use(
    response => response,
    error => {
        remoteLog({
            type: 'api_error',
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

function App() {
    const [landingVariant, setLandingVariant] = useState(() => localStorage.getItem('landingVariant') || 'organic');
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser && savedUser !== 'undefined' ? JSON.parse(savedUser) : null;
        } catch (e) {
            console.error('Failed to parse user from localStorage', e);
            return null;
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/settings');
                if (res.data.landingVariant) {
                    setLandingVariant(res.data.landingVariant);
                }
            } catch (e) {
                console.error('Failed to fetch global settings', e);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', landingVariant);
    }, [landingVariant]);

    const onUpdateVariant = async (newVariant) => {
        setLandingVariant(newVariant);
        localStorage.setItem('landingVariant', newVariant);
        try {
            await axios.post('/api/settings',
                { landingVariant: newVariant },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (e) {
            console.error('Failed to persist variant on server', e);
        }
    };



    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
    }, [user]);

    useEffect(() => {
        const handle = (e) => {
            const el = document.elementFromPoint(e.clientX, e.clientY);
            if (el && el.id === 'debug-test-btn') {
                alert('TEST BUTTON CLICKED! Input/Output working.');
            }
        };
        window.addEventListener('mousedown', handle, true);
        return () => window.removeEventListener('mousedown', handle, true);
    }, []);

    return (
        <Router>
            <div className="min-h-screen flex flex-col relative">
                {/* Background Grain/Noise is handled in index.css body */}
                <Navbar
                    user={user}
                    setToken={setToken}
                    variant={landingVariant}
                    onUpdateVariant={onUpdateVariant}
                />
                <main className={`flex-grow ${!token ? '' : 'pb-20 pt-10'}`}>
                    <Routes>
                        <Route path="/auth" element={token ? <Navigate to="/" /> : <Auth setToken={setToken} setUser={setUser} />} />
                        <Route path="/" element={token ? <Calculator token={token} /> : <Landing variant={landingVariant} />} />
                        <Route path="/admin" element={
                            (token && user?.email === 'sebretu33@gmail.com')
                                ? <Admin variant={landingVariant} setVariant={setLandingVariant} token={token} user={user} />
                                : <Navigate to="/" />
                        } />
                        <Route path="/przepisy" element={token ? <Recipes token={token} /> : <Navigate to="/auth" />} />
                        <Route path="/szybki-przepis" element={token ? <div className="max-w-7xl mx-auto py-10 px-4"><GuestCalculator token={token} /></div> : <Navigate to="/auth" />} />
                        <Route path="/zakupy" element={token ? <ShoppingList token={token} /> : <Navigate to="/auth" />} />
                        <Route path="/magazyn" element={token ? <Warehouse token={token} /> : <Navigate to="/auth" />} />
                        <Route path="/regulamin" element={<Regulamin />} />
                        <Route path="/polityka-prywatnosci" element={<PolitykaPrywatnosci />} />
                        <Route path="/nasza-misja" element={<NaszaMisja />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
