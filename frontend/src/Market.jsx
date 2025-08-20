import React, { useEffect, useState } from "react";
import { getMarket } from "./api";
import { useNavigate } from "react-router-dom";

function Market() {
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    async function fetchSymbols() {
      try {
        const data = await getMarket();
        setSymbols(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching symbols:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSymbols();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Market Symbols
      </h1>

      {symbols.length === 0 ? (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center">
          No symbols found.
        </div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Ticker</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {symbols.map((s, idx) => (
                <tr
                  key={s.id}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="px-6 py-3 border-b text-sm text-gray-700">
                    {s.id}
                  </td>
                  <td className="px-6 py-3 border-b text-sm text-gray-700">
                    {s.name}
                  </td>
                  <td className="px-6 py-3 border-b text-sm text-gray-700">
                    {s.ticker}
                  </td>
                  <td className="px-6 py-3 border-b text-center">
                    <button
                      onClick={() => navigate(`/ticker/${s.id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Market;
