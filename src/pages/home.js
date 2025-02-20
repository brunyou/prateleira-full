import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Grid({ size, onCellClick, highlightedCells = [] }) {
  return (
    <group>
      {Array.from({ length: size }).map((_, x) =>
        Array.from({ length: size }).map((_, z) => {
          const isHighlighted = highlightedCells.some(
            (cell) => cell[0] === x && cell[1] === z
          );
          return (
            <mesh
              key={`cell-${x}-${z}`}
              position={[x - size / 2, 0, z - size / 2]}
              onClick={() => onCellClick([x, z])}
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

function Shelf({
  id,
  columns,
  rows,
  position,
  selected,
  onSelect,
  onDelete,
  gridSize,
}) {
  const boxSize = 1;
  const shelfDepth = 0.5;
  const shelfWidth = columns * boxSize;
  const shelfHeight = rows * boxSize;

  // Ajusta a posição para que a primeira coluna comece na célula [x, z]
  const adjustedPosition = [
    position[0] - gridSize / 2 + (columns - 1) / 2,
    0,
    position[1] - gridSize / 2,
  ];

  return (
    <group
      position={adjustedPosition}
      onClick={() => onSelect(id)}
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
  const [gridCells, setGridCells] = useState(
    Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => null)
    )
  );

  const calculateOccupiedCells = (shelf) => {
    const { position, columns } = shelf;
    const [x, z] = position;
    const cells = [];

    // A prateleira ocupa 1 célula de profundidade e N células de largura
    for (let i = 0; i < columns; i++) {
      cells.push([x + i, z]);
    }

    return cells;
  };

  const isPositionValid = (position, columns, ignoreShelfId = null) => {
    const [x, z] = position;

    // Verifica se todas as células estão dentro do grid
    for (let i = 0; i < columns; i++) {
      const cellX = x + i;
      const cellZ = z;
      if (cellX < 0 || cellX >= gridSize || cellZ < 0 || cellZ >= gridSize) {
        return false;
      }
    }

    // Verifica se as células estão livres (ou pertencem à prateleira ignorada)
    for (let i = 0; i < columns; i++) {
      const cellX = x + i;
      const cellZ = z;
      const cellValue = gridCells[cellX][cellZ];
      if (cellValue !== null && cellValue !== ignoreShelfId) {
        return false;
      }
    }

    return true;
  };

  const addShelf = (position) => {
    const newShelf = {
      id: shelves.length,
      columns,
      rows,
      position,
      rotation: 0,
      area: calculateOccupiedCells({ position, columns }),
    };

    // Marca as células como ocupadas
    const newGridCells = [...gridCells];
    for (const [cellX, cellZ] of newShelf.area) {
      newGridCells[cellX][cellZ] = newShelf.id;
    }
    setGridCells(newGridCells);

    setShelves([...shelves, newShelf]);
  };

  const deleteShelf = (id) => {
    const shelf = shelves.find((s) => s.id === id);
    if (!shelf) return;

    // Libera as células ocupadas
    const newGridCells = [...gridCells];
    for (const [cellX, cellZ] of shelf.area) {
      newGridCells[cellX][cellZ] = null;
    }
    setGridCells(newGridCells);

    setShelves(shelves.filter((shelf) => shelf.id !== id));
    if (selectedShelf === id) {
      setSelectedShelf(null);
    }
  };

  const moveShelf = (id, newPosition) => {
    const shelf = shelves.find((s) => s.id === id);
    if (!shelf) return;

    // Libera as células ocupadas atualmente
    const newGridCells = [...gridCells];
    for (const [cellX, cellZ] of shelf.area) {
      newGridCells[cellX][cellZ] = null;
    }

    // Verifica se a nova posição é válida
    if (isPositionValid(newPosition, shelf.columns, id)) {
      const newArea = calculateOccupiedCells({ ...shelf, position: newPosition });

      // Marca as novas células como ocupadas
      for (const [cellX, cellZ] of newArea) {
        newGridCells[cellX][cellZ] = id;
      }
      setGridCells(newGridCells);

      // Atualiza a prateleira
      const updatedShelf = { ...shelf, position: newPosition, area: newArea };
      setShelves(shelves.map((s) => (s.id === id ? updatedShelf : s)));
    } else {
      // Restaura as células ocupadas anteriormente
      for (const [cellX, cellZ] of shelf.area) {
        newGridCells[cellX][cellZ] = id;
      }
      setGridCells(newGridCells);
      alert("Posição inválida! Há sobreposição ou está fora do grid.");
    }
  };

  const handleCellClick = (position) => {
    const [x, z] = position;

    if (selectedShelf !== null) {
      const shelf = shelves.find((s) => s.id === selectedShelf);
      if (isPositionValid([x, z], shelf.columns, selectedShelf)) {
        moveShelf(selectedShelf, [x, z]);
      } else {
        alert("Posição inválida! Há sobreposição ou está fora do grid.");
      }
    } else {
      if (isPositionValid([x, z], columns)) {
        addShelf([x, z]);
      } else {
        alert("Posição inválida! Há sobreposição ou está fora do grid.");
      }
    }
  };

  const highlightedCells = selectedShelf !== null
    ? shelves.find((shelf) => shelf.id === selectedShelf).area
    : [];

  return (
    <div style={{ width: "100%", height: "100%", display: "flex" }}>
      <Canvas style={{ flex: 1 }} camera={{ position: [0, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls />
        <Grid size={gridSize} onCellClick={handleCellClick} highlightedCells={highlightedCells} />
        {shelves.map((shelf) => (
          <Shelf
            key={shelf.id}
            {...shelf}
            gridSize={gridSize}
            selected={shelf.id === selectedShelf}
            onSelect={setSelectedShelf}
            onDelete={deleteShelf}
          />
        ))}
      </Canvas>
      <div style={{ width: "250px", height: "97vh", background: "#eee", overflowY: "auto", padding: "10px" }}>
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
        <button onClick={() => addShelf([Math.floor(gridSize / 2), Math.floor(gridSize / 2)])}>
          Adicionar Prateleira
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