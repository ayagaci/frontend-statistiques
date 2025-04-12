import React from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

function ExportButton({ results, graphRef }) {
  const handleExport = (type) => {
    if (type === 'pdf') exportToPDF();
    else if (type === 'excel') exportToExcel();
    else if (type === 'word') exportToWord();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let y = 10;

    Object.entries(results).forEach(([key, value]) => {
      doc.text(`${key} : ${value}`, 10, y);
      y += 10;
    });

    if (graphRef?.current) {
      const canvas = graphRef.current.querySelector('canvas');
      if (canvas) {
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 10, y, 180, 80);
      }
    }

    doc.save('resultats.pdf');
  };

  const exportToExcel = () => {
    const data = Object.entries(results).map(([k, v]) => ({ Clé: k, Valeur: v }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Résultats');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'resultats.xlsx');
  };

  const exportToWord = () => {
    const doc = new Document({
      sections: [
        {
          children: Object.entries(results).map(([key, value]) =>
            new Paragraph({
              children: [new TextRun(`${key} : ${value}`)],
            })
          ),
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'resultats.docx');
    });
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Exporter en :</label>
      <select onChange={(e) => handleExport(e.target.value)} defaultValue="">
        <option value="" disabled>Choisissez le format</option>
        <option value="pdf">📄 PDF</option>
        <option value="excel">📊 Excel</option>
        <option value="word">📝 Word</option>
      </select>
    </div>
  );
}

export default ExportButton;