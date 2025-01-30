'use client';
import React, { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import mensajes from "../../componentes/Mensajes";
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { peticionGet, peticionPost, peticionPost2 } from "../../hooks/Conexion";
import { getToken, getExternal } from "../../hooks/SessionUtilClient";
import Menu from "../../componentes/menu";
import { useRouter } from 'next/navigation';

export default function Page() {
  const [files, setFiles] = useState([]);
  const [totalFileSize, setTotalFileSize] = useState(0);
  const [uploading, setUploading] = useState(false);
  const external = getExternal();
  const key = getToken();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showMessageArea, setShowMessageArea] = useState(false);
  const [groupOptions, setGroupOptions] = useState([]);
  const router = useRouter();

  const handleFileChange2 = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const newFileList = [...files, ...selectedFiles];

    const totalSize = newFileList.reduce((acc, file) => acc + file.size, 0);

    if (totalSize > 8 * 1024 * 1024) {
      mensajes("El tamaño total de los archivos no debe superar los 8MB", "Error", "error");
      return;
    }

    setFiles(newFileList);
    setTotalFileSize(totalSize);
  };

  const removeFile = (index, event) => {
    event.preventDefault(); 

    const newFileList = files.filter((_, i) => i !== index);
    const totalSize = newFileList.reduce((acc, file) => acc + file.size, 0);

    setFiles(newFileList);
    setTotalFileSize(totalSize);
  };


  const validationShema = Yup.object().shape({
    asunto: Yup.string().required('Ingrese el asunto del mensaje'),
    contenido: Yup.string().required('Ingrese el contenido del mensaje'),
    tipo: Yup.string().required('Ingrese el tipo de mensaje'),
  });

  const formOptions = { resolver: yupResolver(validationShema) };
  const { register, handleSubmit, formState, setValue } = useForm(formOptions);
  const { errors } = formState;
//convertir archivo a string base64
  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };
  

  const sendData = async (data) => {
    
    const archivosConvertidos = await Promise.all(
      files.map(async (archivo) => {
        //const archivoComprimido = await compressFile(archivo);
        const contenidoBase64 = await convertBase64(archivo);
        return {
          nombre: archivo.name,
          contenido: contenidoBase64.split(',')[1] // Remover el prefijo de data URL
        };
      })
    );
    const datos = {
      'asunto': data.asunto,
      'contenido': data.contenido,
      'grupo': data.external_id || selectedGroup.external_id,
      'archivos': archivosConvertidos,
      'external': external
    };

    peticionPost('mensaje/enviar', datos, key).then((info) => {
      if (info.code !== 200) {
        mensajes("El mensaje no se pudo enviar", "Error", info.msg || info.error || info.data);
        return;
      }

      mensajes("El mensaje se envió correctamente", "Éxito", "success");
      router.push("/principal");
    });
};
  

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await peticionGet("/grupo/listar", key);
        if (response && response.info) {
          setGroupOptions(response.info);
        } else {
          console.error("Error al obtener los grupos:", response);
        }
      } catch (error) {
        console.error("Error al llamar a peticionGet:", error);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupChange = async (group) => {
    if (selectedGroup === group) {
      setSelectedGroup(null);
      setSelectedRecipient(null);
      setShowMessageArea(false);
    } else {
      setSelectedGroup(group);
      setShowMessageArea(true);

    }
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
                    filter: "blur(4px)",  // Difuminar solo la imagen de fondo
                    zIndex: "-1"
                }}
            ></div>
      <Menu />
      <div className="container py-5">
        <div className="text-center mb-4">
        <h1 className="text-center" style={{ fontSize: "3em", color: '#205375' }}>Enviar Mensaje</h1>
        </div>

        <div className="d-flex justify-content-center mb-4">
          <div className="card w-75">
            <div className="card-body">
            <div className="container-fluid d-flex justify-content-center align-items-center">
                                <img className="card"
                                    src="https://static.vecteezy.com/system/resources/previews/000/422/384/non_2x/vector-send-message-icon.jpg"
                                    style={{ width: 80, height: 80 }}
                                />
                            </div>
                            <br />
              <div className="table-responsive">
              <label className="form-label" style={{ color: '#1b4f72' }}>Seleccionar Grupo</label>
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Grupo</th>
                      <th>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupOptions.map((group, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="radio"
                            name="group"
                            value={group.nombre}
                            checked={selectedGroup === group}
                            onChange={() => handleGroupChange(group)}
                          />
                          {"  "}
                          {group.nombre}
                        </td>
                        <td>{group.tipo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {showMessageArea && (
          <div className="d-flex justify-content-center">
            <div className="card w-75">
              <div className="card-body">
                <p>Destinatarios del grupo: {selectedGroup ? `${selectedGroup.nombre}` : "Ningún destinatario seleccionado"}</p>

                <div className="mb-3">
                  <label className="form-label">Asunto:</label>
                  <input
                    {...register('asunto')}
                    className={`form-control ${errors.asunto ? 'is-invalid' : ''}`}
                  />
                  <div className="invalid-feedback">{errors.asunto?.message}</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Tipo de Mensaje:</label>
                  <select
                    {...register('tipo')}
                    className={`form-control ${errors.tipo ? 'is-invalid' : ''}`}
                  >
                    <option value="">Seleccionar tipo de mensaje</option>
                    <option value="informativo">Informativo</option>
                    <option value="urgente">Urgente</option>
                    <option value="alerta">Alerta</option>
                  </select>
                  <div className="invalid-feedback">{errors.tipo?.message}</div>
                </div>

                <form onSubmit={handleSubmit(sendData)}>
                  <textarea
                    className="form-control mb-3"
                    placeholder="Escribe tu mensaje aquí..."
                    {...register('contenido')}
                    rows="4"
                  ></textarea>
                  {errors.contenido && (
                    <div className="alert alert-danger">{errors.contenido.message}</div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Archivos Adjuntos:</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      id="archivo"
                      onChange={handleFileChange2}
                    />
                    {files.length > 0 && (
                      <div className="mt-2">
                        <h6>Archivos seleccionados:</h6>
                        <ul className="list-group">
                          {files.map((file, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              <button
                                type="button" // Evita que actúe como submit
                                className="btn btn-danger btn-sm"
                                onClick={(event) => removeFile(index, event)}
                              >
                                X
                              </button>
                            </li>
                          ))}
                        </ul>
                        {totalFileSize > 8 * 1024 * 1024 && (
                          <div className="alert alert-danger mt-2">
                            El tamaño total de los archivos no debe superar los 8MB.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn btn-success" disabled={totalFileSize > 8 * 1024 * 1024 && uploading} >
                  {uploading ? "Subiendo..." : "Enviar"}
                  </button>
                  <a href="/principal" className="btn btn-danger" style={{ marginLeft: '8px'}}>
                                        Cancelar
                                    </a>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
