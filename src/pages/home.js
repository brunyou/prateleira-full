import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Shelf({ columns, rows, position, boxes, onBoxClick }) {
  const boxSize = 1;
  const shelfDepth = 0.5;
  const shelfWidth = columns * boxSize;
  const shelfHeight = rows * boxSize;

  return (
    <group position={position}>
      <mesh position={[-shelfWidth / 2 - 0.1, shelfHeight / 2, 0]}>
        <boxGeometry args={[0.2, shelfHeight, shelfDepth]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      <mesh position={[shelfWidth / 2 + 0.1, shelfHeight / 2, 0]}>
        <boxGeometry args={[0.2, shelfHeight, shelfDepth]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      <mesh position={[0, shelfHeight + 0.1, 0]}>
        <boxGeometry args={[shelfWidth + 0.2, 0.2, shelfDepth]} />
        <meshStandardMaterial color="brown" />
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

      {boxes.map((box, index) => (
        <mesh
          key={index}
          position={[-shelfWidth / 2 + box.col * boxSize + boxSize / 2, box.row * boxSize + boxSize / 2, 0.1]}
          onClick={() => onBoxClick(box.col, box.row)}
        >
          <boxGeometry args={[boxSize - 0.2, boxSize - 0.2, shelfDepth]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      ))}
    </group>
  );
}

export default function App() {
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(3);
  const [corridors, setCorridors] = useState(1);
  const [selectedCorridor, setSelectedCorridor] = useState(0);
  const [selectedX, setSelectedX] = useState(0);
  const [selectedY, setSelectedY] = useState(0);
  const [shelves, setShelves] = useState(Array.from({ length: corridors }, () => []));
  const [showModal, setShowModal] = useState(false);
  const [boxToRemove, setBoxToRemove] = useState(null);
  const shelfSpacing = 2;

  const handleAddBox = () => {
    setShelves((prev) => {
      const newShelves = [...prev];
      if (!newShelves[selectedCorridor]) {
        newShelves[selectedCorridor] = [];
      }
      newShelves[selectedCorridor].push({ col: selectedX, row: selectedY });
      return newShelves;
    });
  };

  const handleBoxClick = (col, row) => {
    setBoxToRemove({ col, row });
    setShowModal(true);
  };

  const handleConfirmRemove = () => {
    setShelves((prev) => {
      const newShelves = [...prev];
      newShelves[selectedCorridor] = newShelves[selectedCorridor].filter(
        (box) => !(box.col === boxToRemove.col && box.row === boxToRemove.row)
      );
      return newShelves;
    });
    setShowModal(false);
    setBoxToRemove(null);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ marginBottom: "10px" }}>
        <label> Altura: </label>
        <input type="number" value={rows} onChange={(e) => setRows(parseInt(e.target.value) || 1)} />
        <label>Largura: </label>
        <input type="number" value={columns} onChange={(e) => setColumns(parseInt(e.target.value) || 1)} />
        <label> Nº de Prateleiras: </label>
        <input type="number" value={corridors} onChange={(e) => setCorridors(parseInt(e.target.value) || 1)} />
        <br />
        <label>Prateleira: </label>
        <input type="number" value={selectedCorridor} onChange={(e) => setSelectedCorridor(parseInt(e.target.value) || 0)} />
        <label> Largura: </label>
        <input type="number" value={selectedX} onChange={(e) => setSelectedX(parseInt(e.target.value) || 0)} />
        <label> Altura: </label>
        <input type="number" value={selectedY} onChange={(e) => setSelectedY(parseInt(e.target.value) || 0)} />
        <button onClick={handleAddBox}>Adicionar Caixa</button>
      </div>
      <Canvas style={{ width: "80vw", height: "80vh" }} camera={{ position: [0, 3, 10] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <OrbitControls />
        {Array.from({ length: corridors }).map((_, i) => (
          <Shelf key={i} columns={columns} rows={rows} position={[0, 0, -i * shelfSpacing]} boxes={shelves[i] || []} onBoxClick={handleBoxClick} />
        ))}
      </Canvas>
      {showModal && (
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "white", padding: "20px", borderRadius: "5px", border: "2px solid lightgray" }}>
          <p>Deseja retirar a caixa do box {boxToRemove.col}, {boxToRemove.row}?</p>
          <button onClick={handleConfirmRemove}>Sim</button>
          <button onClick={() => setShowModal(false)}>Não</button>
        </div>
      )}
    </div>
  );
}
