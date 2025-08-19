import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMarket, postNewOrder } from "./api";

function Ticker() {
  const { id } = useParams();
  const [symbol, setSymbol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [side, setSide] = useState("B"); // Buy or Sell
  const [orderType, setOrderType] = useState("L"); // limit or market
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");

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

  if (loading) return <p>Loading...</p>;
  if (!symbol) return <p>Symbol not found</p>;

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
    } catch (err) {
      console.error("Failed to place order:", err.message);
    } finally {
      // Reset form after submission
      setQuantity(1);
      setPrice(orderType === "M" ? 0 : "");
      setSide("B");
      setOrderType("L");
      setShowOrderForm(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        {symbol.name} ({symbol.ticker})
      </h1>

      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => setShowOrderForm(!showOrderForm)}
      >
        Place Order
      </button>

      {showOrderForm && (
        <form onSubmit={handleOrderSubmit} className="mt-4 p-4 border rounded w-64">
          <div className="mb-2">
            <label className="block mb-1">Side:</label>
            <select
              value={side}
              onChange={(e) => setSide(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="B">Buy</option>
              <option value="S">Sell</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="block mb-1">Order Type:</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="L">Limit</option>
              <option value="M">Market</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="block mb-1">Quantity:</label>
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

          <div className="mb-2">
            <label className="block mb-1">Price:</label>
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

          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
            Submit Order
          </button>
        </form>
      )}
    </div>
  );
}

export default Ticker;
