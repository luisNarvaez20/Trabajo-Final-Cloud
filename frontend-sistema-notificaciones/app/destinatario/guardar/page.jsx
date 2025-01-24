
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


  //Metodo para guard
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
        mensajes("EL sensor no se pudo guardar", "Error", "error")
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
    <div className="row justify-content-center" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <div className="d-flex flex-column" >
        <Menu></Menu>
        <h1 style={{ color: '#205375' ,display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Registrar Sensor</h1>
        <div className='container-fluid' style={{ border: '4px solid #ccc', padding: '20px', borderRadius: '10px', width: '1000px' }}>
          <br />
          <form className="grupo" onSubmit={handleSubmit(sendData)}>
          <div className="row mb-4">
                <div className="col">
                  <input {...register('nombres')} name="nombres" id="nombres" className={`form-control ${errors.nombres ? 'is-invalid' : ''}`} placeholder='Ingrese un nombre para el sensor' autoComplete="off" style={{ fontSize: '25px' }}/>
                  <label className="form-label" style={{ color: '#1b4f72' }}>Nombre</label>
                  <div className='alert alert-danger invalid-feedback'>{errors.nombres?.message}</div>
                </div>
                <div className="col">
                  <input {...register('apellidos')} name="apellidos" id="apellidos" className={`form-control ${errors.apellidos ? 'is-invalid' : ''}`} placeholder='Ingrese apellidos para el sensor' autoComplete="off" style={{ fontSize: '25px' }}/>
                  <label className="form-label" style={{ color: '#1b4f72' }}>Apellidos</label>
                  <div className='alert alert-danger invalid-feedback'>{errors.apellidos?.message}</div>
                </div>
                <div className="col">
                  <input {...register('correo')} name="correo" id="correo" className={`form-control ${errors.correo ? 'is-invalid' : ''}`} placeholder='Ingrese el correo del destinatario' autoComplete="off" style={{ fontSize: '25px' }}/>
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
                  <label className="form-label" style={{ color: '#1b4f72' }}>grupo</label>
                  <div className='alert alert-danger invalid-feedback'>{errors.grupo?.message}</div>
                </div>
              </div>
              <div className="d-flex justify-content-center mt-4">
              <Link href="/destinatario" className="btn btn-danger mr-3" style={{ background: 'red', fontSize:'25px'}}>
                CANCELAR
              </Link>
    <button type='submit' className="btn btn-success ml-3" style={{ background: '#205375', marginLeft: '20px', fontSize:'25px'}}>
        GUARDAR
    </button>
</div>

          </form>
        </div>
      </div>
    </div>
  )
};
