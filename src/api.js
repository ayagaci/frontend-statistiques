import axios from "axios";

const BASE_URL = "https://mon-api-flask-1mi6.onrender.com"; // 🔹 Ton backend Flask sur Render

export const calculerStatistiques = async (valeurs) => {
  try {
    const response = await axios.post(`${BASE_URL}/calculer`, {
      valeurs: valeurs, // 🔹 Respecte le format attendu par l'API
    });

    return response.data; // 🔹 Retourne les résultats de l'API
  } catch (error) {
    return { error: error.response?.data || "Erreur de connexion à l'API" };
  }
};
