'use client';
import React, { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import mensajes from "../../componentes/Mensajes";
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup'
import { peticionGet } from "../../hooks/Conexion";
import { getToken } from "../../hooks/SessionUtilClient";
import Menu from "../../componentes/menu";

export default function Page() {
  const key = getToken();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showMessageArea, setShowMessageArea] = useState(false);
  const [file, setFile] = useState(null);
  const [groupOptions, setGroupOptions] = useState([]);

  // Definición del esquema de validación con Yup
  const validationShema = Yup.object().shape({
    mensaje: Yup.string().required('Ingrese un mensaje'),
  });

  const formOptions = { resolver: yupResolver(validationShema) };
  const { register, handleSubmit, formState, setValue } = useForm(formOptions);
  const { errors } = formState;

  // Obtener los grupos dinámicamente
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

  const handleGroupChange = (group) => {
    if (selectedGroup === group) {
      setSelectedGroup(null);
      setShowMessageArea(false);
    } else {
      setSelectedGroup(group);
      setShowMessageArea(true);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSendMessage = (data) => {
    // Verificar si hay mensaje antes de enviar
    if (data.mensaje.trim() === "") {
      mensajes("Por favor, ingresa un mensaje antes de enviar.", "Advertencia", "warning");
      return;
    }

    console.log("Message:", data.mensaje);
    console.log("File:", file);
    console.log("Selected Group:", selectedGroup);

    setValue("mensaje", ""); // Limpiar mensaje
    setFile(null);
    setSelectedGroup(null);
    setShowMessageArea(false);
    mensajes("Mensaje Enviado Correctamente", "Información", "success");
  };

  return (
    <div>
      <Menu />
      <div className="container py-5">
        <div className="text-center mb-4">
          <h2>Enviar Mensaje</h2>
        </div>

        {/* Selección de grupo */}
        <div className="d-flex justify-content-center mb-4">
          <div className="card w-75">
            <div className="card-body">
              <h5 className="card-title">Seleccionar Grupo</h5>
              <div className="table-responsive">
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
                            checked={selectedGroup === group.nombre}
                            onChange={() => handleGroupChange(group.nombre)}
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

        {/* Área de mensaje */}
        {showMessageArea && (
          <div className="d-flex justify-content-center">
            <div className="card w-75">
              <div className="card-body">
                <form onSubmit={handleSubmit(handleSendMessage)}>
                  <textarea
                    className="form-control mb-3"
                    placeholder="Escribe tu mensaje aquí..."
                    {...register('mensaje')} // Se registra el campo mensaje
                    rows="4"
                  ></textarea>
                  {errors.mensaje && (
                    <div className="alert alert-danger">
                      {errors.mensaje.message}
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Archivos máximo de 8MB:</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFileChange}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                  >
                    Enviar
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
