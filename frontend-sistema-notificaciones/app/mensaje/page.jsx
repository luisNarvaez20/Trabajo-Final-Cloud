'use client';
import React, { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import mensajes from "../../componentes/Mensajes";
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { peticionGet, peticionPost } from "../../hooks/Conexion";
import { getToken, getExternal } from "../../hooks/SessionUtilClient";
import Menu from "../../componentes/menu";

export default function Page() {
  const external = getExternal();
  const key = getToken();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showMessageArea, setShowMessageArea] = useState(false);
  const [file, setFile] = useState(null);
  const [groupOptions, setGroupOptions] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [subject, setSubject] = useState('');
  const [messageType, setMessageType] = useState('');

  const validationShema = Yup.object().shape({
    asunto: Yup.string().required('Ingrese el asunto del mensaje'),
    contenido: Yup.string().required('Ingrese el contenido del mensaje'),
    tipo: Yup.string().required('Ingrese el tipo de mensaje'),
  });

  const formOptions = { resolver: yupResolver(validationShema) };
  const { register, handleSubmit, formState, setValue } = useForm(formOptions);
  const { errors } = formState;

  const sendData = (data) => {
    if (!selectedRecipient) {
      mensajes("Debe seleccionar un destinatario", "Error", "error");
      return;
    }

    const currentDate = new Date().toISOString();
    const datos = {
      'asunto': data.asunto,
      'contenido': data.contenido,
      'fecha': currentDate,
      'tipo': data.tipo,
      'id_usuario': external,
      'id_destinatario': selectedRecipient.id,
    };
    peticionPost('mensaje/guardar', datos, key).then((info) => {
      if (info.code !== 200) {
        mensajes("El mensaje no se pudo enviar", "Error", "error");
      } else {
        setValue("asunto", "");
        setValue("contenido", "");
        setFile(null);
        setSelectedGroup(null);
        setSelectedRecipient(null);
        setShowMessageArea(false);
        mensajes("Mensaje enviado correctamente", "Información", "success");
      }
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
      setRecipients([]);
      setSelectedRecipient(null);
      setShowMessageArea(false);
    } else {
      setSelectedGroup(group);
      setRecipients([]);
      setSelectedRecipient(null);
      setShowMessageArea(false);

      try {
        const external = group.external_id;
        const response = await peticionGet("destinatario/listar_grupo/" + external, key);
        if (response.code === 200) {
          setRecipients(response.datos);
        } else {
          console.error("Error al obtener los destinatarios:", response);
        }
      } catch (error) {
        console.error("Error al llamar a peticionGet para destinatarios:", error);
      }
    }
  };

  const handleRecipientSelect = (recipient) => {
    setSelectedRecipient(recipient);
    setShowMessageArea(true);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  return (
    <div>
      <Menu />
      <div className="container py-5">
        <div className="text-center mb-4">
          <h2>Enviar Mensaje</h2>
        </div>

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
                          <td>
                            <input
                              type="radio"
                              name="recipient"
                              value={recipient.external_id}
                              checked={selectedRecipient === recipient}
                              onChange={() => handleRecipientSelect(recipient)}
                            />
                            {"  "}
                            {recipient.nombres}
                          </td>
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

        {showMessageArea && (
          <div className="d-flex justify-content-center">
            <div className="card w-75">
              <div className="card-body">
                <p>Destinatario: {selectedRecipient ? `${selectedRecipient.nombres} ${selectedRecipient.apellidos}` : "Ningún destinatario seleccionado"}</p>

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
                    <label className="form-label">Archivo:</label>
                    <input type="file" className="form-control" onChange={handleFileChange} />
                  </div>

                  <button type="submit" className="btn btn-primary w-100">Enviar</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
