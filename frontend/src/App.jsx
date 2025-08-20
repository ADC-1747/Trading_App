import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import UserPage from "./UserPage";
import Market from "./Market";
import Ticker from "./Ticker";
import './index.css';

function App() {
  return (
    <BrowserRouter>
      {/* Navigation */}
      <header className="bg-gray-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300">
              TradingApp
            </Link>

            {/* Nav Links */}
            <nav className="space-x-6 text-gray-300 font-medium">
              <Link to="/register" className="hover:text-white transition">Register</Link>
              <Link to="/login" className="hover:text-white transition">Login</Link>
              <Link to="/me" className="hover:text-white transition">User Page</Link>
              <Link to="/market" className="hover:text-white transition">Market</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="bg-gray-100 min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route 
              path="/" 
              element={
                <div className="text-center py-20">
                  <h1 className="text-4xl font-extrabold text-gray-800">Welcome to TradingApp</h1>
                  <p className="mt-4 text-lg text-gray-600">
                    Your professional platform for trading, analysis, and portfolio management.
                  </p>
                </div>
              } 
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/me" element={<UserPage />} />
            <Route path="/market" element={<Market />} />
            <Route path="/ticker/:id" element={<Ticker />} />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}

export default App;
