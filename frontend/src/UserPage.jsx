import { useEffect, useState } from "react";

function UserPage() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:8000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, [token]);

  if (!token) {
    return <p>Please login first.</p>;
  }

  return (
    <div>
      {user ? (
        <>
          <h2>Welcome, {user.username} 👋</h2>
          <p>Email: {user.email}</p>
        </>
      ) : (
        <p>Loading user info...</p>
      )}
    </div>
  );
}

export default UserPage;
