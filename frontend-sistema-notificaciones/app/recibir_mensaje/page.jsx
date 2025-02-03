'use client'
import { useEffect, useState } from 'react';
import { peticionGet } from "../../hooks/Conexion";
import Menu from "../../componentes/menu";
import Footer from "../../componentes/footer";

export default function Page() {
  const [correos, setCorreos] = useState([]);
  const [sentiments, setSentiments] = useState({});
  const [opinions, setOpinions] = useState({});
  const [confidenceScores, setConfidenceScores] = useState({});
  const [loading, setLoading] = useState({});

  const obtenerCorreos = async () => {
    try {
      const response = await peticionGet('recibirmensajes');
      console.log("Respuesta de la API:", response);
      const data = await response;
      if (data.emails) {
        setCorreos(data.emails);
      }
    } catch (error) {
      console.error('Error al obtener los correos:', error);
    }
  };

  const fetchAnalysis = async (index, text) => {
    if (!text.trim()) return;
    
    setLoading(prev => ({ ...prev, [index]: true }));
    try {
      if (sentiments[index] || opinions[index]) {
        setSentiments(prev => ({ ...prev, [index]: null }));
        setOpinions(prev => ({ ...prev, [index]: null }));
        setConfidenceScores(prev => ({ ...prev, [index]: null }));
      } else {
        const response = await fetch('https://text-analisis.cognitiveservices.azure.com/text/analytics/v3.1/sentiment', {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': 'BccEhHz28ZNRMuxVFGCfie5ZImuFYweAlb390APMNx0QLNw1yEFSJQQJ99BBACYeBjFXJ3w3AAAaACOG3HUL',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ documents: [{ id: '1', language: 'es', text }] })
        });

        const data = await response.json();
        if (response.ok && data.documents.length > 0) {
          const doc = data.documents[0];
          setSentiments(prev => ({ ...prev, [index]: doc.sentiment }));
          setConfidenceScores(prev => ({ ...prev, [index]: doc.confidenceScores }));
          
          // Extraer opiniones si existen
          if (doc.sentences) {
            const extractedOpinions = doc.sentences.flatMap(sentence => sentence.opinions || []);
            setOpinions(prev => ({ ...prev, [index]: extractedOpinions }));
          }
        } else {
          setSentiments(prev => ({ ...prev, [index]: null }));
          setOpinions(prev => ({ ...prev, [index]: null }));
          setConfidenceScores(prev => ({ ...prev, [index]: null }));
        }
      }
    } catch (error) {
      console.error(error);
      setSentiments(prev => ({ ...prev, [index]: null }));
      setOpinions(prev => ({ ...prev, [index]: null }));
      setConfidenceScores(prev => ({ ...prev, [index]: null }));
    } finally {
      setLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  useEffect(() => {
    obtenerCorreos();
  }, []);

  return (
    <div>
      <Menu />
      <div className="container mt-4">
        <h1 className="text-center mb-4" style={{ color: '#205375', marginTop: '30px' }}>📧 Lista de Correos</h1>
        <div className="row">
          {correos.length > 0 ? (
            correos.map((email, index) => (
              <div className="col-md-4" key={index}>
                <div className="card shadow-sm">
                  <div className="card-header bg-dark text-white d-flex align-items-center">
                    <img src="https://1000marcas.net/wp-content/uploads/2019/11/logo-Gmail-1.png" alt="Gmail" width="50" height="28" className="me-2" />
                    <strong>Correo {index + 1}</strong>
                  </div>
                  <div className="card-body">
                    <p><strong>📩 Enviado Por:</strong> {email.from}</p>
                    <p><strong>📌 Asunto:</strong> {email.subject}</p>
                    <p><strong>📝 Cuerpo:</strong> {email.snippet}</p>
                    <button 
                      className="btn btn-success mt-2" 
                      onClick={() => fetchAnalysis(index, email.snippet)} 
                      disabled={loading[index]}
                    >
                      {loading[index] ? 'Analizando...' : 'Analizar Mensaje'}
                    </button>
                    {sentiments[index] && (
                      <div>
                        <p>🔍 Opinión detectada: {sentiments[index]}</p>
                        <p>📊 Confianza - Positivo: {confidenceScores[index]?.positive?.toFixed(2)} | Negativo: {confidenceScores[index]?.negative?.toFixed(2)} | Neutral: {confidenceScores[index]?.neutral?.toFixed(2)}</p>
                      </div>
                    )}
                    {opinions[index] && opinions[index].length > 0 && (
                      <div>
                        <strong>💬 Opiniones extraídas:</strong>
                        <ul>
                          {opinions[index].map((op, idx) => (
                            <li key={idx}> {op.target.text}: {op.assessments.map(a => `${a.text} (${a.sentiment}, confianza: ${a.confidenceScores.positive.toFixed(2)})`).join(', ')} </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center">
              <p>No hay correos disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
