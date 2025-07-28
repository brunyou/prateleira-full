import React, { useState, useRef  } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Text } from "@react-three/drei";
import Shelf from "../coponents/Shelf"; // caminho pode variar

function GroundGrid({ sizeX, sizeY }) {
  return (
    <>
      <Grid
        position={[sizeX / 2, 0, sizeY / 2]}
        args={[sizeX, sizeY]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#444"
        sectionSize={5}
        sectionThickness={1.0}
        sectionColor="#222"
        fadeDistance={100}
        fadeStrength={1}
        infiniteGrid={false}
      />
      {Array.from({ length: sizeX + 1 }).map((_, i) => (
        <Text
          key={`x-label-${i}`}
          position={[i + 0.1, 0.01, -0.5]}
          fontSize={0.3}
          color="black"
        >
          {i}
        </Text>
      ))}
      {Array.from({ length: sizeY + 1 }).map((_, j) => (
        <Text
          key={`y-label-${j}`}
          position={[-0.5, 0.01, j + 0.1]}
          fontSize={0.3}
          color="black"
        >
          {j}
        </Text>
      ))}
    </>
  );
}

export default function App() {
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(3);
  const [gridSizeX, setGridSizeX] = useState(10);
  const [gridSizeY, setGridSizeY] = useState(10);
  const orbitRef = useRef();
  const [selectedCorridor, setSelectedCorridor] = useState(0);
  const [selectedX, setSelectedX] = useState(0);
  const [selectedY, setSelectedY] = useState(0);

  const [shelfPositions, setShelfPositions] = useState([
    { x: 0, y: 0, boxes: [] },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [boxToRemove, setBoxToRemove] = useState(null);

  const handleAddShelf = () => {
    setShelfPositions([...shelfPositions, { x: 0, y: 0, boxes: [] }]);
  };

  const handleMoveShelf = (axis, value) => {
    setShelfPositions((prev) => {
      const updated = [...prev];
      if (!updated[selectedCorridor]) return prev;
      updated[selectedCorridor][axis] = value;
      return updated;
    });
  };

  const handleAddBox = () => {
    setShelfPositions((prev) => {
      const updated = [...prev];
      if (!updated[selectedCorridor]) return prev;
      updated[selectedCorridor].boxes.push({
        corridor: selectedCorridor,
        col: selectedX,
        row: selectedY,
      });
      return updated;
    });
  };

  const handleBoxClick = (corridor, col, row) => {
    setBoxToRemove({ corridor, col, row });
    setShowModal(true);
  };

  const handleConfirmRemove = () => {
    setShelfPositions((prev) => {
      const updated = [...prev];
      updated[boxToRemove.corridor].boxes = updated[
        boxToRemove.corridor
      ].boxes.filter(
        (box) => !(box.col === boxToRemove.col && box.row === boxToRemove.row)
      );
      return updated;
    });
    setShowModal(false);
    setBoxToRemove(null);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div style={{ padding: 10 }}>
        <h3>Configurações:</h3>
        <label>Colunas: </label>
        <input
          type="number"
          value={columns}
          onChange={(e) => setColumns(parseInt(e.target.value) || 1)}
        />
        <label> Linhas: </label>
        <input
          type="number"
          value={rows}
          onChange={(e) => setRows(parseInt(e.target.value) || 1)}
        />
        <label> Grid X: </label>
        <input
          type="number"
          value={gridSizeX}
          onChange={(e) => setGridSizeX(parseInt(e.target.value) || 1)}
        />
        <label> Grid Y: </label>
        <input
          type="number"
          value={gridSizeY}
          onChange={(e) => setGridSizeY(parseInt(e.target.value) || 1)}
        />
        <br />
        <label>Selecionar Prateleira: </label>
        <input
          type="number"
          min={0}
          max={shelfPositions.length - 1}
          value={selectedCorridor}
          onChange={(e) => setSelectedCorridor(parseInt(e.target.value) || 0)}
        />
        <label> Pos X: </label>
        <input
          type="number"
          value={shelfPositions[selectedCorridor]?.x || 0}
          onChange={(e) =>
            handleMoveShelf("x", parseInt(e.target.value) || 0)
          }
        />
        <label> Pos Y: </label>
        <input
          type="number"
          value={shelfPositions[selectedCorridor]?.y || 0}
          onChange={(e) =>
            handleMoveShelf("y", parseInt(e.target.value) || 0)
          }
        />
        <br />
        <label>Col da Caixa: </label>
        <input
          type="number"
          value={selectedX}
          onChange={(e) => setSelectedX(parseInt(e.target.value) || 0)}
        />
        <label> Row da Caixa: </label>
        <input
          type="number"
          value={selectedY}
          onChange={(e) => setSelectedY(parseInt(e.target.value) || 0)}
        />
        <button onClick={handleAddBox}>Adicionar Caixa</button>
        <button onClick={handleAddShelf}>Nova Prateleira</button>
      </div>

      <Canvas camera={{ position: [10, 10, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls ref={orbitRef} />

        <GroundGrid sizeX={gridSizeX} sizeY={gridSizeY} />

        {shelfPositions.map((shelf, i) => (
        <Shelf
          key={i}
          columns={columns}
          rows={rows}
          position={[shelf.x, 0, shelf.y]}
          boxes={shelf.boxes}
          onBoxClick={handleBoxClick}
          onDragStart={() => {
            if (orbitRef.current) orbitRef.current.enabled = false;
          }}
          onDragEnd={() => {
            if (orbitRef.current) orbitRef.current.enabled = true;
          }}
        />
        ))}
      </Canvas>

      {showModal && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
            border: "2px solid lightgray",
            zIndex: 10,
          }}
        >
          <p>
            Deseja retirar a caixa da prateleira {boxToRemove.corridor}, posição
            X: {boxToRemove.col}, Y: {boxToRemove.row}?
          </p>
          <button onClick={handleConfirmRemove}>Sim</button>
          <button onClick={() => setShowModal(false)}>Não</button>
        </div>
      )}
    </div>
  );
}
