'use client'
import { useEffect, useState } from 'react';
import { peticionPost, peticionGet } from "../../hooks/Conexion";

export default function Page() {
  const [correos, setCorreos] = useState([]);

  const obtenerCorreos = async () => {
    try {
      const response = await peticionGet('recibirmensajes');
      const data = await response.json();

      if (data.emails) {
        setCorreos(data.emails);
      }
    } catch (error) {
      console.error('Error al obtener los correos:', error);
    }
  };

  useEffect(() => {
    obtenerCorreos();
  }, []);

  return (
    <div>
      <h1>Lista de Correos</h1>
      <div style={styles.cardContainer}>
        {correos.length > 0 ? (
          correos.map((email, index) => (
            <div style={styles.card} key={index}>
              <h3>{email.from}</h3>
              <h4>{email.subject}</h4>
              <p>{email.snippet}</p>
            </div>
          ))
        ) : (
          <p>No hay correos disponibles</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  cardContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
  },
  card: {
    width: '250px',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
  },
};
