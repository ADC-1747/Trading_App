// import React, { useEffect, useState } from "react";
// import { getMarket } from "./api";
// import { useNavigate } from "react-router-dom"; // ⬅️ for navigation


// function Market() {
//   const [symbols, setSymbols] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();
  

//   useEffect(() => {
//      if (!token) {
//       navigate("/login"); // ⬅️ redirect if no token
//       return;
//     }
//     async function fetchSymbols() {
//       try {
//         const data = await getMarket();
//         console.log("API response:", data); // 🔍 debug
//         setSymbols(Array.isArray(data) ? data : []); // ensure array
//       } catch (err) {
//         console.error("Error fetching symbols:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchSymbols();
//   }, []);

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Market Symbols</h1>
//       {symbols.length === 0 ? (
//         <p>No symbols found.</p>
//       ) : (
//         <table className="min-w-full border border-gray-300">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="px-4 py-2 border">ID</th>
//               <th className="px-4 py-2 border">Name</th>
//               <th className="px-4 py-2 border">Ticker</th>
//             </tr>
//           </thead>
//           <tbody>
//             {symbols.map((s) => (
//               <tr key={s.id}>
//                 <td className="px-4 py-2 border">{s.id}</td>
//                 <td className="px-4 py-2 border">{s.name}</td>
//                 <td className="px-4 py-2 border">{s.ticker}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }

// export default Market;

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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Market Symbols</h1>
      {symbols.length === 0 ? (
        <p>No symbols found.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Ticker</th>
              <th className="px-4 py-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {symbols.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2 border">{s.id}</td>
                <td className="px-4 py-2 border">{s.name}</td>
                <td className="px-4 py-2 border">{s.ticker}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => navigate(`/ticker/${s.id}`)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Market;

