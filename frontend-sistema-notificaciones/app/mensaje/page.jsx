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
  const [recipients, setRecipients] = useState([]); // Lista de destinatarios
  const [selectedRecipient, setSelectedRecipient] = useState(null); // Estado para el destinatario seleccionado
  const [subject, setSubject] = useState('');  // Estado para el asunto
  const [messageType, setMessageType] = useState(''); // Estado para el tipo de mensaje

  const validationSchema = Yup.object().shape({
    mensaje: Yup.string().required('Ingrese un mensaje'),
  });

  const formOptions = { resolver: yupResolver(validationSchema) };
  const { register, handleSubmit, formState, setValue } = useForm(formOptions);
  const { errors } = formState;

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
      setRecipients([]); // Limpiar destinatarios
      setSelectedRecipient(null); // Desmarcar destinatario seleccionado
      setShowMessageArea(false);
    } else {
      setSelectedGroup(group);
      setRecipients([]); // Limpiar destinatarios antes de cargar nuevos
      setSelectedRecipient(null); // Desmarcar destinatario seleccionado
      setShowMessageArea(false);  // Ocultar área de mensaje hasta seleccionar un destinatario

      try {
        const external = group.external_id;
        console.log("group selected:", external);
        const response = await peticionGet("destinatario/listar_grupo/" + external, key);
        if (response.code === 200) {
          setRecipients(response.datos); // Guardar los destinatarios
        } else {
          console.error("Error al obtener los destinatarios:", response);
        }
      } catch (error) {
        console.error("Error al llamar a peticionGet para destinatarios:", error);
      }
    }
  };

  const handleRecipientSelect = (recipient) => {
    setSelectedRecipient(recipient);  // Establecer el destinatario seleccionado
    setShowMessageArea(true);  // Mostrar el área de mensaje
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSendMessage = (data) => {
    if (data.mensaje.trim() === "") {
      mensajes("Por favor, ingresa un mensaje antes de enviar.", "Advertencia", "warning");
      return;
    }

    console.log("Asunto:", subject);
    console.log("Tipo de mensaje:", messageType);
    console.log("Message:", data.mensaje);
    console.log("File:", file);
    console.log("Selected Group:", selectedGroup);
    console.log("Selected Recipient:", selectedRecipient);

    setValue("mensaje", ""); // Limpiar mensaje
    setFile(null);
    setSelectedGroup(null);
    setSelectedRecipient(null);
    setShowMessageArea(false);  // Ocultar área de mensaje después de enviar
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
              <h5 className="card-title d-flex justify-content-center">Seleccionar Grupo</h5>
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

        {/* Mostrar destinatarios asociados en tabla */}
        {recipients.length > 0 && (
          <div className="d-flex justify-content-center mb-4">
            <div className="card w-75">
              <div className="card-body">
                <h5 className="card-title d-flex justify-content-center">Miembros Asociados</h5>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Nombres</th>
                        <th>Apellidos</th>
                        <th>Correo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipients.map((recipient, index) => (
                        <tr key={index}>
                          <td>{<input
                              type="radio"
                              name="recipient"
                              value={recipient.external_id}
                              checked={selectedRecipient === recipient}
                              onChange={() => handleRecipientSelect(recipient)}
                            />}{" "}{recipient.nombres}</td>
                          <td>{recipient.apellidos}</td>
                          <td>{recipient.correo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-4">
          <h2>Cuerpo del Mensaje</h2>
        </div>
        
        {/* Área de mensaje */}
        {showMessageArea && (
          <div className="d-flex justify-content-center">
            <div className="card w-75">
              <div className="card-body">
                {/* Mostrar el nombre del destinatario seleccionado */}
                <p>Destinatario: {selectedRecipient ? `${selectedRecipient.nombres} ${selectedRecipient.apellidos}` : "Ningún destinatario seleccionado"}</p>

                {/* Campo de Asunto */}
                <div className="mb-3">
                  <label className="form-label">Asunto:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Asunto del mensaje"
                  />
                </div>

                {/* Tipo de mensaje */}
                <div className="mb-3">
                  <label className="form-label">Tipo de Mensaje:</label>
                  <select
                    className="form-select"
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value)}
                  >
                    <option value="">Seleccionar tipo de mensaje</option>
                    <option value="informativo">Informativo</option>
                    <option value="urgente">Urgente</option>
                    <option value="alerta">Alerta</option>
                  </select>
                </div>

                {/* Formulario de mensaje */}
                <form onSubmit={handleSubmit(handleSendMessage)}>
                  <textarea
                    className="form-control mb-3"
                    placeholder="Escribe tu mensaje aquí..."
                    {...register('mensaje')}
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
