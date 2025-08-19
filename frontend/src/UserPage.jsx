import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ⬅️ for navigation
import { getUserPage } from "./api";

function UserPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login"); // ⬅️ redirect if no token
      return;
    }

    async function fetchUser() {
      try {
        const data = await getUserPage();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        localStorage.removeItem("token");
        navigate("/login"); // ⬅️ redirect on error/expired token
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [token, navigate]);

  if (loading) {
    return <p>Loading user info...</p>;
  }

  return (
    <div>
      {user ? (
        <>
          <h2>Welcome, {user.username} 👋</h2>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </>
      ) : (
        <p>Could not load user info.</p>
      )}
    </div>
  );
}

export default UserPage;
