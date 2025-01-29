'use client';
import mensajes from "../../../componentes/Mensajes";
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { peticionPost, peticionGet } from "../../../hooks/Conexion";
import { useState, useEffect } from "react";
import { borrarSesion, getExternal, getToken } from "../../../hooks/SessionUtilClient";
import Footer from "../../../componentes/footer";
import Menu from "../../../componentes/menu";

export default function Page() {
  const router = useRouter();
  const token = getToken();
  const [grupo, setGrupo] = useState([]);
  const [obt, setObt] = useState(false);

  const validationShema = Yup.object().shape({
    nombres: Yup.string().required('Ingrese el nombre del destinatario'),
    apellidos: Yup.string().required('Ingrese el apellido del destinatario'),
    correo: Yup.string().required('Ingrese el correo del destinatario'),
    grupo: Yup.string().required('Seleccione una grupo'),
  });

  const formOptions = { resolver: yupResolver(validationShema) };
  const { register, handleSubmit, formState } = useForm(formOptions);
  const { errors } = formState;


  //Metodo para guardar
  const sendData = (data) => {
    console.log('Datos a enviar al backend:', data);

    var datos = {
      'nombres': data.nombres,
      'apellidos': data.apellidos,
      'correo': data.correo,
      'id_grupo': data.grupo
    };

    peticionPost('destinatario/guardar', datos, token).then((info) => {
      console.log(info);
      if (info.code !== 200) {
        mensajes("El sensor no se pudo guardar", "Error", "error")
      } else {
        mensajes("Sensor guardado correctamente", "Informacion", "success")
        router.push("/destinatario");
      }
    });
  };

  if (!obt) {
    peticionGet('grupo/listar', token).then((info) => {
      console.log(info.info)
      if (info.code === 200) {
        setGrupo(info.info);
        setObt(true);
      } else if (info.code !== 200) {
        router.push("/destinatario")
      } else {
        mensajes("Error al listar usuarios", "Error", "error");
      }
    });
  };

  return (
    <div>
      <Menu></Menu>
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
    <div className="d-flex flex-column justify-content-center align-items-center"  style={{
                            position: "absolute",
                            top: "39%",
                            left: "50%",
                            transform: "translate(-50%, -50%)", 
                        }}>
      <h1 style={{ color: '#205375' }}>Registrar Destinatario</h1>
      <div className="container-fluid" style={{ backgroundColor: 'white', border: '4px solid #ccc', padding: '20px', borderRadius: '10px', width: '1000px'}}>
      <div className="container-fluid d-flex justify-content-center align-items-center">
                                <img className="card"
                                    src="https://static.vecteezy.com/system/resources/previews/020/720/152/non_2x/recipient-icon-design-free-vector.jpg"
                                    style={{ width: 100, height: 100 }}
                                />
                            </div>
                            <br />
        <form className="grupo" onSubmit={handleSubmit(sendData)}>
          <div className="row mb-4">
            <div className="col">
              <input {...register('nombres')} name="nombres" id="nombres" className={`form-control ${errors.nombres ? 'is-invalid' : ''}`} placeholder='Ingrese un nombre para el sensor' autoComplete="off" style={{ fontSize: '25px' }} />
              <label className="form-label" style={{ color: '#1b4f72' }}>Nombre</label>
              <div className='alert alert-danger invalid-feedback'>{errors.nombres?.message}</div>
            </div>
            <div className="col">
              <input {...register('apellidos')} name="apellidos" id="apellidos" className={`form-control ${errors.apellidos ? 'is-invalid' : ''}`} placeholder='Ingrese apellidos para el sensor' autoComplete="off" style={{ fontSize: '25px' }} />
              <label className="form-label" style={{ color: '#1b4f72' }}>Apellidos</label>
              <div className='alert alert-danger invalid-feedback'>{errors.apellidos?.message}</div>
            </div>
            <div className="col">
              <input {...register('correo')} name="correo" id="correo" className={`form-control ${errors.correo ? 'is-invalid' : ''}`} placeholder='Ingrese el correo del destinatario' autoComplete="off" style={{ fontSize: '25px' }} />
              <label className="form-label" style={{ color: '#1b4f72' }}>Correo</label>
              <div className='alert alert-danger invalid-feedback'>{errors.correo?.message}</div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col">
              <select {...register('grupo')} name="grupo" id="grupo" className={`form-control ${errors.grupo ? 'is-invalid' : ''}`} style={{ fontSize: '25px' }}>
                <option value="">Elija a que grupo pertenecera</option>
                {grupo.map((aux, i) => (
                  <option key={i} value={aux.external_id}>
                    {`${aux.nombre} ${aux.tipo}`}
                  </option>
                ))}
              </select>
              <label className="form-label" style={{ color: '#1b4f72' }}>Grupo</label>
              <div className='alert alert-danger invalid-feedback'>{errors.grupo?.message}</div>
            </div>
          </div>

          <div className="d-flex justify-content-between">
            <Link href="/destinatario" className="btn btn-danger " style={{ marginLeft: '300px', fontSize:'22px' }}>
              CANCELAR
            </Link>
            <button type='submit' className="btn btn-success " style={{ marginRight: '300px', fontSize:'22px' }}>
              GUARDAR
            </button>
          </div>
        </form>
      </div>
    </div>
    <Footer />
    </div>
  )
};
