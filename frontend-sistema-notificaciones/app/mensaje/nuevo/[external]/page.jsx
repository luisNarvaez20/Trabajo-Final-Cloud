'use client';
import React, { useState, useEffect, useRef } from "react";
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { getToken, getExternal } from "../../../../hooks/SessionUtilClient";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importa los íconos
import Footer from "../../../../componentes/footer";
import Menu from "../../../../componentes/menu";
import { useRouter, useParams } from 'next/navigation';
import mensajes from "../../../../componentes/Mensajes";
import { peticionPost } from "../../../../hooks/Conexion";

export default function Page({ }) {
  const router = useRouter();
  const params = useParams();
  const [files, setFiles] = useState([]);
  const [totalFileSize, setTotalFileSize] = useState(0);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const extern = getExternal();
  const key = getToken();
  const remitente = decodeURIComponent(params.external);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [errors2, setErrors] = useState([]);
  const divRef = useRef(null);

  console.log(remitente)

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

  const getHighlightedText = () => {
    const elements = [];
    let lastIndex = 0;
    errors2.forEach((err, index) => {
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
        >
          {errorText}
        </span>
      );
      lastIndex = err.offset + err.length;
    });
    elements.push(<span key="remaining">{text.slice(lastIndex)}</span>);
    return elements;
  };


  const toggleErrors = () => {
    setShowErrors(prev => !prev);
  };

  const validationShema = Yup.object().shape({
    asunto: Yup.string().required('Ingrese el asunto del mensaje'),
    contenido: Yup.string().required('Ingrese el contenido del mensaje'),
  });

  const formOptions = { resolver: yupResolver(validationShema) };
  const { register, handleSubmit, formState, setValue, watch } = useForm(formOptions);
  const { errors } = formState;

  useEffect(() => {
    setText(watch('contenido') || '');
  }, [watch('contenido')]);

  const sendData = async (data) => {
    const archivosConvertidos = await Promise.all(
      files.map(async (archivo) => {
        const contenidoBase64 = await convertBase64(archivo);
        return {
          nombre: archivo.name,
          contenido: contenidoBase64.split(',')[1]
        };
      })
    );
    const datos = {
      'asunto': data.asunto,
      'contenido': data.contenido,
      'remitente': remitente
    };

    peticionPost('mensaje/enviar/respuesta', datos, key).then((info) => {
      if (info.code !== 200) {
        mensajes("El mensaje no se pudo enviar", "Error", info.msg || info.error || info.data);
        return;
      }

      mensajes("El mensaje se envió correctamente", "Éxito", "success");
      router.push("/principal");
    });
  };

  return (
    <div>
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          backgroundImage: "url('https://cdn3d.iconscout.com/3d/premium/thumb/cloud-computing-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--technology-hosting-network-storage-web-optimization-pack-seo-illustrations-4812696.png')",
          backgroundSize: "20%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          filter: "blur(4px)",
          zIndex: "-1"
        }}
      ></div>
      <Menu />
      <div className="container py-5">
        <div className="text-center mb-4">
          <h1 className="text-center" style={{ fontSize: "3em", color: '#205375' }}>Enviar Mensaje</h1>
        </div>

        <div className="d-flex justify-content-center align-items-center">
          <div className="card w-75">
            <div className="card-body">
            <p>Destinatario: {remitente || "Ningún destinatario seleccionado"}</p>

              <div className="mb-3">
                <label className="form-label">Asunto:</label>
                <input
                  {...register('asunto')}
                  className={`form-control ${errors.asunto ? 'is-invalid' : ''}`}
                />
                <div className="invalid-feedback">{errors.asunto?.message}</div>
              </div>

              <form onSubmit={handleSubmit(sendData)}>
                <textarea
                  value={watch('contenido')}
                  onChange={(e) => setValue('contenido', e.target.value)}
                  className="form-control mb-3"
                  placeholder="Escribe tu mensaje aquí..."
                  {...register('contenido')}
                  rows="4"
                ></textarea>

                <div className="d-flex justify-content-end align-items-center">
                  <button
                    type="button"
                    onClick={toggleErrors}
                    style={{ marginTop: "-13px", padding: "3px 10px", display: "flex", alignItems: "center", gap: "3px", fontSize: '10px' }}
                  >
                    {showErrors ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                    {showErrors ? "Errores Lexicos" : "Errores Lexicos"}
                  </button>
                </div>

                {showErrors && (
                  <div
                    ref={divRef}
                    style={{
                      width: '80%',
                      minHeight: '150px',
                      padding: '10px',
                      border: '1px solid #ccc',
                      whiteSpace: 'pre-wrap',
                      marginTop: '-10px',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    {getHighlightedText()}
                  </div>
                )}

                <button type="submit" className="btn btn-success" disabled={totalFileSize > 8 * 1024 * 1024 && uploading} >
                  {uploading ? "Subiendo..." : "Enviar"}
                </button>
                <a href="/principal" className="btn btn-danger" style={{ marginLeft: '8px' }}>
                  Cancelar
                </a>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
