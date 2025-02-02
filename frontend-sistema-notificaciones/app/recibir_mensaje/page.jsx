'use client'
import { useEffect, useState } from 'react';
import { peticionGet } from "../../hooks/Conexion";
import Link from "next/link";
import Menu from "../../componentes/menu";
import Footer from "../../componentes/footer";

export default function Page() {
  const [correos, setCorreos] = useState([]);
  const [sentiments, setSentiments] = useState({});
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

  const fetchSentiment = async (index, text) => {
    if (!text.trim()) return;
    
    setLoading(prev => ({ ...prev, [index]: true }));
    try {
      if (sentiments[index]) {
        // Si ya tiene sentimiento, al hacer clic se oculta
        setSentiments(prev => ({ ...prev, [index]: null }));
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
          setSentiments(prev => ({ ...prev, [index]: data.documents[0].sentiment }));
        } else {
          setSentiments(prev => ({ ...prev, [index]: null }));
        }
      }
    } catch (error) {
      console.error(error);
      setSentiments(prev => ({ ...prev, [index]: null }));
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
                    {email.attachments && email.attachments.length > 0 && (
                      <div>
                        <strong>📎 Archivos Adjuntos:</strong>
                        <ul>
                          {email.attachments.map((file, idx) => (
                            <li key={idx}>
                              <a href={file.fileUrl} download={file.filename} target="_blank" rel="noopener noreferrer">
                                📂 {file.filename}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button 
                      className="btn btn-success mt-2" 
                      onClick={() => fetchSentiment(index, email.snippet)} 
                      disabled={loading[index]}
                    >
                      {loading[index] ? 'Analizando...' : 'Analizar Mensaje'}
                    </button>
                    {sentiments[index] && <p>Opinion detectada: {sentiments[index]}</p>}
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
      <Footer />
    </div>
  );
}
