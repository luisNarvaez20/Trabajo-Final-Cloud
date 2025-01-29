'use client';

import mensajes from "../../../../componentes/Mensajes";
import * as Yup from 'yup';
import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { peticionPost, peticionGet, get_destinatario } from "../../../../hooks/Conexion";
import { useState, useEffect } from "react";
import { borrarSesion, getExternal, getToken } from "../../../../hooks/SessionUtilClient";
import Footer from "../../../../componentes/footer";
import Menu from "../../../../componentes/menu";

export default function Page({ params }) {
  const { external } = React.use(params); // Uso de React.use para desempaquetar params correctamente
  const token = getToken();
  const router = useRouter();
  const [destinatario, setDestinatario] = useState([]);
  const [grupo, setGrupo] = useState([]);
  const [obt, setObt] = useState(false);

  const validationShema = Yup.object().shape({
    nombres: Yup.string().required('Ingrese el nombres del destinatario'),
    apellidos: Yup.string().required('Ingrese la apellidos para el destinatario'),
    correo: Yup.string().required('Ingrese el tipo de destinatario'),
    grupo: Yup.string().required('Seleccione un grupo'),
  });

  const formOptions = { resolver: yupResolver(validationShema) };
  const { register, handleSubmit, setValue, formState } = useForm(formOptions);
  const { errors } = formState;

  const sendData = (data) => {
    const datos = {
      'nombres': data.nombres,
      'apellidos': data.apellidos,
      'correo': data.correo,
      'id_grupo': data.grupo,
    };

    peticionPost("destinatario/editar/" + external, datos, token).then((info) => {
      if (info.code !== 200) {
        mensajes("Destinatario no se pudo modificar", "Error", "error");
      } else {
        mensajes("Destinatario modificado correctamente", "éxito", "success");
        router.push("/destinatario");
      }
    });
  };

  useEffect(() => {
    if (!obt) {
      get_destinatario(external, token).then((info) => {
        if (info.code === 200) {
          console.log("fssf", info.datos)
          setDestinatario(info.datos);
          setObt(true);
        } else {
          mensajes("Error al listar destinatarios", "Error", "error");
        }
      });
    }
  }, [obt, external]);

  useEffect(() => {
    if (destinatario) {
      setValue('nombres', destinatario.nombres);
      setValue('apellidos', destinatario.apellidos);
      setValue('correo', destinatario.correo);
      if (destinatario.grupo) {
        setValue('grupo', destinatario.grupo.external_id);
      }
    }
  }, [destinatario, setValue]);

  useEffect(() => {
    if (!obt) {
      peticionGet('grupo/listar', token).then((info) => {
        if (info.code === 200) {
          setGrupo(info.info);
          setObt(true);
        } else {
          router.push("/destinatario");
        }
      });
    }
  }, [obt, token, router]);

  return (
    <div className="row">
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
      <div className="container-fluid p-1">
        <Menu></Menu>
        <div
          className="d-flex justify-content-center align-items-center vh-100"
          style={{
            position: "relative",
            overflow: "hidden" // Evita que la capa de opacidad sobresalga
          }} >
          <div
            className="d-flex flex-column"
            style={{
              width: "700px",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)", // Centrado absoluto
              minHeight: "95%",
              width: '1000px' // Asegura que no se reduzca la altura del formulario
            }}
          >
            <h1
              style={{
                color: '#205375',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              Editar destinatario
            </h1>
            <div
              className="container-fluid"
              style={{
                backgroundColor: 'white',
                border: '4px solid #ccc',
                padding: '20px',
                borderRadius: '10px',
                width: '1000px',
              }}
            >
              <div className="container-fluid d-flex justify-content-center align-items-center">
                <img className="card"
                  src="https://static.vecteezy.com/system/resources/previews/020/720/152/non_2x/recipient-icon-design-free-vector.jpg"
                  style={{ width: 100, height: 100 }}
                />
              </div>

              <br />
              <form className="destinatario" onSubmit={handleSubmit(sendData)}>
                <div className="row mb-4">
                  <div className="col">
                    <input
                      {...register('nombres')}
                      id="nombres"
                      className={`form-control ${errors.nombres ? 'is-invalid' : ''}`}
                      placeholder="Ingrese un nombre para el destinatario"
                      autoComplete="off"
                      style={{ fontSize: '15px' }}
                    />
                    <label className="form-label" style={{ color: '#1b4f72' }}>
                      Nombres
                    </label>
                    <div className="alert alert-danger invalid-feedback">
                      {errors.nombres?.message}
                    </div>
                  </div>
                  <div className="col">
                    <input
                      {...register('apellidos')}
                      id="apellidos"
                      className={`form-control ${errors.apellidos ? 'is-invalid' : ''}`}
                      placeholder="Ingrese apellidos para el destinatario"
                      autoComplete="off"
                      style={{ fontSize: '15px' }}
                    />
                    <label className="form-label" style={{ color: '#1b4f72' }}>
                      Apellidos
                    </label>
                    <div className="alert alert-danger invalid-feedback">
                      {errors.apellidos?.message}
                    </div>
                  </div>
                  <div className="col">
                    <input
                      {...register('correo')}
                      id="correo"
                      className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
                      placeholder="Ingrese un correo para el destinatario"
                      autoComplete="off"
                      style={{ fontSize: '15px' }}
                    />
                    <label className="form-label" style={{ color: '#1b4f72' }}>
                      Correo
                    </label>
                    <div className="alert alert-danger invalid-feedback">
                      {errors.correo?.message}
                    </div>
                  </div>
                </div>
                <div className="row mb-4">
                  <div className="col">
                    <select
                      {...register('grupo')}
                      id="grupo"
                      className={`form-control ${errors.grupo ? 'is-invalid' : ''}`}
                      style={{ fontSize: '15px' }}
                    >
                      <option value="">Elija a qué grupo pertenecerá</option>
                      {grupo.map((aux, i) => (
                        <option key={i} value={aux.external_id}>
                          {`${aux.nombre} ${aux.tipo}`}
                        </option>
                      ))}
                    </select>
                    <label className="form-label" style={{ color: '#1b4f72' }}>
                      Grupo
                    </label>
                    <div className="alert alert-danger invalid-feedback">
                      {errors.grupo?.message}
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-between">
                  <Link
                    href="/destinatario"
                    className="btn btn-danger"
                    style={{ marginLeft: '300px', fontSize: '22px' }}
                  >
                    CANCELAR
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-success"
                    style={{
                      marginRight: '300px',
                      fontSize: '22px',
                    }}
                  >
                    GUARDAR
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <br />
        <Footer />
      </div>
    </div>
  );
}
