import React from "react";

export default function Counter() {
  const [n, setN] = React.useState(0);
  return (
    <div>
      <button onClick={() => setN((s) => s - 1)}>-</button>
      <span style={{ padding: "0 12px" }}>{n}</span>
      <button onClick={() => setN((s) => s + 1)}>+</button>
    </div>
  );
}
