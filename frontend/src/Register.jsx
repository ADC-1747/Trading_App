import { useState } from "react";
import { register } from "./api";
import { useNavigate } from "react-router-dom";
import { validateUser } from "./validator";
import { validateEmail } from "./validator";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const valid = validateUser(form);
      const validEmail = validateEmail(form.email);
      const user = await register(form);
      setMsg(`User registered: ${user.username}`);
      navigate("/login"); // ✅ redirect to login (or directly to /me if you prefer)
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input name="username" placeholder="Username" onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Register</button>
      <p>{msg}</p>
    </form>
  );
}

export default Register;
