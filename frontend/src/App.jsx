import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import UserPage from "./UserPage";
import Market from "./Market";
import Tricker from "./Ticker";
import Ticker from "./Ticker";
import './index.css' 

function App() {
  return (
    <BrowserRouter>
      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/">Home</Link> | <Link to="/register">Register</Link> |{" "}
        <Link to="/login">Login</Link> | <Link to="/me">User Page</Link> | <Link to="/market">Market</Link>
      </nav>
      <Routes>
        <Route path="/" element={<h1>Trading App</h1>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/me" element={<UserPage />} />
        <Route path="/market" element={<Market />} />
        <Route path="/ticker/:id" element={<Ticker />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
