import React, { useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const boxTypes = {
  A: "red",
  B: "green",
  C: "blue",
  D: "yellow",
  E: "purple",
};

const SidePanel = ({ shelves }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Calcula a quantidade de cada tipo de caixa
  const countBoxTypes = () => {
    const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    shelves.forEach((shelf) => {
      shelf.boxes?.forEach((column) => {
        column.forEach((box) => {
          if (box && box.type) {
            counts[box.type]++;
          }
        });
      });
    });

    return Object.keys(counts).map((type) => ({
      type,
      count: counts[type],
      color: boxTypes[type],
    }));
  };

  const boxData = countBoxTypes();
  const totalBoxes = boxData.reduce((sum, box) => sum + box.count, 0);

  // Calcula a porcentagem de cada tipo de caixa
  const boxPercentages = boxData.map((box) => ({
    ...box,
    percentage: ((box.count / totalBoxes) * 100).toFixed(2),
  }));

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: isOpen ? 0 : "-300px",
        width: "300px",
        height: "100vh",
        backgroundColor: "#fff",
        boxShadow: "-2px 0 5px rgba(0, 0, 0, 0.1)",
        transition: "right 0.3s ease-in-out",
        zIndex: 1000,
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <button
        style={{
          position: "absolute",
          left: "-40px",
          top: "20px",
          backgroundColor: "#026DB6",
          color: "#fff",
          border: "none",
          padding: "10px",
          cursor: "pointer",
          borderRadius: "5px 0 0 5px",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "Fechar" : "Abrir"}
      </button>

      <h3>Distribuição de Caixas</h3>

      {/* Gráfico de Pizza */}
      <PieChart width={250} height={250}>
        <Pie
          data={boxPercentages}
          dataKey="percentage"
          nameKey="type"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {boxPercentages.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>

      {/* Gráfico de Barras */}
      <BarChart width={250} height={250} data={boxPercentages}>
        <XAxis dataKey="type" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="percentage" fill="#8884d8" />
      </BarChart>

      {/* Tabela de Porcentagens */}
      <table style={{ width: "100%", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Quantidade</th>
            <th>Porcentagem</th>
          </tr>
        </thead>
        <tbody>
          {boxPercentages.map((box) => (
            <tr key={box.type}>
              <td style={{ color: box.color }}>{box.type}</td>
              <td>{box.count}</td>
              <td>{box.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SidePanel;