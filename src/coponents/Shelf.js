import React, { useRef, useState, useMemo, useEffect  } from "react";
import { Box, Line, Edges } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export default function Shelf({
  position,
  rows = 3,
  columns = 3,
  cellSize = 1,
  onMove = () => {},
  onDragStart = () => {},
  onDragEnd = () => {},
  index = 0,
}) {
  const width = columns * cellSize;
  const height = rows * cellSize;
  const depth = 1; // profundidade da prateleira
 // espessura da estrutura "madeira"

  const ref = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef([0, 0]);
  const { raycaster } = useThree();
    const beamThickness = 0.1; // grossura/espessura das tábuas
    const beamWidthMultiplier = 24; // multiplicador para largura maior das tábuas
    const beamWidth = beamThickness * beamWidthMultiplier; // largura das tábuas largas
    const woodColor = "#977357ff"; // cor madeira

  const gridLines = useMemo(() => {
    const lines = [];

    for (let i = 1; i < columns; i++) {
      const x = i * cellSize;
      lines.push([x, 0, 0], [x, height, 0]);
    }
    for (let j = 1; j < rows; j++) {
      const y = j * cellSize;
      lines.push([0, y, 0], [width, y, 0]);
    }

    return lines;
  }, [columns, rows, cellSize]);

  const snapToGrid = (value) => {
    return Math.round(value / cellSize) * cellSize;
  };

  const onPointerDown = (event) => {
    event.stopPropagation();
    setIsDragging(true);
    onDragStart();

    const ray = event.ray;
    const t = (0 - ray.origin.y) / ray.direction.y;
    const intersectX = ray.origin.x + ray.direction.x * t;
    const intersectZ = ray.origin.z + ray.direction.z * t;
    dragOffset.current = [
      intersectX - ref.current.position.x,
      intersectZ - ref.current.position.z,
    ];
  };

  const onPointerMove = (event) => {
    if (!isDragging) return;
    event.stopPropagation();
    const ray = event.ray;
    const t = (0 - ray.origin.y) / ray.direction.y;
    let intersectX = ray.origin.x + ray.direction.x * t;
    let intersectZ = ray.origin.z + ray.direction.z * t;

    intersectX -= dragOffset.current[0];
    intersectZ -= dragOffset.current[1];

    intersectX = Math.max(0, snapToGrid(intersectX));
    intersectZ = Math.max(0, snapToGrid(intersectZ));

    ref.current.position.set(intersectX, position[1], intersectZ);
  };

  const onPointerUp = (event) => {
    event.stopPropagation();
    if (!isDragging) return;
    setIsDragging(false);
    onMove(index, ref.current.position.x, ref.current.position.z);
    onDragEnd();
  };
  useEffect(() => {
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (ref.current) {
        onMove(index, ref.current.position.x, ref.current.position.z);
        onDragEnd();
      }
    }
  };

  window.addEventListener("mouseleave", handleMouseLeave);
  window.addEventListener("blur", handleMouseLeave);

  return () => {
    window.removeEventListener("mouseleave", handleMouseLeave);
    window.removeEventListener("blur", handleMouseLeave);
  };
}, [isDragging, onMove, onDragEnd, index]);


  return (
    <group
      ref={ref}
      position={position}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      

      

        {/* Viga superior (horizontal, topo) */}
    <Box
    args={[beamThickness, height, beamWidth * 0.3]}
    position={[width / 2, height - beamThickness / 2, -depth / 2 - beamThickness / 2]}
    rotation={[0, 0, Math.PI / 2]} // 90 graus no eixo X
    >
    <meshStandardMaterial color={woodColor} />
    </Box>

    {/* Viga lateral esquerda (vertical, lado) */}
    <Box
      args={[beamThickness, height, beamWidth * 0.3]} // altura exata da prateleira
      position={[
        -beamThickness / 2, 
        height / 2, 
        -depth / 2
      ]}
    >
      <meshStandardMaterial color={woodColor} />
    </Box>

    {/* Viga lateral direita (vertical, lado) */}
    <Box
      args={[beamThickness, height, beamWidth * 0.3]} 
      position={[
        width + beamThickness / 2, 
        height / 2, 
        -depth / 2
      ]}
    >
      <meshStandardMaterial color={woodColor} />
    </Box>


      {/* Espaço interno vazado com arestas */}
      <mesh position={[width / 2, height / 2, -depth / 2]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#444" transparent opacity={0.1} />
        <Edges scale={1.01} threshold={15}>
          <meshBasicMaterial color="#aaaaaa" />
        </Edges>
      </mesh>

      {/* Linhas internas (divisões) */}
      <Line
        points={gridLines}
        color="white"
        lineWidth={1}
        position={[0, 0, 0.01]}
      />
    </group>
  );
}
