import { useState, useEffect } from "react";

export default function Counter({ globalCounter }) {
  return (
    <div>
      Global Pellet Count: {globalCounter}  {/* Display the global counter value */}
    </div>
  );
}