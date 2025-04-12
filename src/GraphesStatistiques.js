import React from "react";
import Plot from "react-plotly.js";

const couleurs = {
  outlier: "red",
  minmax: "blue",
  quartile: "green",
  mediane: "purple"
};

const GraphesStatistiques = ({ data, selectedGraphs }) => {
  if (!data) return null;

  const valeurs = data.valeurs || [];
  const layoutBase = {
    margin: { t: 50 },
    paper_bgcolor: "#f9fafb",
    plot_bgcolor: "#f9fafb"
  };

  const graphComponents = [];

  if (selectedGraphs.includes("Histogramme")) {
    graphComponents.push(
      <Plot
        key="histogramme"
        data={[
          {
            x: valeurs,
            type: "histogram",
            marker: { color: "skyblue" }
          }
        ]}
        layout={{
          ...layoutBase,
          title: "📊 Histogramme des données"
        }}
      />
    );
  }

  if (selectedGraphs.includes("Courbe de tendance")) {
    const sorted = [...valeurs].sort((a, b) => a - b);
    graphComponents.push(
      <Plot
        key="courbe"
        data={[
          {
            x: sorted.map((_, i) => i + 1),
            y: sorted,
            type: "scatter",
            mode: "lines+markers",
            line: { color: "orange" }
          }
        ]}
        layout={{
          ...layoutBase,
          title: "📈 Courbe de tendance"
          
        }}
      />
    );
  }

  if (selectedGraphs.includes("Boxplot")) {
    graphComponents.push(
      <Plot
        key="boxplot"
        data={[
          {
            y: valeurs,
            type: "box",
            boxpoints: "outliers",
            marker: { color: "lightblue" },
            line: { color: couleurs.mediane },
            name: "🧮 Boxplot"
          }
        ]}
        layout={{
          ...layoutBase,
          title: "🧮 Boîte à moustaches (Boxplot)",
        }}
      />
    );
  }

  if (selectedGraphs.includes("Linéaire")) {
    graphComponents.push(
      <Plot
        key="line"
        data={[
          {
            x: valeurs.map((_, i) => i + 1),
            y: valeurs,
            type: "scatter",
            mode: "lines+markers",
            line: { color: "teal" },
            name: "Données"
          }
        ]}
        layout={{
          ...layoutBase,
          title: "📉 Graphe linéaire"
        }}
      />
    );
  }

  const isDoubleColumn = selectedGraphs.length === 2;

  return (
    <div className={`mt-8 ${isDoubleColumn ? "grid grid-cols-2 gap-4" : "flex flex-col gap-8"} p-4 ml-8 bg-white shadow-lg rounded-xl`}>
      {graphComponents}
    </div>
  );
};

export default GraphesStatistiques;