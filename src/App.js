
import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import ThemeSelector from "./ThemeSelector";
import GraphesStatistiques from "./GraphesStatistiques";
import "./App.css";

const Notification = ({ message, type }) => {
  if (!message) return null;
  return (
    <div className={`fixed top-5 right-5 p-4 rounded-md shadow-md text-white ${type === "success" ? "bg-green-500" : "bg-red-500"}`}>
      {message}
    </div>
  );
};

function App() {
  const [inputData, setInputData] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [historique, setHistorique] = useState([]);

  // Pour les graphes :
  const [selectedGraphs, setSelectedGraphs] = useState([]);
  const [showGraphs, setShowGraphs] = useState(false);

  const afficherNotification = (message, type = "success") => {
    setNotification(message);
    setNotificationType(type);
    setTimeout(() => setNotification(""), 3000);
  };

  const resetHistorique = () => {
    setHistorique([]);
    afficherNotification("Historique réinitialisé 🗑️", "success");
  };

  const envoyerDonnees = async () => {
    const valeurs = inputData.split(",").map(num => num.trim());
    const numbers = [];
    const erreurs = [];

    valeurs.forEach(val => {
      if (/^-?\d+(\.\d+)?$/.test(val)) {
        numbers.push(parseFloat(val));
      } else {
        erreurs.push(val);
      }
    });

    if (erreurs.length > 0) {
      setError(`Les valeurs suivantes sont invalides : ${erreurs.join(", ")}`);
      setResult(null);
      afficherNotification(`Erreur ❌ : Valeurs invalides (${erreurs.join(", ")})`, "error");
      return;
    }

    if (numbers.length === 0) {
      setError("Veuillez entrer une liste de nombres valides.");
      setResult(null);
      afficherNotification("Erreur ❌ : Aucune valeur valide détectée.", "error");
      return;
    }

    try {
      const response = await axios.post(
        "https://mon-api-flask-1mi6.onrender.com/calculer",
        { valeurs: numbers }
      );

      setResult(response.data);
      setError(null);
      afficherNotification("Calcul réussi 🎉", "success");

      setHistorique(prevHistorique => [
        { saisie: inputData, ...response.data },
        ...prevHistorique
      ]);
    } catch (err) {
      setError(err.response?.data || "Erreur de connexion");
      setResult(null);
      afficherNotification("Erreur lors du calcul ❌", "error");
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      const flatData = jsonData.flat().filter(val => !isNaN(val));
      const numericValues = flatData.map(Number);

      if (numericValues.length === 0) {
        afficherNotification("Aucune donnée valide trouvée dans le fichier ❌", "error");
        return;
      }

      try {
        const response = await axios.post(
          "https://mon-api-flask-1mi6.onrender.com/calculer",
          { valeurs: numericValues }
        );

        setResult(response.data);
        setError(null);
        setInputData(numericValues.join(","));
        afficherNotification("Fichier importé et analysé avec succès 🎉", "success");

        setHistorique(prev => [
          { saisie: numericValues.join(","), ...response.data },
          ...prev
        ]);
      } catch (err) {
        afficherNotification("Erreur lors de l'analyse du fichier ❌", "error");
        setError("Erreur pendant l'envoi au serveur.");
        setResult(null);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleExport = (format) => {
    if (!result) return;

    const titre = "📊 Résultats Statistiques";
    const lignes = [
      `Moyenne: ${result.moyenne?.toFixed(2)}`,
      `Médiane: ${result.mediane?.toFixed(2)}`,
      `Mode: ${Array.isArray(result.mode) ? result.mode.join(", ") : "Aucun"}`,
      `Variance: ${result.variance?.toFixed(2)}`,
      `Écart-type: ${result.ecart_type?.toFixed(2)}`,
      `Skewness: ${result.skewness?.toFixed(2)}`,
      `Kurtosis: ${result.kurtosis?.toFixed(2)}`,
      `Q1: ${result.quartiles?.Q1?.toFixed(2)}`,
      `Q2: ${result.mediane?.toFixed(2)}`,
      `Q3: ${result.quartiles?.Q3?.toFixed(2)}`,
      `IQR: ${result.iqr?.toFixed(2)}`,
      `Valeurs aberrantes: ${result.valeurs_aberrantes && result.valeurs_aberrantes.length > 0 ? result.valeurs_aberrantes.join(", ") : "Aucune"}`,
      `Min: ${result.min}`,
      `Max: ${result.max}`,
      `Amplitude: ${result.amplitude}`
    ];

    if (format === "pdf") {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(titre, 10, 20);
      doc.setFontSize(12);
      lignes.forEach((line, i) => {
        doc.text(line, 10, 30 + i * 10);
      });
      doc.save("resultats-statistiques.pdf");
    } else if (format === "excel") {
      const worksheetData = [lignes.map(l => l.split(":")[0]), lignes.map(l => l.split(":")[1]?.trim())];
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Statistiques");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, "resultats-statistiques.xlsx");
    } else if (format === "word") {
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ children: [new TextRun({ text: titre, bold: true, size: 28 })] }),
            ...lignes.map(line => new Paragraph({ children: [new TextRun({ text: line, size: 24 })] }))
          ]
        }]
      });
      Packer.toBlob(doc).then(blob => {
        saveAs(blob, "resultats-statistiques.docx");
      });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <ThemeSelector />
      <h1 className="text-3xl font-bold mb-6 text-center">📊 Calculateur de Statistiques</h1>
      <Notification message={notification} type={notificationType} />

      <input
        type="text"
        value={inputData}
        onChange={(e) => setInputData(e.target.value)}
        placeholder="Entrez des nombres séparés par des virgules"
        className="w-full h-16 text-xl px-6 border-2 border-gray-500 rounded-lg shadow-md"
      />

      <div className="mt-4">
        <input
          type="file"
          accept=".csv, .xlsx"
          onChange={handleFileImport}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={envoyerDonnees}
          className="bg-blue-500 text-white px-12 py-6 rounded-xl w-full text-2xl font-bold shadow-xl hover:bg-blue-600 transition"
        >
          Calculer
        </button>

        {historique.length > 0 && (
          <button
            onClick={resetHistorique}
            className="bg-red-500 text-white px-6 py-3 rounded-md w-full h-16 text-lg font-semibold shadow-md"
          >
            🗑️ Réinitialiser
          </button>
        )}
      </div>

      {/* Sélection des graphes */}
      <div className="mt-6">
        <label className="font-semibold mb-2 block">📌 Sélectionner les graphes à visualiser :</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {["Histogramme", "Courbe de tendance", "Boxplot", "Linéaire"].map(type => (
            <label key={type} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedGraphs.includes(type)}
                onChange={() =>
                  setSelectedGraphs(prev =>
                    prev.includes(type)
                      ? prev.filter(t => t !== type)
                      : [...prev, type]
                  )
                }
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
        <button
          onClick={() => setShowGraphs(true)}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-md hover:scale-105 transform transition text-lg font-semibold"
        >
          🎨 Visualiser les Graphes
        </button>
      </div>

      {result && (
        <div className="mt-6 p-6 bg-gray-100 rounded-md shadow-md">
          <h2 className="text-lg font-semibold">📌 Résultats :</h2>
          {/* Affichage des résultats ici... */}
          {/* ... */}
          {showGraphs && (
            <GraphesStatistiques
              data={{ ...result, valeurs: inputData.split(",").map(Number) }}
              selectedGraphs={selectedGraphs}
            />
          )}

          {/* Exporter les résultats */}
          <div className="mt-4 flex flex-col items-start">
            <label className="mb-2 font-medium">📤 Exporter les résultats :</label>
            <div className="flex gap-4">
              <select
                onChange={(e) => handleExport(e.target.value)}
                defaultValue=""
                className="border px-4 py-2 rounded-md shadow-sm"
              >
                <option value="" disabled>Choisir un format</option>
                <option value="pdf">📄 PDF</option>
                <option value="excel">📊 Excel</option>
                <option value="word">📝 Word</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Historique */}
      {historique.length > 0 && (
        <div className="mt-6 p-6 bg-gray-50 rounded-md shadow-md">
          <h2 className="text-lg font-semibold">🕒 Historique des Calculs :</h2>
          {historique.map((entry, index) => (
            <p key={index} className="text-sm mt-1">
              📊 Série : <strong>{entry.saisie}</strong> →
              Moyenne : <strong>{entry.moyenne?.toFixed(2)}</strong>,
              Médiane : <strong>{entry.mediane?.toFixed(2)}</strong>,
              Min : <strong>{entry.min}</strong>,
              Max : <strong>{entry.max}</strong>
            </p>
          ))}
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-600 rounded-md shadow-sm">
          <h2 className="font-bold">❌ Erreur :</h2>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default App;











