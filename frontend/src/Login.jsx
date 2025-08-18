import { useState } from "react";
import { login } from "./api";
import { useNavigate } from "react-router-dom";
import { validateUser } from "./validator";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const valid = validateUser(form);
      const res = await login(form);
      localStorage.setItem("token", res.access_token); // save JWT
      setMsg("Login successful!");
      navigate("/me"); // ✅ redirect
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input name="username" placeholder="Username" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Login</button>
      <p>{msg}</p>
    </form>
  );
}

export default Login;
