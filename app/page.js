"use client";
import Image from "next/image";
import styles from "./page.module.css";
import MyThree from "./fish";
import { useState } from "react";

export default function Home() {
  const [showDiv, setShowDiv] = useState(true);

  const handleButtonClick = () => {
    setShowDiv(false);
  };

  return (
    <div>
      <h1 className={styles.header}>Feeding Strawberry</h1>
      {showDiv && (
        <div className={styles.content}>
          <div className={styles.container}>
            <img className={styles.img} src="/strawberry.JPG" alt="Strawberry" height={400}/>
            <button className={styles.top} onClick={handleButtonClick}>X </button>
          </div>
          This is Strawberry the fish. She is very hungry! <br />
          Help her find the food in her tank! <br />
          🐟
        </div>
      )}
      <MyThree />
    </div>
  );
}
