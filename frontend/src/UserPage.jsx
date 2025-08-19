import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { getUserPage, getUserOrders, getUserTrades, cancelActiveOrder } from "./api"; // add past orders if needed

function UserPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(""); // "active" or "past"
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    async function fetchUser() {
      try {
        const data = await getUserPage();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [token, navigate]);

  const handleShowOrders = async (type) => {
    try {
      let data = [];
      if (type === "active") {
        data = await getUserOrders();
        data = data.filter(
          order => order.status === "pending" || order.status === "partially_filled"
        );
      } else if (type === "past") {
        data = await getUserOrders();
        data = data.filter(
          order => order.status === "executed" || order.status === "cancelled"
        );
      } else {
        data = await getUserTrades();
      }
      setOrders(data);
      setShowOrders(type);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  if (loading) return <p>Loading user info...</p>;

  return (
    <div>
      {user && (
        <>
          <h2>Welcome, {user.username} 👋</h2>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </>
      )}

      <div className="mt-4 flex gap-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => handleShowOrders("active")}
        >
          View Active Orders
        </button>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded"
          onClick={() => handleShowOrders("past")}
        >
          View Past Orders
        </button>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded"
          onClick={() => handleShowOrders("trades")}
        >
          View Trades
        </button>
      </div>

      {orders.length > 0 && (
        <table className="mt-4 min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Order ID</th>
              <th className="px-4 py-2 border">Ticker</th>
              <th className="px-4 py-2 border">Side</th>
              <th className="px-4 py-2 border">Quantity</th>
              <th className="px-4 py-2 border">Price</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-2 border">{order.id}</td>
                <td className="px-4 py-2 border">{order.ticker}</td>
                <td className="px-4 py-2 border">{order.side}</td>
                <td className="px-4 py-2 border">{order.quantity}</td>
                <td className="px-4 py-2 border">{order.price}</td>
                <td className="px-4 py-2 border">{order.type}</td>
                <td className="px-4 py-2 border">{order.status}</td>
                <td className="px-4 py-2 border">{order.timestamp}</td>
                <td className="px-4 py-2 border">
                  {order.status === "pending" && (
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => cancelActiveOrder(order.id)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserPage;
