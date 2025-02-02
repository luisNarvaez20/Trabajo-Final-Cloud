'use client';
import { useState, useEffect, useRef } from 'react';

const key = process.env.NEXT_PUBLIC_LANGUAGE_KEY;
const endpoint = process.env.NEXT_PUBLIC_LANGUAGE_ENDPOINT;

export default function Page() {
    const [text, setText] = useState('');
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState('');
    const [hoveredError, setHoveredError] = useState(null);
    const [showErrors, setShowErrors] = useState(true);
    const [sentiment, setSentiment] = useState(null);
    const divRef = useRef(null);

    useEffect(() => {
        if (!showErrors) return;
        
        const fetchErrors = async () => {
            if (text.trim() === '') {
                setErrors([]);
                setMessage('');
                return;
            }

            try {
                const response = await fetch('https://api.languagetool.org/v2/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ 'text': text, 'language': 'es' }),
                });

                const data = await response.json();
                if (response.ok) {
                    setErrors(data.matches || []);
                    setMessage(data.matches.length ? '' : 'No se encontraron errores.');
                } else {
                    setMessage('Error al verificar el texto.');
                }
            } catch (error) {
                console.error(error);
                setMessage('Hubo un problema con la solicitud.');
            }
        };

        const timeoutId = setTimeout(fetchErrors, 500);
        return () => clearTimeout(timeoutId);
    }, [text, showErrors]);

    useEffect(() => {
        const fetchSentiment = async () => {
            if (!text.trim()) return;
            
            try {
                const response = await fetch(`https://text-analisis.cognitiveservices.azure.com//text/analytics/v3.1/sentiment`, {
                    method: 'POST',
                    headers: {
                        'Ocp-Apim-Subscription-Key': 'BccEhHz28ZNRMuxVFGCfie5ZImuFYweAlb390APMNx0QLNw1yEFSJQQJ99BBACYeBjFXJ3w3AAAaACOG3HUL',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ documents: [{ id: '1', language: 'es', text }] })
                });

                const data = await response.json();
                if (response.ok && data.documents.length > 0) {
                    setSentiment(data.documents[0].sentiment);
                } else {
                    setSentiment(null);
                }
            } catch (error) {
                console.error(error);
                setSentiment(null);
            }
        };

        fetchSentiment();
    }, [text]);

    const handleInput = (e) => {
        setText(e.target.value);
    };

    const handleMouseEnter = (errorId) => {
        setHoveredError(errorId);
    };

    const handleMouseLeave = () => {
        setHoveredError(null);
    };

    const toggleErrors = () => {
        setShowErrors(prev => !prev);
    };

    const getHighlightedText = () => {
        const elements = [];
        let lastIndex = 0;
        errors.forEach((err, index) => {
            const beforeText = text.slice(lastIndex, err.offset);
            const errorText = text.slice(err.offset, err.offset + err.length);
            if (beforeText) {
                elements.push(<span key={`before-${index}`}>{beforeText}</span>);
            }
            elements.push(
                <span 
                    key={`error-${index}`}
                    style={{ backgroundColor: 'yellow', color: 'red', cursor: 'pointer' }}
                    className="highlighted-word"
                    onMouseEnter={() => handleMouseEnter(err.offset)}
                    onMouseLeave={handleMouseLeave}
                >
                    {errorText}
                </span>
            );
            lastIndex = err.offset + err.length;
        });
        elements.push(<span key="remaining">{text.slice(lastIndex)}</span>);
        return elements;
    };

    return (
        <div>
            <h1>Verificador de Ortografía y Análisis de Sentimiento</h1>
            <textarea
                value={text}
                onChange={handleInput}
                style={{
                    width: '80%',
                    minHeight: '100px',
                    padding: '10px',
                    border: '1px solid #ccc',
                    outline: 'none',
                }}
            />
            <button onClick={toggleErrors} style={{ marginTop: '10px', padding: '5px 10px' }}>
                {showErrors ? 'Ocultar Errores' : 'Mostrar Errores'}
            </button>
            {sentiment && <p>Sentimiento detectado: <strong>{sentiment}</strong></p>}
            {showErrors && (
                <div
                    ref={divRef}
                    style={{
                        width: '80%',
                        minHeight: '150px',
                        padding: '10px',
                        border: '1px solid #ccc',
                        whiteSpace: 'pre-wrap',
                        marginTop: '10px',
                        backgroundColor: '#f9f9f9',
                    }}
                >
                    {getHighlightedText()}
                </div>
            )}
            {hoveredError !== null && (
                <div className="mt-3">
                    <h2>Errores encontrados:</h2>
                    <ul className="list-group">
                        {errors.map((error, index) => {
                            if (error.offset == hoveredError) {
                                const palabraIncorrecta = text.substring(error.offset, error.offset + error.length);
                                return (
                                    <li key={index} className="list-group-item">
                                        <strong className="bg-warning px-1 rounded">{palabraIncorrecta+' '}</strong>:  
                                        {error.replacements.length > 0
                                            ? error.replacements.map((s, i) => <span key={i} className="text-success">{s.value+' '}</span>)
                                            : 'Sin sugerencias'}
                                    </li>
                                );
                            }
                            return null;
                        })}
                    </ul>
                </div>
            )}
            {message && <p>{message}</p>}
        </div>
    );
}
