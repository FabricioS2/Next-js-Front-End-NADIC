"use client";

import { useEffect, useRef, useState } from "react";

export default function ThreeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
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

      // --- Cena ---
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#1a7a8a");
      scene.fog = new THREE.Fog("#1a7a8a", 8, 30);

      const camera = new THREE.PerspectiveCamera(55, width / height, 0.5, 60);
      camera.position.set(6, 3.5, 8);
      camera.lookAt(0, -0.5, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);

      // --- Iluminação ---
      const ambient = new THREE.AmbientLight("#8ecae6", 0.7);
      scene.add(ambient);

      const sun = new THREE.DirectionalLight("#fffdf0", 4.0);
      sun.position.set(15, 18, 5);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 2048;
      sun.shadow.mapSize.height = 2048;
      sun.shadow.camera.near = 1;
      sun.shadow.camera.far = 50;
      sun.shadow.camera.left = -15;
      sun.shadow.camera.right = 15;
      sun.shadow.camera.top = 15;
      sun.shadow.camera.bottom = -5;
      scene.add(sun);

      const fillLight = new THREE.PointLight("#a2d6f9", 3, 20);
      fillLight.position.set(-3, 2, 4);
      scene.add(fillLight);

      // Raios de sol volumétricos (mantido)
      const godRaysGroup = new THREE.Group();
      for (let i = 0; i < 8; i++) {
        const rayGeom = new THREE.CylinderGeometry(0.05, 0.3, 5 + Math.random() * 4, 8);
        const rayMat = new THREE.MeshBasicMaterial({
          color: "#ffffff",
          transparent: true,
          opacity: 0.02 + Math.random() * 0.04,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const ray = new THREE.Mesh(rayGeom, rayMat);
        ray.position.set((Math.random() - 0.5) * 10, 1, (Math.random() - 0.5) * 8);
        ray.rotation.z = (Math.random() - 0.5) * 0.3;
        ray.rotation.x = (Math.random() - 0.5) * 0.3;
        godRaysGroup.add(ray);
      }
      scene.add(godRaysGroup);

      // --- Solo arenoso (mantido) ---
      const sandGeom = new THREE.PlaneGeometry(30, 30, 64, 64);
      const sandPos = sandGeom.attributes.position.array;
      for (let i = 0; i < sandPos.length; i += 3) {
        sandPos[i + 2] = Math.sin(sandPos[i] * 2) * Math.cos(sandPos[i + 1] * 2) * 0.3;
      }
      sandGeom.computeVertexNormals();
      const sandMat = new THREE.MeshStandardMaterial({
        color: "#e9d8a6",
        roughness: 0.9,
        metalness: 0.0,
      });
      const sand = new THREE.Mesh(sandGeom, sandMat);
      sand.rotation.x = -Math.PI / 2;
      sand.position.y = -2.8;
      sand.receiveShadow = true;
      scene.add(sand);

      // Pequenas pedras e conchas (mantido)
      const pebblesGroup = new THREE.Group();
      for (let i = 0; i < 50; i++) {
        const pebbleGeom = new THREE.SphereGeometry(0.05 + Math.random() * 0.15, 4, 3);
        const pebbleMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(`hsl(${30 + Math.random() * 30}, 40%, ${70 + Math.random() * 25}%)`),
          roughness: 0.7,
        });
        const pebble = new THREE.Mesh(pebbleGeom, pebbleMat);
        pebble.position.set(
          (Math.random() - 0.5) * 16,
          -2.7,
          (Math.random() - 0.5) * 16
        );
        pebble.castShadow = true;
        pebble.receiveShadow = true;
        pebblesGroup.add(pebble);
      }
      scene.add(pebblesGroup);

      // --- CORAIS MELHORADOS (mais realistas) ---
      const coralsGroup = new THREE.Group();

      // Posições dos corais principais
      const coralPositions: [number, number, number][] = [
        [-3, -2.5, -2], [2, -2.5, -1.5], [-0.5, -2.5, 2],
        [4, -2.5, 3], [-4.5, -2.5, 2.5], [0, -2.5, -3.5],
        [3.5, -2.5, -3], [-2, -2.5, 3.5], [1.5, -2.5, 0],
        [-3.8, -2.5, -3.5], [4.8, -2.5, -0.5], [-1, -2.5, -4.5],
      ];

      // Cores vibrantes de coral real
      const coralColors = [
        "#ff6b6b", "#f0655e", "#e85d5a", "#d94f4f",
        "#ff8c69", "#ff7b54", "#fb8b67", "#ff9f7c",
        "#ffb347", "#ffaa66", "#ff9f4a", "#ffad7a",
        "#e36f6f", "#da6f6f", "#cd5c5c", "#b94e4e"
      ];

      coralPositions.forEach(([x, y, z]) => {
        const coral = createRealisticCoral(THREE, coralColors);
        coral.position.set(x, y, z);
        coral.rotation.y = Math.random() * Math.PI * 2;
        const scale = 0.8 + Math.random() * 0.7;
        coral.scale.setScalar(scale);
        coralsGroup.add(coral);
      });

      // Corais menores ao redor
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 2 + Math.random() * 6;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const smallCoral = createRealisticCoral(THREE, coralColors, 2);
        smallCoral.position.set(x, -2.5, z);
        smallCoral.rotation.y = Math.random() * Math.PI * 2;
        smallCoral.scale.setScalar(0.4 + Math.random() * 0.5);
        coralsGroup.add(smallCoral);
      }

      scene.add(coralsGroup);

      // --- Esponjas e ouriços (mantidos) ---
      const spongeGroup = new THREE.Group();
      for (let i = 0; i < 6; i++) {
        const spongeGeom = new THREE.IcosahedronGeometry(0.3 + Math.random() * 0.4, 1);
        const spongePos = spongeGeom.attributes.position.array;
        for (let j = 0; j < spongePos.length; j += 3) {
          spongePos[j] += (Math.random() - 0.5) * 0.15;
          spongePos[j + 1] += (Math.random() - 0.5) * 0.15;
          spongePos[j + 2] += (Math.random() - 0.5) * 0.15;
        }
        spongeGeom.computeVertexNormals();
        const spongeMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(`hsl(${Math.random() * 360}, 50%, 60%)`),
          roughness: 0.8,
          metalness: 0.1,
        });
        const sponge = new THREE.Mesh(spongeGeom, spongeMat);
        sponge.position.set(
          (Math.random() - 0.5) * 12,
          -2.5 + Math.random() * 0.2,
          (Math.random() - 0.5) * 12
        );
        sponge.castShadow = true;
        sponge.receiveShadow = true;
        spongeGroup.add(sponge);
      }
      scene.add(spongeGroup);

      // Ouriços
      for (let i = 0; i < 8; i++) {
        const urchinGroup = new THREE.Group();
        const bodyGeom = new THREE.SphereGeometry(0.15, 6, 4);
        const bodyMat = new THREE.MeshStandardMaterial({ color: "#2b1f1f", roughness: 0.6 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.castShadow = true;
        body.receiveShadow = true;
        urchinGroup.add(body);
        for (let j = 0; j < 20; j++) {
          const spineGeom = new THREE.ConeGeometry(0.02, 0.15, 4);
          const spine = new THREE.Mesh(spineGeom, bodyMat);
          spine.position.set(
            (Math.random() - 0.5) * 0.25,
            (Math.random() - 0.5) * 0.25,
            (Math.random() - 0.5) * 0.25
          );
          spine.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
          spine.castShadow = true;
          urchinGroup.add(spine);
        }
        urchinGroup.position.set(
          (Math.random() - 0.5) * 10,
          -2.5 + Math.random() * 0.1,
          (Math.random() - 0.5) * 10
        );
        spongeGroup.add(urchinGroup);
      }

      // --- Cardumes de peixes (mantido) ---
      const fishGroup = new THREE.Group();
      const fishCount = 60;
      const fishColors = ["#ffb703", "#fb8500", "#ff006e", "#8338ec", "#3a86ff", "#06d6a0"];
      const fishData: {
        group: THREE.Group;
        speed: number;
        offset: number;
      }[] = [];

      const fishBodyGeom = new THREE.ConeGeometry(0.08, 0.25, 4);
      fishBodyGeom.rotateX(Math.PI / 2);
      const tailGeom = new THREE.ConeGeometry(0.06, 0.15, 4);
      tailGeom.rotateX(-Math.PI / 2);
      tailGeom.translate(0, 0, -0.15);

      for (let i = 0; i < fishCount; i++) {
        const color = fishColors[Math.floor(Math.random() * fishColors.length)];
        const fishMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.2 });
        const fishBody = new THREE.Mesh(fishBodyGeom, fishMat);
        const tail = new THREE.Mesh(tailGeom, fishMat);
        const fishSingle = new THREE.Group();
        fishSingle.add(fishBody);
        fishSingle.add(tail);
        fishSingle.position.set(
          (Math.random() - 0.5) * 14,
          -1.5 + Math.random() * 3.5,
          (Math.random() - 0.5) * 14
        );
        fishSingle.scale.setScalar(0.7 + Math.random() * 0.6);
        fishGroup.add(fishSingle);
        fishData.push({
          group: fishSingle,
          speed: 0.3 + Math.random() * 0.8,
          offset: Math.random() * Math.PI * 2,
        });
      }
      scene.add(fishGroup);

      // --- Partículas (plâncton) mantido ---
      const particlesCount = 600;
      const particlesGeom = new THREE.BufferGeometry();
      const particlesPositions = new Float32Array(particlesCount * 3);
      const particlesColors = new Float32Array(particlesCount * 3);
      for (let i = 0; i < particlesCount; i++) {
        particlesPositions[i * 3] = (Math.random() - 0.5) * 25;
        particlesPositions[i * 3 + 1] = -3 + Math.random() * 14;
        particlesPositions[i * 3 + 2] = (Math.random() - 0.5) * 25;
        particlesColors[i * 3] = 0.9 + Math.random() * 0.1;
        particlesColors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        particlesColors[i * 3 + 2] = 0.95 + Math.random() * 0.05;
      }
      particlesGeom.setAttribute("position", new THREE.BufferAttribute(particlesPositions, 3));
      particlesGeom.setAttribute("color", new THREE.BufferAttribute(particlesColors, 3));
      const particlesMat = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.5,
      });
      const particles = new THREE.Points(particlesGeom, particlesMat);
      scene.add(particles);

      // --- Anêmonas simples (mantido) ---
      const anemoneGroup = new THREE.Group();
      for (let i = 0; i < 5; i++) {
        const anemoneBase = new THREE.CylinderGeometry(0.1, 0.15, 0.2, 8);
        const anemoneMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(`hsl(${280 + Math.random() * 40}, 70%, 60%)`),
          roughness: 0.5,
        });
        const base = new THREE.Mesh(anemoneBase, anemoneMat);
        base.position.y = -2.5;
        base.castShadow = true;
        anemoneGroup.add(base);
        for (let j = 0; j < 12; j++) {
          const tentacleGeom = new THREE.CylinderGeometry(0.02, 0.05, 0.3, 6);
          const tentacle = new THREE.Mesh(tentacleGeom, anemoneMat);
          tentacle.position.set(
            (Math.random() - 0.5) * 0.2,
            -2.4,
            (Math.random() - 0.5) * 0.2
          );
          tentacle.rotation.z = (Math.random() - 0.5) * 1.2;
          tentacle.rotation.x = (Math.random() - 0.5) * 1.2;
          tentacle.castShadow = true;
          anemoneGroup.add(tentacle);
        }
        anemoneGroup.position.set(
          (Math.random() - 0.5) * 8,
          0,
          (Math.random() - 0.5) * 8
        );
      }
      scene.add(anemoneGroup);

      // --- Animação (mantida com ajuste para os peixes) ---
      let time = 0;
      let animationId: number;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        time += 0.016;

        camera.position.x = 6 + Math.sin(time * 0.1) * 2.5;
        camera.position.z = 8 + Math.cos(time * 0.15) * 2.5;
        camera.position.y = 3.5 + Math.sin(time * 0.08) * 0.3;
        camera.lookAt(0, -0.8, 0);

        fishData.forEach(({ group, speed, offset }) => {
          group.position.x += Math.sin(time * speed + offset) * 0.025;
          group.position.z += Math.cos(time * speed + offset) * 0.025;
          group.position.y += Math.sin(time * speed * 0.7 + offset) * 0.012;
          group.rotation.y = Math.sin(time * speed + offset) * 0.6;
          if (group.position.x > 8) group.position.x = -8;
          if (group.position.x < -8) group.position.x = 8;
          if (group.position.z > 8) group.position.z = -8;
          if (group.position.z < -8) group.position.z = 8;
          if (group.position.y > 1.5) group.position.y = -2;
          if (group.position.y < -3) group.position.y = 1.5;
        });

        const posAttr = particles.geometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
          posAttr[i * 3 + 1] += 0.005;
          if (posAttr[i * 3 + 1] > 8) {
            posAttr[i * 3 + 1] = -3;
            posAttr[i * 3] = (Math.random() - 0.5) * 25;
            posAttr[i * 3 + 2] = (Math.random() - 0.5) * 25;
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

  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
    />
  );
}

// -------------------------------------------------------------------
// FUNÇÃO MELHORADA PARA CRIAR CORAIS RAMIFICADOS E REALISTAS
// -------------------------------------------------------------------
function createRealisticCoral(THREE: any, colors: string[], maxDepth: number = 3): THREE.Group {
  const group = new THREE.Group();

  // Escolhe uma cor base vibrante e cria um material com pequena variação de roughness
  const baseColorHex = colors[Math.floor(Math.random() * colors.length)];
  const baseColor = new THREE.Color(baseColorHex);
  const materialMain = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.4 + Math.random() * 0.3,
    metalness: 0.05,
    emissive: new THREE.Color(baseColorHex).multiplyScalar(0.1),
    emissiveIntensity: 0.15,
  });

  // Material para os pólipos (ligeiramente mais claro e com emissão)
  const polypMaterial = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.2,
    metalness: 0.0,
    emissive: new THREE.Color(baseColorHex).multiplyScalar(0.2),
    emissiveIntensity: 0.25,
  });

  // Função auxiliar para criar um cilindro com pontas mais arredondadas
  const createSegment = (length: number, radiusBottom: number, radiusTop: number, radialSegments: number = 6) => {
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, radialSegments);
    // Suaviza as arestas
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, materialMain);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  // Função recursiva para adicionar galhos com torção e pólipos
  const addBranch = (
    parent: THREE.Group,
    startPoint: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    radius: number,
    level: number,
    angleOffset: number = 0
  ) => {
    if (level <= 0 || length < 0.12) return;

    // Número de segmentos por galho (para dar curvatura)
    const segments = Math.min(3, 2 + Math.floor(Math.random() * level));
    const segLength = length / segments;
    let currentPos = startPoint.clone();
    let currentDir = direction.clone().normalize();
    let currentRadius = radius;

    for (let s = 0; s < segments; s++) {
      // Reduz o raio gradualmente
      const t = s / segments;
      const r = currentRadius * (1 - t * 0.4);
      const segmentMesh = createSegment(segLength, r, r * 0.9, 5 + Math.floor(Math.random() * 3));
      
      // Posiciona o segmento
      const midPoint = currentPos.clone().add(currentDir.clone().multiplyScalar(segLength / 2));
      segmentMesh.position.copy(midPoint);
      
      // Orientação: alinha o cilindro com a direção
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        currentDir
      );
      segmentMesh.quaternion.copy(quaternion);
      
      // Adiciona uma pequena rotação aleatória para organicidade
      segmentMesh.rotateZ((Math.random() - 0.5) * 0.3);
      segmentMesh.rotateX((Math.random() - 0.5) * 0.2);
      
      parent.add(segmentMesh);
      
      // Adiciona pólipos esféricos ao longo do segmento
      const polypsPerSegment = Math.floor(Math.random() * 2) + (level > 2 ? 2 : 1);
      for (let p = 0; p < polypsPerSegment; p++) {
        const polypPos = currentPos.clone().add(currentDir.clone().multiplyScalar(segLength * (p / polypsPerSegment)));
        // Pequeno deslocamento lateral
        const lateral = new THREE.Vector3(
          (Math.random() - 0.5) * r * 1.2,
          (Math.random() - 0.5) * r * 1.2,
          (Math.random() - 0.5) * r * 1.2
        ).normalize().multiplyScalar(r * 0.9);
        polypPos.add(lateral);
        
        const polypGeom = new THREE.SphereGeometry(r * 0.5, 6, 4);
        const polyp = new THREE.Mesh(polypGeom, polypMaterial);
        polyp.position.copy(polypPos);
        polyp.castShadow = true;
        parent.add(polyp);
      }
      
      // Atualiza posição para o próximo segmento
      currentPos.add(currentDir.clone().multiplyScalar(segLength));
      // Adiciona curvatura suave (muda direção levemente a cada segmento)
      const bend = new THREE.Vector3(
        (Math.sin(angleOffset + s) * 0.2),
        (Math.cos(angleOffset + s * 1.3) * 0.15),
        (Math.sin(angleOffset + s * 0.8) * 0.2)
      );
      currentDir.add(bend).normalize();
    }
    
    // Ponto final do galho: adiciona um pólipo maior (coralite terminal)
    const tipPos = currentPos.clone();
    const tipPolypGeom = new THREE.SphereGeometry(radius * 0.8, 7, 5);
    const tipPolyp = new THREE.Mesh(tipPolypGeom, polypMaterial);
    tipPolyp.position.copy(tipPos);
    tipPolyp.castShadow = true;
    parent.add(tipPolyp);
    
    // Ramificações (2 ou 3 galhos secundários)
    const numBranches = 2 + Math.floor(Math.random() * (level > 2 ? 2 : 1));
    for (let b = 0; b < numBranches; b++) {
      const branchAngle = (Math.PI * 2 * b) / numBranches + (Math.random() - 0.5) * 0.8;
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(currentDir, up).normalize();
      const forward = new THREE.Vector3().crossVectors(right, currentDir).normalize();
      
      // Direção do novo galho: ligeiramente para cima e para fora
      const branchDir = currentDir.clone()
        .add(right.clone().multiplyScalar(Math.sin(branchAngle) * 0.5))
        .add(forward.clone().multiplyScalar(Math.cos(branchAngle) * 0.5))
        .normalize();
      
      const branchLength = length * (0.4 + Math.random() * 0.5);
      const branchRadius = radius * 0.6;
      addBranch(parent, tipPos, branchDir, branchLength, branchRadius, level - 1, angleOffset + b);
    }
  };

  // Tronco principal partindo do solo (y ≈ -0.4)
  const startPos = new THREE.Vector3(0, -0.4, 0);
  const mainDir = new THREE.Vector3(0, 1, 0.1).normalize();
  addBranch(group, startPos, mainDir, 0.9 + Math.random() * 0.7, 0.14, maxDepth, 0);

  // Galhos extras saindo da base (simula brotos laterais)
  for (let i = 0; i < 2; i++) {
    const lateralAngle = (Math.PI * 2 * i) / 2 + Math.random() * 0.5;
    const lateralDir = new THREE.Vector3(Math.cos(lateralAngle) * 0.6, 0.5 + Math.random() * 0.2, Math.sin(lateralAngle) * 0.6).normalize();
    addBranch(group, startPos, lateralDir, 0.5 + Math.random() * 0.4, 0.08, maxDepth - 1, i);
  }

  return group;
}