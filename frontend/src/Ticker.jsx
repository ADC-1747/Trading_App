// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { getMarket, postNewOrder } from "./api";

// function Ticker() {
//   const { id } = useParams();
//   const [symbol, setSymbol] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showOrderForm, setShowOrderForm] = useState(false);
//   const [side, setSide] = useState("B"); // Buy or Sell
//   const [orderType, setOrderType] = useState("L"); // limit or market
//   const [quantity, setQuantity] = useState(1);
//   const [price, setPrice] = useState("");
//   const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
//   const [ltp, setLtp] = useState(null);


//   // Fetch symbol data
//   useEffect(() => {
//     async function fetchSymbol() {
//       try {
//         const symbols = await getMarket();
//         const found = symbols.find((s) => s.id === parseInt(id));
//         setSymbol(found);
//       } catch (err) {
//         console.error("Failed to fetch symbol:", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchSymbol();
//   }, [id]);

//   // Update price when order type changes
//   useEffect(() => {
//     if (orderType === "M") {
//       setPrice(0);
//     } else if (orderType === "L" && price === 0) {
//       setPrice("");
//     }
//   }, [orderType]);

//   // WebSocket for live order book
//   useEffect(() => {
//     if (!symbol) return;

//     const ws = new WebSocket(`wss://localhost:8000/ws/orderbook/${symbol.id}`);

//     ws.onopen = () => console.log("Connected to order book WebSocket");
//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.symbol_id === symbol.id) {
//         setOrderBook(data.order_book);
//         setLtp(data.ltp);
//       }
//     };
//     ws.onerror = (err) => console.error("WebSocket error:", err);
//     ws.onclose = () => console.log("WebSocket disconnected");

//     return () => ws.close();
//   }, [symbol]);

//   const handleOrderSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await postNewOrder({
//         symbol_id: symbol.id,
//         side,
//         type: orderType,
//         quantity,
//         price,
//       });
//       console.log("Order placed:", res);
//     } catch (err) {
//       console.error("Failed to place order:", err.message);
//     } finally {
//       // Reset form after submission
//       setQuantity(1);
//       setPrice(orderType === "M" ? 0 : "");
//       setSide("B");
//       setOrderType("L");
//       setShowOrderForm(false);
//     }
//   };

//   if (loading) return <p>Loading...</p>;
//   if (!symbol) return <p>Symbol not found</p>;

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold">
//         {symbol.name} ({symbol.ticker})
//       </h1>
//       <br />
//       <h2 className="text-lg font-bold">
//         LTP: {ltp !== null ? ltp : "—"}
//       </h2>

//       {/* Order Book */}
//       <div className="mt-4">
//         <h2 className="text-xl font-semibold">Order Book</h2>
//         <div className="grid grid-cols-2 gap-4 mt-2">
//           <div>
//             <h3 className="font-semibold">Bids</h3>
//             <ul>
//               {orderBook.bids.map((b, i) => (
//                 <li key={i}>
//                   Price: {b.price}, Qty: {b.quantity}
//                 </li>
//               ))}
//             </ul>
//           </div>
//           <div>
//             <h3 className="font-semibold">Asks</h3>
//             <ul>
//               {orderBook.asks.map((a, i) => (
//                 <li key={i}>
//                   Price: {a.price}, Qty: {a.quantity}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </div>

//       {/* Place Order */}
//       <button
//         className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
//         onClick={() => setShowOrderForm(!showOrderForm)}
//       >
//         Place Order
//       </button>

//       {showOrderForm && (
//         <form onSubmit={handleOrderSubmit} className="mt-4 p-4 border rounded w-64">
//           <div className="mb-2">
//             <label className="block mb-1">Side:</label>
//             <select
//               value={side}
//               onChange={(e) => setSide(e.target.value)}
//               className="w-full border px-2 py-1 rounded"
//             >
//               <option value="B">Buy</option>
//               <option value="S">Sell</option>
//             </select>
//           </div>

//           <div className="mb-2">
//             <label className="block mb-1">Order Type:</label>
//             <select
//               value={orderType}
//               onChange={(e) => setOrderType(e.target.value)}
//               className="w-full border px-2 py-1 rounded"
//             >
//               <option value="L">Limit</option>
//               <option value="M">Market</option>
//             </select>
//           </div>

//           <div className="mb-2">
//             <label className="block mb-1">Quantity:</label>
//             <input
//               type="number"
//               step="1"
//               min="1"
//               value={quantity}
//               onChange={(e) => setQuantity(parseInt(e.target.value))}
//               className="w-full border px-2 py-1 rounded"
//               required
//             />
//           </div>

//           <div className="mb-2">
//             <label className="block mb-1">Price:</label>
//             <input
//               type="number"
//               step="0.01"
//               min="0"
//               value={price}
//               onChange={(e) => setPrice(parseFloat(e.target.value))}
//               className="w-full border px-2 py-1 rounded"
//               required={orderType === "L"}
//               disabled={orderType === "M"}
//             />
//           </div>

//           <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
//             Submit Order
//           </button>
//         </form>
//       )}
//     </div>
//   );
// }

// export default Ticker;


import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMarket, postNewOrder } from "./api";

function Ticker() {
  const { id } = useParams();
  const [symbol, setSymbol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Order form state
  const [side, setSide] = useState("B"); // Buy or Sell
  const [orderType, setOrderType] = useState("L"); // Limit or Market
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [msg, setMsg] = useState("");

  // Market data
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [ltp, setLtp] = useState(null);

  // Fetch symbol data
  useEffect(() => {
    async function fetchSymbol() {
      try {
        const symbols = await getMarket();
        const found = symbols.find((s) => s.id === parseInt(id));
        setSymbol(found);
      } catch (err) {
        console.error("Failed to fetch symbol:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSymbol();
  }, [id]);

  // Update price when order type changes
  useEffect(() => {
    if (orderType === "M") {
      setPrice(0);
    } else if (orderType === "L" && price === 0) {
      setPrice("");
    }
  }, [orderType]);

  // WebSocket for live order book
  useEffect(() => {
    if (!symbol) return;

    const ws = new WebSocket(`wss://localhost:8000/ws/orderbook/${symbol.id}`);

    ws.onopen = () => console.log("Connected to order book WebSocket");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.symbol_id === symbol.id) {
        setOrderBook(data.order_book);
        setLtp(data.ltp);
      }
    };
    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = () => console.log("WebSocket disconnected");

    return () => ws.close();
  }, [symbol]);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await postNewOrder({
        symbol_id: symbol.id,
        side,
        type: orderType,
        quantity,
        price,
      });
      console.log("Order placed:", res);
      setMsg("✅ Order placed successfully!");
    } catch (err) {
      console.error("Failed to place order:", err.message);
      setMsg("❌ Failed to place order: " + err.message);
    } finally {
      // Reset form after submission
      setQuantity(1);
      setPrice(orderType === "M" ? 0 : "");
      setSide("B");
      setOrderType("L");
      setShowOrderForm(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!symbol) return <p className="p-4">Symbol not found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        {symbol.name} ({symbol.ticker})
      </h1>
      <p className="text-lg mt-2">LTP: {ltp !== null ? ltp : "—"}</p>

      {/* Order Book */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Order Book</h2>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="p-3 border rounded bg-green-50">
            <h3 className="font-semibold text-green-700">Bids</h3>
            <ul className="space-y-1 mt-2">
              {orderBook.bids.length > 0 ? (
                orderBook.bids.map((b, i) => (
                  <li key={i}>
                    <span className="font-medium">Price:</span> {b.price},{" "}
                    <span className="font-medium">Qty:</span> {b.quantity}
                  </li>
                ))
              ) : (
                <li>No bids</li>
              )}
            </ul>
          </div>
          <div className="p-3 border rounded bg-red-50">
            <h3 className="font-semibold text-red-700">Asks</h3>
            <ul className="space-y-1 mt-2">
              {orderBook.asks.length > 0 ? (
                orderBook.asks.map((a, i) => (
                  <li key={i}>
                    <span className="font-medium">Price:</span> {a.price},{" "}
                    <span className="font-medium">Qty:</span> {a.quantity}
                  </li>
                ))
              ) : (
                <li>No asks</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Place Order */}
      <button
        className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        onClick={() => setShowOrderForm(!showOrderForm)}
      >
        {showOrderForm ? "Cancel" : "Place Order"}
      </button>

      {showOrderForm && (
        <form
          onSubmit={handleOrderSubmit}
          className="mt-6 p-4 border rounded shadow w-72 bg-gray-50"
        >
          <div className="mb-3">
            <label className="block mb-1 font-medium">Side:</label>
            <select
              value={side}
              onChange={(e) => setSide(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="B">Buy</option>
              <option value="S">Sell</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block mb-1 font-medium">Order Type:</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="L">Limit</option>
              <option value="M">Market</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block mb-1 font-medium">Quantity:</label>
            <input
              type="number"
              step="1"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full border px-2 py-1 rounded"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 font-medium">Price:</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              className="w-full border px-2 py-1 rounded"
              required={orderType === "L"}
              disabled={orderType === "M"}
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Submit Order
          </button>
        </form>
      )}

      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </div>
  );
}

export default Ticker;
