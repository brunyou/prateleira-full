import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const boxTypes = {
  A: { type: "box", color: "red" },
  B: { type: "box", color: "green" },
  C: { type: "box", color: "blue" },
  D: { type: "box", color: "yellow" },
  E: { type: "box", color: "purple" },
  F: { type: "fabric", color: "lightgray" }
};

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
  rotation,
  boxes = [],
}) {
  const boxSize = 1;
  const shelfDepth = 0.5;
  const shelfWidth = columns * boxSize;
  const shelfHeight = rows * boxSize;

  let offsetX = 0;
  let offsetZ = 0;

  if (columns % 2 === 0) {
    if (rotation === 0) {
      offsetX = -0.5;
    } else if (rotation === Math.PI / 2) {
      offsetZ = -0.5;
    } else if (rotation === Math.PI) {
      offsetX = 0.5;
    } else if (rotation === (3 * Math.PI) / 2) {
      offsetZ = 0.5;
    }
  }

  const adjustedPosition = [
    position[0] - gridSize / 2 + offsetX,
    0,
    position[1] - gridSize / 2 + offsetZ,
  ];

  return (
    <group
      position={adjustedPosition}
      rotation={[0, rotation, 0]}
      onClick={() => onSelect(id)}
    >
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
          <group
            key={`${col}-${row}`}
            position={[
              -shelfWidth / 2 + col * boxSize + boxSize / 2,
              row * boxSize + boxSize / 2,
              0,
            ]}
          >
            <mesh>
              <boxGeometry args={[boxSize - 0.1, boxSize - 0.1, shelfDepth]} />
              <meshStandardMaterial color="lightgray" wireframe />
            </mesh>
            {boxes[col] && boxes[col][row] && (
          <group position={[0, 0, shelfDepth / 2 + 0.1]}>
            {boxes[col][row].type === "fabric" ? (
              <>
            {/* Rolos de tecido deitados em pirâmide (2 embaixo, 1 em cima) */}
            <group rotation={[Math.PI/2, 0, 0]}>
              {/* Rolo inferior esquerdo */}
              <mesh position={[-0.2, -0.35, 0.3]}>
                <cylinderGeometry args={[0.15, 0.15, 1, 32]} />
                <meshStandardMaterial color={boxes[col][row].color} />
              </mesh>
              {/* Rolo inferior direito */}
              <mesh position={[0.2, -0.35, 0.3]}>
                <cylinderGeometry args={[0.15, 0.15, 1, 32]} />
                <meshStandardMaterial color={boxes[col][row].color} />
              </mesh>
              {/* Rolo superior central */}
              <mesh position={[0, -0.35, 0.1]}>
                <cylinderGeometry args={[0.15, 0.15, 1, 32]} />
                <meshStandardMaterial color={boxes[col][row].color} />
              </mesh>
            </group>
          </>
        ) : (
          <mesh position={[0, 0, -0.35]}>
            <boxGeometry args={[boxSize - 0.2, boxSize - 0.2, boxSize - 0.2]} />
            <meshStandardMaterial color={boxes[col][row].color} />
          </mesh>
        )}
      </group>
            )}
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
  const [emptyProbability, setEmptyProbability] = useState(0.3);
  const [fabricProbability, setFabricProbability] = useState(0.2);
  const [gridCells, setGridCells] = useState(
    Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => null)
    )
  );

  const calculateOccupiedCells = (shelf) => {
    const { position, columns, rotation } = shelf;
    const [x, z] = position;
    const cells = [];

    if (rotation === 0) {
      for (let i = 0; i < columns; i++) {
        cells.push([x + i - Math.floor(columns / 2), z]);
      }
    } else if (rotation === Math.PI / 2) {
      for (let i = 0; i < columns; i++) {
        cells.push([x, z + i - Math.floor(columns / 2)]);
      }
    } else if (rotation === Math.PI) {
      for (let i = 0; i < columns; i++) {
        cells.push([x - i + Math.floor(columns / 2), z]);
      }
    } else if (rotation === (3 * Math.PI) / 2) {
      for (let i = 0; i < columns; i++) {
        cells.push([x, z - i + Math.floor(columns / 2)]);
      }
    }

    return cells;
  };

  const isPositionValid = (position, columns, rotation, ignoreShelfId = null) => {
    const [x, z] = position;

    for (let i = 0; i < columns; i++) {
      let cellX, cellZ;
      if (rotation === 0) {
        cellX = x + i - Math.floor(columns / 2);
        cellZ = z;
      } else if (rotation === Math.PI / 2) {
        cellX = x;
        cellZ = z + i - Math.floor(columns / 2);
      } else if (rotation === Math.PI) {
        cellX = x - i + Math.floor(columns / 2);
        cellZ = z;
      } else if (rotation === (3 * Math.PI) / 2) {
        cellX = x;
        cellZ = z - i + Math.floor(columns / 2);
      }

      if (cellX < 0 || cellX >= gridSize || cellZ < 0 || cellZ >= gridSize) {
        return false;
      }
    }

    for (let i = 0; i < columns; i++) {
      let cellX, cellZ;
      if (rotation === 0) {
        cellX = x + i - Math.floor(columns / 2);
        cellZ = z;
      } else if (rotation === Math.PI / 2) {
        cellX = x;
        cellZ = z + i - Math.floor(columns / 2);
      } else if (rotation === Math.PI) {
        cellX = x - i + Math.floor(columns / 2);
        cellZ = z;
      } else if (rotation === (3 * Math.PI) / 2) {
        cellX = x;
        cellZ = z - i + Math.floor(columns / 2);
      }

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
      boxes: Array.from({ length: columns }, () => 
        Array.from({ length: rows }, () => null)
      ),
      area: calculateOccupiedCells({ position, columns, rotation: 0 }),
    };

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

    const newGridCells = [...gridCells];
    for (const [cellX, cellZ] of shelf.area) {
      newGridCells[cellX][cellZ] = null;
    }

    if (isPositionValid(newPosition, shelf.columns, shelf.rotation, id)) {
      const newArea = calculateOccupiedCells({ ...shelf, position: newPosition });

      for (const [cellX, cellZ] of newArea) {
        newGridCells[cellX][cellZ] = id;
      }
      setGridCells(newGridCells);

      const updatedShelf = { ...shelf, position: newPosition, area: newArea };
      setShelves(shelves.map((s) => (s.id === id ? updatedShelf : s)));
    } else {
      for (const [cellX, cellZ] of shelf.area) {
        newGridCells[cellX][cellZ] = id;
      }
      setGridCells(newGridCells);
      alert("Posição inválida! Há sobreposição ou está fora do grid.");
    }
  };

  const rotateShelf = (id) => {
    const shelf = shelves.find((s) => s.id === id);
    if (!shelf) return;
  
    const newRotation = (shelf.rotation + Math.PI / 2) % (2 * Math.PI);
  
    const newArea = calculateOccupiedCells({
      position: shelf.position,
      columns: shelf.columns,
      rotation: newRotation,
    });
  
    if (isPositionValid(shelf.position, shelf.columns, newRotation, id)) {
      const newGridCells = [...gridCells];
      for (const [cellX, cellZ] of shelf.area) {
        newGridCells[cellX][cellZ] = null;
      }
  
      for (const [cellX, cellZ] of newArea) {
        newGridCells[cellX][cellZ] = id;
      }
      setGridCells(newGridCells);
  
      const updatedShelf = {
        ...shelf,
        rotation: newRotation,
        area: newArea,
      };
      setShelves(shelves.map((s) => (s.id === id ? updatedShelf : s)));
    } else {
      alert("Rotação inválida! Há sobreposição ou está fora do grid.");
    }
  };

  const handleCellClick = (position) => {
    const [x, z] = position;

    if (selectedShelf !== null) {
      const shelf = shelves.find((s) => s.id === selectedShelf);
      if (isPositionValid([x, z], shelf.columns, shelf.rotation, selectedShelf)) {
        moveShelf(selectedShelf, [x, z]);
      } else {
        alert("Posição inválida! Há sobreposição ou está fora do grid.");
      }
    } else {
      if (isPositionValid([x, z], columns, 0)) {
        addShelf([x, z]);
      } else {
        alert("Posição inválida! Há sobreposição ou está fora do grid.");
      }
    }
  };

  const handleGridSizeChange = (newSize) => {
    setGridSize(newSize);
  
    const newGridCells = Array.from({ length: newSize }, () =>
      Array.from({ length: newSize }, () => null)
    );
  
    shelves.forEach((shelf) => {
      const area = calculateOccupiedCells({
        position: shelf.position,
        columns: shelf.columns,
        rotation: shelf.rotation,
      });
  
      for (const [cellX, cellZ] of area) {
        if (cellX < newSize && cellZ < newSize) {
          newGridCells[cellX][cellZ] = shelf.id;
        }
      }
    });
  
    setGridCells(newGridCells);
  };

  const addBoxesToShelves = () => {
    const newShelves = shelves.map((shelf) => {
      const newBoxes = Array.from({ length: shelf.columns }).map((_, col) =>
        Array.from({ length: shelf.rows }).map((_, row) => {
          if (Math.random() < emptyProbability) {
            return null;
          }
          
          const boxKeys = Object.keys(boxTypes);
          const randomType = Math.random() < fabricProbability 
            ? "F" // Força rolo de tecido se atender a probabilidade
            : boxKeys[Math.floor(Math.random() * (boxKeys.length - 1))]; // Exclui "F" para os outros
          
          const boxInfo = boxTypes[randomType];
          return { 
            type: boxInfo.type, 
            color: boxInfo.color,
            variant: randomType
          };
        })
      );
      return { ...shelf, boxes: newBoxes };
    });
    setShelves(newShelves);
  };

  const generateLayoutJSON = (includeBoxes = false) => {
    const layout = {
      gridSize,
      shelves: shelves.map((shelf) => ({
        id: shelf.id,
        columns: shelf.columns,
        rows: shelf.rows,
        position: shelf.position,
        rotation: shelf.rotation,
        ...(includeBoxes && { boxes: shelf.boxes })
      })),
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "1.1",
        boxTypes
      }
    };
    return JSON.stringify(layout, null, 2);
  };

  const loadLayoutFromJSON = (json) => {
    try {
      const layout = JSON.parse(json);
      setGridSize(layout.gridSize);
      
      const updatedShelves = layout.shelves.map((shelf) => ({
        ...shelf,
        area: calculateOccupiedCells(shelf),
        boxes: shelf.boxes || Array.from({ length: shelf.columns }, () => 
          Array.from({ length: shelf.rows }, () => null)
        )
      }));

      setShelves(updatedShelves);

      const newGridCells = Array.from({ length: layout.gridSize }, () =>
        Array.from({ length: layout.gridSize }, () => null)
      );

      updatedShelves.forEach((shelf) => {
        for (const [cellX, cellZ] of shelf.area) {
          if (cellX < layout.gridSize && cellZ < layout.gridSize) {
            newGridCells[cellX][cellZ] = shelf.id;
          }
        }
      });

      setGridCells(newGridCells);
    } catch (error) {
      console.error("Error loading layout:", error);
      alert("Invalid JSON format");
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const layoutJSON = urlParams.get("json");
    if (layoutJSON) {
      loadLayoutFromJSON(layoutJSON);
    }
  }, []);

  const generateLayoutURL = (includeBoxes = false) => {
    const json = generateLayoutJSON(includeBoxes);
    const encodedJSON = encodeURIComponent(json);
    return `${window.location.origin}${window.location.pathname}?json=${encodedJSON}`;
  };

  const highlightedCells = selectedShelf !== null
    ? shelves.find((shelf) => shelf.id === selectedShelf)?.area || []
    : [];

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      <Canvas style={{ flex: 1 }} camera={{ position: [0, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls />
        <Grid 
          size={gridSize} 
          onCellClick={handleCellClick} 
          highlightedCells={highlightedCells} 
        />
        {shelves.map((shelf) => (
          <Shelf
            key={shelf.id}
            {...shelf}
            gridSize={gridSize}
            selected={shelf.id === selectedShelf}
            onSelect={setSelectedShelf}
            onDelete={deleteShelf}
            rotation={shelf.rotation}
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
            onChange={(e) => handleGridSizeChange(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>

        <div style={{ marginTop: "20px" }}>
          <label>Probabilidade de espaço vazio:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={emptyProbability}
            onChange={(e) => setEmptyProbability(parseFloat(e.target.value))}
          />
          <span>{(emptyProbability * 100).toFixed(0)}%</span>
        </div>
        
        <div style={{ marginTop: "10px" }}>
          <label>Probabilidade de rolos de tecido:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={fabricProbability}
            onChange={(e) => setFabricProbability(parseFloat(e.target.value))}
          />
          <span>{(fabricProbability * 100).toFixed(0)}%</span>
        </div>

        <button onClick={() => addShelf([Math.floor(gridSize / 2), Math.floor(gridSize / 2)])}>
          Adicionar Prateleira
        </button>
        <button onClick={() => selectedShelf !== null && rotateShelf(selectedShelf)}>
          Girar Prateleira Selecionada
        </button>
        <button onClick={addBoxesToShelves}>
          Adicionar Caixas às Prateleiras
        </button>
        
        <button onClick={() => {
          const json = generateLayoutJSON(true);
          navigator.clipboard.writeText(json).then(() => {
            alert("JSON com caixas copiado para a área de transferência!");
          });
        }}>
          Gerar JSON com Caixas
        </button>
        
        <button onClick={() => {
          const json = generateLayoutJSON(false);
          navigator.clipboard.writeText(json).then(() => {
            alert("JSON sem caixas copiado para a área de transferência!");
          });
        }}>
          Gerar JSON sem Caixas
        </button>
        
        <button onClick={() => {
          const url = generateLayoutURL(true);
          navigator.clipboard.writeText(url).then(() => {
            alert("URL com caixas copiada para a área de transferência!");
          });
        }}>
          Gerar URL com Caixas
        </button>
        
        <button onClick={() => {
          const url = generateLayoutURL(false);
          navigator.clipboard.writeText(url).then(() => {
            alert("URL sem caixas copiada para a área de transferência!");
          });
        }}>
          Gerar URL sem Caixas
        </button>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {shelves.map((shelf) => (
            <li
              key={shelf.id}
              onClick={() => setSelectedShelf(shelf.id)}
              style={{ 
                cursor: "pointer", 
                padding: "5px",
                backgroundColor: selectedShelf === shelf.id ? "#ddd" : "transparent",
                margin: "5px 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>
                Prateleira {shelf.id} ({shelf.columns}x{shelf.rows})
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteShelf(shelf.id); }}
                style={{ 
                  background: "red", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "3px",
                  padding: "2px 5px"
                }}
              >
                X
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}