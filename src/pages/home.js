import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Grid({ size }) {
  return (
    <group>
      {Array.from({ length: size }).map((_, x) =>
        Array.from({ length: size }).map((_, z) => (
          <mesh key={`${x}-${z}`} position={[x - size / 2, 0, z - size / 2]}>
            <boxGeometry args={[1, 0.05, 1]} />
            <meshStandardMaterial color="lightgray" wireframe />
          </mesh>
        ))
      )}
    </group>
  );
}

function Shelf({ id, columns, rows, position, selected, onSelect, onDelete }) {
  const boxSize = 1;
  const shelfDepth = 0.5;
  const shelfWidth = columns * boxSize;
  const shelfHeight = rows * boxSize;

  return (
    <group position={position} onClick={() => onSelect(id)}>
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
      {Array.from({ length: columns }).map((_, col) =>
        Array.from({ length: rows }).map((_, row) => (
          <group key={`${col}-${row}`} position={[-shelfWidth / 2 + col * boxSize + boxSize / 2, row * boxSize + boxSize / 2, 0]}>
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
  const [gridSize, setGridSize] = useState(100);

  const addShelf = () => {
    const newShelf = {
      id: shelves.length,
      columns,
      rows,
      position: [Math.random() * 5 - 2.5, 0, Math.random() * -5],
    };
    setShelves([...shelves, newShelf]);
  };

  const deleteShelf = (id) => {
    setShelves(shelves.filter((shelf) => shelf.id !== id));
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      <Canvas style={{ flex: 1 }} camera={{ position: [0, 3, 10] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <OrbitControls />
        <Grid size={gridSize} />
        {shelves
          .filter((shelf) => selectedShelf === null || shelf.id === selectedShelf)
          .map((shelf) => (
            <Shelf key={shelf.id} {...shelf} selected={shelf.id === selectedShelf} onSelect={setSelectedShelf} />
          ))}
      </Canvas>
      <div style={{ width: "250px", height: "100vh", background: "#eee", overflowY: "auto", padding: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ margin: "0" }}>Largura (colunas):</p>
          <input type="number" value={columns} onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value) || 1))} />
          <p style={{ margin: "0" }}>Altura (linhas):</p>
          <input type="number" value={rows} onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))} />
          <p style={{ margin: "0" }}>Tamanho do Grid:</p>
          <input type="number" value={gridSize} onChange={(e) => setGridSize(Math.max(10, parseInt(e.target.value) || 10))} />
        </div>
        <button onClick={addShelf}>Adicionar Prateleira</button>
        <ul>
          {shelves.map((shelf) => (
            <li key={shelf.id} onClick={() => setSelectedShelf(shelf.id)} style={{ cursor: "pointer", fontWeight: selectedShelf === shelf.id ? "bold" : "normal" }}>
              Prateleira {shelf.id} ({shelf.columns}x{shelf.rows})
              <button onClick={() => deleteShelf(shelf.id)}>X</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
