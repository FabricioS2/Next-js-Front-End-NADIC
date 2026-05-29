"use client";

import { useEffect, useRef, useState } from "react";

export default function ThreeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // Verifica se o navegador suporta WebGL
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn("WebGL não suportado. O fundo 3D não será exibido.");
      setWebglSupported(false);
      return;
    }
    setWebglSupported(true);
  }, []);

  useEffect(() => {
    if (!webglSupported) return;

    const initThree = async () => {
      const THREE = await import('three');
      if (!containerRef.current) return;

      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#060d1a");
      scene.fog = new THREE.FogExp2("#060d1a", 0.00025);

      const camera = new THREE.PerspectiveCamera(55, width / height, 0.5, 80);
      camera.position.set(8, 5.5, 10);
      camera.lookAt(0, -1.5, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);

      // Luzes
      const ambientLight = new THREE.AmbientLight("#4488bb", 1.2);
      scene.add(ambientLight);
      const sunLight = new THREE.DirectionalLight("#ffe8d6", 3.5);
      sunLight.position.set(10, 14, 6);
      sunLight.castShadow = true;
      scene.add(sunLight);
      const causticLight = new THREE.PointLight("#88ccff", 8, 20);
      causticLight.position.set(2, 3, 4);
      scene.add(causticLight);

      // Chão
      const seabedGeom = new THREE.PlaneGeometry(30, 30, 40, 40);
      const positions = seabedGeom.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i], y = positions[i+1];
        positions[i+2] = -2.5 + Math.sin(x * 1.5) * Math.cos(y * 1.5) * 0.6;
      }
      seabedGeom.computeVertexNormals();
      const seabedMat = new THREE.MeshStandardMaterial({ color: "#C2A882", roughness: 0.85 });
      const seabed = new THREE.Mesh(seabedGeom, seabedMat);
      seabed.rotation.x = -Math.PI / 2;
      seabed.receiveShadow = true;
      scene.add(seabed);

      // Corais
      const coralGroup = new THREE.Group();
      const healthyColors = ["#FF6B5B", "#FF8E7A", "#E8553D"];
      const positionsCorals = [
        [-3.5, -2], [-2, -4], [1.5, -3.5], [4, -1.5], [-4.5, 2], [-1, 3], [3, 2.5]
      ];
      positionsCorals.forEach(([x, z]) => {
        const group = new THREE.Group();
        const trunkMat = new THREE.MeshStandardMaterial({ color: healthyColors[Math.floor(Math.random()*healthyColors.length)], roughness: 0.55 });
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 1.2, 6), trunkMat);
        trunk.position.y = -1.8;
        trunk.castShadow = true;
        group.add(trunk);
        for (let i=0; i<3; i++) {
          const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.9, 5), trunkMat);
          branch.position.set((Math.random()-0.5)*0.6, -1.2 + Math.random()*0.8, (Math.random()-0.5)*0.6);
          branch.rotation.z = Math.random() * Math.PI;
          branch.castShadow = true;
          group.add(branch);
        }
        group.position.set(x, 0, z);
        coralGroup.add(group);
      });
      scene.add(coralGroup);

      // Partículas
      const particlesCount = 400;
      const particlesGeom = new THREE.BufferGeometry();
      const particlesPositions = new Float32Array(particlesCount * 3);
      for (let i=0; i<particlesCount; i++) {
        particlesPositions[i*3] = (Math.random()-0.5)*16;
        particlesPositions[i*3+1] = -3 + Math.random()*10;
        particlesPositions[i*3+2] = (Math.random()-0.5)*16;
      }
      particlesGeom.setAttribute("position", new THREE.BufferAttribute(particlesPositions, 3));
      const particlesMat = new THREE.PointsMaterial({ color: "#ccddff", size: 0.04, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
      const particles = new THREE.Points(particlesGeom, particlesMat);
      scene.add(particles);

      let time = 0;
      let animationId: number;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        time += 0.016;
        camera.position.x = 8 + Math.sin(time*0.15)*1.5;
        camera.position.z = 10 + Math.cos(time*0.2)*1.5;
        camera.lookAt(0, -1.5, 0);
        const posAttr = particles.geometry.attributes.position.array;
        for (let i=0; i<particlesCount; i++) {
          posAttr[i*3+1] += 0.003;
          if (posAttr[i*3+1] > 6) {
            posAttr[i*3+1] = -3;
            posAttr[i*3] = (Math.random()-0.5)*16;
            posAttr[i*3+2] = (Math.random()-0.5)*16;
          }
        }
        particles.geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!containerRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(animationId);
        renderer.dispose();
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    };

    initThree();
  }, [webglSupported]);

  return <div ref={containerRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }} />;
}