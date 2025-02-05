'use client';

import mensajes from "../../../componentes/Mensajes";
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { peticionGet, peticionPost } from "../../../hooks/Conexion";
import { borrarSesion, getExternal, getToken } from "../../../hooks/SessionUtilClient";
import Footer from "../../../componentes/footer";
import Menu from "../../../componentes/menu";
import { useEffect, useState } from "react";

export default function Page() {
    const router = useRouter();
    const key = getToken();
    const external = getExternal();
    const [mensajesList, setMensajesList] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;  // Mes 0 basado
    const year = today.getFullYear();

    const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;


    useEffect(() => {
        peticionGet(`grupo/listar/${external}`, key).then((info) => {
            if (info.code === 200) {
                setGrupos(info.info);
            } else if (["token expirado o no valido", "token no valido", "no existe token"].includes(info.tag)) {
                mensajes(info.tag, "Error", "error");
                borrarSesion();
                router.push("/login");
            } else {
                mensajes("No se pudo listar los grupos", "Error", "error");
            }
        });
    }, [external, key, router]);

    const abrirModal = async (grupo) => {
        try {

            const info2 = await peticionGet(`mensaje/listar/${grupo.external_id}`, key);

            if (info2.code !== 200) {
                mensajes("No se pudo obtener los mensajes", "Error", "error");
                return;
            }

            setMensajesList(info2.info);
        } catch (error) {
            console.error("Error al abrir el modal:", error);
            mensajes("Ocurrió un error inesperado", "Error", error);
        }
    };

    const validationSchema = Yup.object().shape({
        nombre: Yup.string().required('Ingrese sus nombres'),
        mensaje: Yup.string().required('Seleccione el mensaje'),
        grupo: Yup.string().required('Seleccione un grupo'),
        hora: Yup.string().required('Ingrese una hora'),
        fecha: Yup.string()
        .required('Seleccione una fecha')
        .matches(
            /^\d{4}-\d{2}-\d{2}$/, 
            'La fecha debe estar en el formato YYYY-MM-DD'
        ),
    });

    const formOptions = { resolver: yupResolver(validationSchema) };
    const { register, handleSubmit, formState: { errors } } = useForm(formOptions);

    const sendData = (data) => {
        const datos = {
            nombre: data.nombre,
            mensaje: data.mensaje,
            grupo: data.grupo,
            fecha: data.fecha,
            hora: data.hora,
            usuario: external,
        };

        console.log(datos)

        peticionPost('recordatorio/registrar', datos, key).then((info) => {
            if (info.code === 200) {
                mensajes("Recordatorio guardado correctamente", "Información", "success");
                router.push("/login");
            } else if (["token expirado o no valido", "token no valido", "no existe token"].includes(info.tag)) {
                mensajes(info.tag, "Error", "error");
                borrarSesion();
                router.push("/login");
            } else {
                mensajes("Recordatorio no se pudo guardar", "Error", info.msg);
            }
        });
    };

    return (

        <div className="d-flex flex-column min-vh-100 position-relative">
            <div className="container-fluid p-1 position-relative">
                <Menu />
                <div className="row d-flex justify-content-center align-items-center vh-100 position-relative" style={{ overflow: "hidden" }}>
                    <div className="position-fixed top-0 start-0 w-100 h-100" style={{
                        backgroundImage: "url('https://cdn3d.iconscout.com/3d/premium/thumb/cloud-computing-3d-illustration.png')",
                        backgroundSize: "20%",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        filter: "blur(4px)",
                        zIndex: "-1"
                    }}></div>

                    <div className="d-flex flex-column" style={{ width: 700 }}>
                        <h1 className="text-center text-dark" style={{ fontSize: "3em" }}>Programar Recordatorio</h1>

                        <div className='container-fluid border border-secondary p-4 rounded' style={{ maxWidth: '1000px' }}>
                            <div className="container-fluid d-flex justify-content-center align-items-center">
                                <img className="card" src="https://th.bing.com/th/id/R.df3dbd67f8dcf1445d1c96a1cde6d018?rik=n3nZYmTtZjAiyQ&pid=ImgRaw&r=0" style={{ width: 100, height: 100 }} />
                            </div>
                            <br />
                            <form className="user" onSubmit={handleSubmit(sendData)}>
                                <div className="mb-4">
                                    <input {...register('nombre')} type="text" className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} placeholder='Ingrese descripción del recordatorio' />
                                    <div className='invalid-feedback'>{errors.nombre?.message}</div>
                                </div>
                                <div className="mb-4">
                                    <div className="col">
                                        <input
                                            {...register('fecha')}
                                            type="date"
                                            name="fecha"
                                            id="fecha"
                                            className={`form-control ${errors.fecha ? 'is-invalid' : ''}`}
                                            min={formattedDate}  // Aquí se usa formattedDate
                                            placeholder="Seleccione una fecha"
                                        />
                                        <div className="alert alert-danger invalid-feedback">
                                            {errors.fecha?.message}
                                        </div>
                                    </div>
                                    <br />
                                    <div className="col">
                                        <input {...register('hora')} type="time" name="hora" id="hora" className={`form-control ${errors.hora ? 'is-invalid' : ''}`} placeholder='Ingrese una hora' />
                                        <div className='alert alert-danger invalid-feedback'>{errors.hora?.message}</div>
                                    </div>

                                </div>

                                <div className="mb-4">
                                    <select
                                        {...register('grupo')}
                                        className={`form-control ${errors.grupo ? 'is-invalid' : ''}`}
                                        onChange={(e) => {
                                            const selectedGrupo = grupos.find(g => g.external_id === e.target.value);
                                            if (selectedGrupo) {
                                                abrirModal(selectedGrupo);
                                            }
                                        }}
                                    >
                                        <option value="">Elija un grupo</option>
                                        {grupos.map((grupo, i) => (
                                            <option key={i} value={grupo.external_id}>{`${grupo.nombre + '-'} ${grupo.tipo}`}</option>
                                        ))}
                                    </select>
                                    <div className='invalid-feedback'>{errors.grupo?.message}</div>
                                </div>
                                <div className="mb-4">
                                    <select {...register('mensaje')} className={`form-control ${errors.mensaje ? 'is-invalid' : ''}`}>
                                        <option value="">Elija un mensaje</option>
                                        {mensajesList.map((mensaje, i) => (
                                            <option key={i} value={mensaje.external_id}>{mensaje.asunto + '-'}{mensaje.tipo} </option>
                                        ))}
                                    </select>
                                    <div className='invalid-feedback'>{errors.mensaje?.message}</div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <a href="/recordatorio" className="btn btn-danger">Cancelar</a>
                                    <button type='submit' className="btn btn-success">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer className="mt-auto position-relative" />
        </div>
    );
}