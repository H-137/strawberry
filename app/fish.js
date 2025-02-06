"use client";

import * as THREE from 'three';
import { MathUtils } from "three";
import { useEffect, useRef, useState } from "react";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import Counter from './counter';  // Import Counter component

function MyThree() {
  const refContainer = useRef(null);
  const modelRef = useRef(null); 
  const mousePosition = useRef({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0
  });
  const [score, setScore] = useState(0); // Counter for score
  const [globalCounter, setGlobalCounter] = useState(0);  // State to manage the global counter

  const handleMouseMove = (event) => {
    mousePosition.current = {
      x: (event.clientX - window.innerWidth / 2) * 2,
      y: -(event.clientY - window.innerHeight / 2) * 2
    };
  };

  const handleIncrement = async () => {
    try {
      // Increment the global counter in the backend
      const res = await fetch("/api/counter", { method: "POST" });
      const data = await res.json();
      console.log("Global counter incremented:", data.value);
      
      // Fetch the updated counter value and update the local state
      setGlobalCounter(data.value);  // Update global counter after increment
    } catch (error) {
      console.error("Error incrementing counter:", error);
    }
  };

  const handleResize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  useEffect(() => {
    // === THREE.JS CODE START ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x449aeb);
    const camera = new THREE.OrthographicCamera( window.innerWidth / - 100, window.innerWidth / 100, window.innerHeight / 100, window.innerHeight / - 100, 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    refContainer.current.appendChild(renderer.domElement);
    camera.position.z = 10;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Array to store balls
    const balls = [];

    // Function to create a new ball at a random position
    const createRandomBall = () => {
      const geometry = new THREE.SphereGeometry(0.1, 32, 32);
      // brown
      const material = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
      const circle = new THREE.Mesh(geometry, material);
      circle.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, 0);
      return circle;
    };

    // Create and add 10 balls to the scene
    for (let i = 0; i < 5; i++) {
      const ball = createRandomBall();
      balls.push(ball);
      scene.add(ball);
    }

    // Load MTL and then OBJ
    const mtlLoader = new MTLLoader();
    mtlLoader.load("/Mesh_Goldfish.mtl", (materials) => {
      materials.preload();

      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(
        "/Mesh_Goldfish.obj",
        (object) => {
          object.name = "beta";
          object.position.set(0, 0, 0);
          object.scale.set(0.03, 0.03, 0.03);
          object.rotation.set(90, 0, 0);
          scene.add(object);
          modelRef.current = object; // ✅ Store the model reference
        },
        (xhr) => console.log(`OBJ Loading: ${(xhr.loaded / xhr.total) * 100}%`),
        (error) => console.error("Error loading OBJ:", error)
      );
    });

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (modelRef.current) {
        const mouseVector = new THREE.Vector3(mousePosition.current.x, mousePosition.current.y, 0.5);
        mouseVector.unproject(camera);

        // Get Direction to Mouse Position
        const direction = new THREE.Vector3().subVectors(mouseVector, modelRef.current.position).normalize();

        // Compute Rotation Angle (Y-Axis)
        const targetRotationY = Math.atan2(direction.x, -direction.y);
        modelRef.current.rotation.y = targetRotationY;

        // Update position based on mouse movement
        modelRef.current.position.x = MathUtils.lerp(modelRef.current.position.x, mousePosition.current.x / 100, 0.01);
        modelRef.current.position.y = MathUtils.lerp(modelRef.current.position.y, mousePosition.current.y / 100, 0.01);
        
        // Collision detection with balls
        balls.forEach((ball, index) => {
          const distance = modelRef.current.position.distanceTo(ball.position);
          if (distance < 0.2) {  // When the distance is small enough, it's considered a "collision"
            // Re-randomize ball position
            scene.remove(ball);  // Remove the ball from the scene
            balls.splice(index, 1);  // Remove ball from array
            const newBall = createRandomBall();  // Create a new ball at a random position
            balls.push(newBall);  // Add the new ball to the array
            scene.add(newBall);  // Add the new ball to the scene
            setScore(prevScore => prevScore + 1);  // Increment the score locally
            // scale fish size by 1.1
            modelRef.current.scale.set(modelRef.current.scale.x + 0.0001, modelRef.current.scale.y + 0.0001, modelRef.current.scale.z + 0.0001);
            handleIncrement();  // Increment the global counter after each collision
            // play audio
            const audio = new Audio("/eating.mp3");
            audio.play();
          }
        });
      }
      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the renderer when component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (refContainer.current) {
        refContainer.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [windowSize]);

  return (
    <div>
      <div ref={refContainer} onMouseMove={handleMouseMove} style={{ width: "100vw", height: "100vh" }} />
      <div style={{ position: 'absolute', top: 5, left: 5, color: 'white', fontSize: 24, fontFamily: 'Pacifico, cursive' }}>
        Pellet Count: {score}
      </div>
      <div style={{ position: 'absolute', top: 5, right: 5, color: 'white', fontSize: 24, fontFamily: 'Pacifico, cursive' }}>
        <Counter globalCounter={globalCounter} /> {/* Pass the globalCounter state */}
      </div>
    </div>
  );
}

export default MyThree;
