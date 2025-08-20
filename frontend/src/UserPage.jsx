import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { 
  getUserPage, 
  getUserOrders, 
  getUserTrades, 
  cancelActiveOrder, 
  getAllOrders, 
  getAllTrades 
} from "./api";

function UserPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [notification, setNotification] = useState(null); // 🔔 Notification state
  const [showOrders, setShowOrders] = useState(""); // "active" | "past" | "trades" | "all_orders" | "all_trades"
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
          order => order.status === "filled" || order.status === "cancelled"
        );
      } else if (type === "trades") {
        data = await getUserTrades();
      } else if (type === "all_orders") {
        data = await getAllOrders();
      } else if (type === "all_trades") {
        data = await getAllTrades();
      }
      setOrders(data);
      setShowOrders(type);
    } catch (err) {
      console.error("Failed to fetch orders/trades:", err);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };


  if (loading) return <p className="text-center mt-10">Loading user info...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* 🔔 Notification Toast */}
      {notification && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg text-white transition 
            ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}
        >
          {notification.message}
        </div>
      )}


      {/* User Info Card */}
      {user && (
        <div className="bg-white shadow-md rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Welcome, {user.username} 👋
          </h2>
          <p className="text-gray-600">Email: {user.email}</p>
          <p className="text-gray-600">Role: {user.role}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg shadow-md transition 
            ${showOrders === "active" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
          onClick={() => handleShowOrders("active")}
        >
          Active Orders
        </button>
        <button
          className={`px-4 py-2 rounded-lg shadow-md transition 
            ${showOrders === "past" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
          onClick={() => handleShowOrders("past")}
        >
          Past Orders
        </button>
        <button
          className={`px-4 py-2 rounded-lg shadow-md transition 
            ${showOrders === "trades" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
          onClick={() => handleShowOrders("trades")}
        >
          View Trades
        </button>

        {/* Admin only buttons */}
        {user?.role === "admin" && (
          <>
            <button
              className={`px-4 py-2 rounded-lg shadow-md transition 
                ${showOrders === "all_orders" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"}`}
              onClick={() => handleShowOrders("all_orders")}
            >
              View All Orders
            </button>
            <button
              className={`px-4 py-2 rounded-lg shadow-md transition 
                ${showOrders === "all_trades" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"}`}
              onClick={() => handleShowOrders("all_trades")}
            >
              View All Trades
            </button>
          </>
        )}
      </div>

      {/* User Orders Table */}
      {orders.length > 0 && (showOrders === "active" || showOrders === "past") && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-2 border">Order ID</th>
                <th className="px-4 py-2 border">Ticker</th>
                <th className="px-4 py-2 border">Side</th>
                <th className="px-4 py-2 border">Quantity</th>
                <th className="px-4 py-2 border">Price</th>
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Timestamp</th>
                <th className="px-4 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="text-center hover:bg-gray-50">
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
                        className="px-3 py-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
                        onClick={async () => {
                           try {
                            await cancelActiveOrder(order.id);
                            showNotification("✅ Order cancelled successfully!");
                            handleShowOrders(showOrders);
                          } catch (err) {
                            console.error("Failed to cancel order:", err);
                            showNotification("❌ Failed to cancel order.", "error");
                          }
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Trades Table */}
      {orders.length > 0 && showOrders === "trades" && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-2 border">Trade ID</th>
                <th className="px-4 py-2 border">Ticker</th>
                <th className="px-4 py-2 border">Buy Order ID</th>
                <th className="px-4 py-2 border">Sell Order ID</th>
                <th className="px-4 py-2 border">Price</th>
                <th className="px-4 py-2 border">Quantity</th>
                <th className="px-4 py-2 border">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((trade) => (
                <tr key={trade.id} className="text-center hover:bg-gray-50">
                  <td className="px-4 py-2 border">{trade.id}</td>
                  <td className="px-4 py-2 border">{trade.ticker}</td>
                  <td className="px-4 py-2 border">{trade.buy_order_id}</td>
                  <td className="px-4 py-2 border">{trade.sell_order_id}</td>
                  <td className="px-4 py-2 border">{trade.trade_price}</td>
                  <td className="px-4 py-2 border">{trade.trade_quantity}</td>
                  <td className="px-4 py-2 border">{trade.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin - All Orders Table */}
      {orders.length > 0 && showOrders === "all_orders" && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg shadow-sm text-sm">
            <thead>
              <tr className="bg-green-100 text-gray-700">
                <th className="px-2 py-1 border">Order ID</th>
                <th className="px-2 py-1 border">User ID</th>
                <th className="px-2 py-1 border">Ticker</th>
                <th className="px-2 py-1 border">Side</th>
                <th className="px-2 py-1 border">Quantity</th>
                <th className="px-2 py-1 border">Price</th>
                <th className="px-2 py-1 border">Type</th>
                <th className="px-2 py-1 border">Status</th>
                <th className="px-2 py-1 border">Created At</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="text-center hover:bg-gray-50">
                  <td className="px-2 py-1 border">{order.id}</td>
                  <td className="px-2 py-1 border">{order.user_id}</td>
                  <td className="px-2 py-1 border">{order.ticker}</td>
                  <td className="px-2 py-1 border">{order.side}</td>
                  <td className="px-2 py-1 border">{order.quantity}</td>
                  <td className="px-2 py-1 border">{order.price}</td>
                  <td className="px-2 py-1 border">{order.type}</td>
                  <td className="px-2 py-1 border">{order.status}</td>
                  <td className="px-2 py-1 border">{order.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin - All Trades Table */}
      {orders.length > 0 && showOrders === "all_trades" && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg shadow-sm text-sm">
            <thead>
              <tr className="bg-green-100 text-gray-700">
                <th className="px-2 py-1 border">Trade ID</th>
                <th className="px-2 py-1 border">Ticker</th>
                <th className="px-2 py-1 border">Buy User ID</th>
                <th className="px-2 py-1 border">Buy Order ID</th>
                <th className="px-2 py-1 border">Sell User ID</th>
                <th className="px-2 py-1 border">Sell Order ID</th>
                <th className="px-2 py-1 border">Price</th>
                <th className="px-2 py-1 border">Quantity</th>
                <th className="px-2 py-1 border">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((trade) => (
                <tr key={trade.id} className="text-center hover:bg-gray-50">
                  <td className="px-2 py-1 border">{trade.id}</td>
                  <td className="px-2 py-1 border">{trade.ticker}</td>
                  <td className="px-2 py-1 border">{trade.buy_user_id}</td>
                  <td className="px-2 py-1 border">{trade.buy_order_id}</td>
                  <td className="px-2 py-1 border">{trade.sell_user_id}</td>
                  <td className="px-2 py-1 border">{trade.sell_order_id}</td>
                  <td className="px-2 py-1 border">{trade.trade_price}</td>
                  <td className="px-2 py-1 border">{trade.trade_quantity}</td>
                  <td className="px-2 py-1 border">{trade.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No data */}
      {orders.length === 0 && showOrders && (
        <p className="text-center text-gray-500 mt-6">No records found.</p>
      )}
    </div>
  );
}

export default UserPage;
