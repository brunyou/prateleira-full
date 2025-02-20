import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Grid({ size, onCellClick, highlightedCells = [] }) {
  return (
    <group>
      {Array.from({ length: size }).map((_, x) =>
        Array.from({ length: size }).map((_, z) => {
          const isHighlighted = highlightedCells.some(
            (cell) => cell[0] === x - size / 2 && cell[1] === z - size / 2
          );
          return (
            <mesh
              key={`cell-${x}-${z}`}
              position={[x - size / 2, 0, z - size / 2]}
              onClick={() => onCellClick([x - size / 2, 0, z - size / 2])}
            >
              <boxGeometry args={[1, 0.1, 1]} />
              <meshStandardMaterial
                color={isHighlighted ? "yellow" : "lightgray"}
                wireframe={!isHighlighted}
              />
            </mesh>
          );
        })
      )}
    </group>
  );
}

function Shelf({ id, columns, rows, position, selected, onSelect, onDelete, rotation, onDoubleClick }) {
  const boxSize = 1;
  const shelfDepth = 0.5;
  const shelfWidth = columns * boxSize;
  const shelfHeight = rows * boxSize;

  return (
    <group
      position={position}
      rotation={[0, rotation, 0]}
      onClick={() => onSelect(id)}
      onDoubleClick={onDoubleClick}
    >
      {/* Estrutura da prateleira */}
      <mesh position={[-shelfWidth / 2 - 0.1, shelfHeight / 2, 0]}>
        <boxGeometry args={[0.2, shelfHeight, shelfDepth]} />
        <meshStandardMaterial color={selected ? "red" : "brown"} />
      </mesh>
      <mesh position={[shelfWidth / 2 + 0.1, shelfHeight / 2, 0]}>
        <boxGeometry args={[0.2, shelfHeight, shelfDepth]} />
        <meshStandardMaterial color={selected ? "red" : "brown"} />
      </mesh>
      <mesh position={[0, shelfHeight + 0.1, 0]}>
        <boxGeometry args={[shelfWidth + 0.2, 0.2, shelfDepth]} />
        <meshStandardMaterial color={selected ? "red" : "brown"} />
      </mesh>

      {/* Grades internas da prateleira */}
      {Array.from({ length: columns }).map((_, col) =>
        Array.from({ length: rows }).map((_, row) => (
          <group
            key={`${col}-${row}`}
            position={[-shelfWidth / 2 + col * boxSize + boxSize / 2, row * boxSize + boxSize / 2, 0]}
          >
            <mesh>
              <boxGeometry args={[boxSize - 0.1, boxSize - 0.1, shelfDepth]} />
              <meshStandardMaterial color="lightgray" wireframe />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

export default function App() {
  const [shelves, setShelves] = useState([]);
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(3);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [gridSize, setGridSize] = useState(10);

  const addShelf = (position) => {
    const newShelf = {
      id: shelves.length,
      columns,
      rows,
      position: position || [0, 0, 0],
      rotation: 0,
    };
    setShelves([...shelves, newShelf]);
  };

  const deleteShelf = (id) => {
    setShelves(shelves.filter((shelf) => shelf.id !== id));
    if (selectedShelf === id) {
      setSelectedShelf(null); // Redefine o estado se a prateleira excluída for a selecionada
    }
  };

  const moveShelf = (id, newPosition) => {
    setShelves(
      shelves.map((shelf) =>
        shelf.id === id ? { ...shelf, position: newPosition } : shelf
      )
    );
  };

  const rotateShelf = (id) => {
    setShelves(
      shelves.map((shelf) =>
        shelf.id === id
          ? {
              ...shelf,
              rotation: (shelf.rotation + Math.PI / 2) % (2 * Math.PI),
            }
          : shelf
      )
    );
  };

  const isPositionValid = (position, columns, rows, rotation, ignoreShelfId = null) => {
    const [x, y, z] = position;
    const shelfWidth = rotation === 0 ? columns : rows;
    const shelfDepth = rotation === 0 ? rows : columns;

    const halfGrid = gridSize / 2;
    if (
      x - shelfWidth / 2 < -halfGrid ||
      x + shelfWidth / 2 > halfGrid ||
      z - shelfDepth / 2 < -halfGrid ||
      z + shelfDepth / 2 > halfGrid
    ) {
      return false;
    }

    for (const shelf of shelves) {
      if (shelf.id === ignoreShelfId) continue;

      const [shelfX, shelfY, shelfZ] = shelf.position;
      const shelfWidthOther = shelf.rotation === 0 ? shelf.columns : shelf.rows;
      const shelfDepthOther = shelf.rotation === 0 ? shelf.rows : shelf.columns;

      if (
        x < shelfX + shelfWidthOther / 2 &&
        x + shelfWidth > shelfX - shelfWidthOther / 2 &&
        z < shelfZ + shelfDepthOther / 2 &&
        z + shelfDepth > shelfZ - shelfDepthOther / 2
      ) {
        return false;
      }
    }

    return true;
  };

  const getOccupiedCells = (shelf) => {
    const { position, columns, rows, rotation } = shelf;
    const [x, y, z] = position;
    const shelfWidth = rotation === 0 ? columns : 1;
    const shelfDepth = rotation === 0 ? 1 : columns;

    const cells = [];
    for (let i = 0; i < shelfWidth; i++) {
      for (let j = 0; j < shelfDepth; j++) {
        const cellX = Math.floor(x) - Math.floor(shelfWidth / 2) + i;
        const cellZ = Math.floor(z) - Math.floor(shelfDepth / 2) + j;
        cells.push([cellX, cellZ]);
      }
    }
    return cells;
  };

  const handleCellClick = (position) => {
    const [x, y, z] = position;
    const adjustedPosition = [Math.floor(x), 0, Math.floor(z)];

    if (selectedShelf !== null) {
      const shelf = shelves.find((s) => s.id === selectedShelf);
      if (isPositionValid(adjustedPosition, shelf.columns, shelf.rows, shelf.rotation, selectedShelf)) {
        moveShelf(selectedShelf, adjustedPosition);
      } else {
        alert("Posição inválida! Há sobreposição ou está fora do grid.");
      }
    } else {
      if (isPositionValid(adjustedPosition, columns, rows, 0)) {
        addShelf(adjustedPosition);
      } else {
        alert("Posição inválida! Há sobreposição ou está fora do grid.");
      }
    }
  };

  const highlightedCells = selectedShelf !== null
    ? getOccupiedCells(shelves.find((shelf) => shelf.id === selectedShelf))
    : [];

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      <Canvas style={{ flex: 1 }} camera={{ position: [0, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls />
        <Grid size={gridSize} onCellClick={handleCellClick} highlightedCells={highlightedCells} />
        {shelves.map((shelf) => (
          <Shelf
            key={shelf.id}
            {...shelf}
            selected={shelf.id === selectedShelf}
            onSelect={setSelectedShelf}
            onDelete={deleteShelf}
            rotation={shelf.rotation}
            onDoubleClick={() => rotateShelf(shelf.id)}
          />
        ))}
      </Canvas>
      <div style={{ width: "250px", height: "100vh", background: "#eee", overflowY: "auto", padding: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ margin: "0" }}>Largura (colunas):</p>
          <input
            type="number"
            value={columns}
            onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value) || 1))}
          />
          <p style={{ margin: "0" }}>Altura (linhas):</p>
          <input
            type="number"
            value={rows}
            onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
          />
          <p style={{ margin: "0" }}>Tamanho do Grid:</p>
          <input
            type="number"
            value={gridSize}
            onChange={(e) => setGridSize(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
        <button onClick={() => addShelf()}>Adicionar Prateleira</button>
        <button onClick={() => selectedShelf !== null && rotateShelf(selectedShelf)}>
          Girar Prateleira Selecionada
        </button>
        <ul>
          {shelves.map((shelf) => (
            <li
              key={shelf.id}
              onClick={() => setSelectedShelf(shelf.id)}
              style={{ cursor: "pointer", fontWeight: selectedShelf === shelf.id ? "bold" : "normal" }}
            >
              Prateleira {shelf.id} ({shelf.columns}x{shelf.rows})
              <button onClick={(e) => { e.stopPropagation(); deleteShelf(shelf.id); }}>X</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}