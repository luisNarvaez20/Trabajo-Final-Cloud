'use client';
import mensajes from "../../../../componentes/Mensajes";
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form';
import Link from "next/link";
import { useRouter, useParams } from 'next/navigation';
import { peticionGet, peticionPost } from "../../../../hooks/Conexion";
import { useEffect, useState } from "react";
import { borrarSesion, getToken } from "../../../../hooks/SessionUtilClient";
import Menu from '../../../../componentes/menu';
import Footer from '../../../../componentes/footer';
import Cookies from "js-cookie";


export default function Page({ }) {

    const params = useParams();
    const external = params.external;
    const key = getToken();

    const router = useRouter();
    const [persona, setPersona] = useState([]);
    const [obt, setObt] = useState(false);

    const validationShema = Yup.object().shape({
        nombres: Yup.string().required('Ingrese los nombres'),
        apellidos: Yup.string().required('ingrese los apellidos'),
        direccion: Yup.string().required('Ingrese una direccion'),
        telefono: Yup.string().required('ingrese un telefono'),
        usuario: Yup.string().required('ingrese un usuario'),
        correo: Yup.string().required('Ingrese un correo electronico').email('Se requiere correo valido').test("error", 'Debe ingresar un correo valido', (value) => {
            if (value) {
                const dominio = value.split('@')[1];
                return dominio === 'unl.edu.ec' || dominio === 'gmail.com';
            }
            return false;
        }),

    });

    const formOptions = { resolver: yupResolver(validationShema) };
    const { register, handleSubmit, setValue, formState } = useForm(formOptions);
    const { errors } = formState;

    //obtener los datos de las personas por el external
    useEffect(() => {
        peticionGet("persona/obtener/" + external, key).then((info) => {
            if (info.code === 200) {
                setPersona(info.info);
                setObt(true);
            } else if (info.code !== 200 && (info.tag === "token expirado o no valido" || info.tag === "token no valido" || info.tag === "no existe token")) {
                mensajes(info.tag, "Error", "error");
                Cookies.remove("token");
                borrarSesion();
                router.push("/login")
            } else if (info.code !== 200 && info.tag === "Acceso no autorizado") {
                router.push("/principal")
                mensajes(info.tag, "Informacion", "error");
            } else {
                mensajes("No se pudo obtener los datos de la persona", "Error", "error");
            }
        });
    }, [external]);

    //se obtienen los datos del usuario a modificar
    useEffect(() => {

        setValue('nombres', persona.nombres);
        setValue('apellidos', persona.apellidos);
        setValue('telefono', persona.telefono);
        setValue('direccion', persona.direccion);
        setValue('correo', persona.correo);
        setValue('usuario', persona.cuenta?.user);

    }, [persona, setValue]);


    //enviar datos para  modificar
    const sendData = (data) => {

        var datos = {
            'nombres': data.nombres,
            'apellidos': data.apellidos,
            'telefono': data.telefono,
            'direccion': data.direccion,
            'usuario': data.usuario,
            'clave': data.clave,
            'correo': data.correo
        };

        peticionPost('persona/modificar/' + external, datos, key).then((info) => {
            if (info.code === 200) {
                mensajes("Perfil de Usuario modificado correctamente", "Informacion", "success")
                router.push("/modificarPerfil");
            } else if (info.code !== 200 && (info.tag === "token expirado o no valido" || info.tag === "token no valido" || info.tag === "no existe token")) {
                mensajes(info.tag, "Error", "error");
                Cookies.remove("token");
                borrarSesion();
                router.push("/login")
            } else {
                mensajes("El perfil de usuario no se pudo modificar", "Error", "error");
            }
        });
    };

    return (
        <div className="wrapper">
            {/* Fondo con imagen difusa */}
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
    
            {/* Menú */}
            <Menu />
    
            {/* Contenedor principal */}
            <div
                className="d-flex justify-content-center align-items-center"
                style={{
                    position: "relative",
                    minHeight: "calc(100vh - 80px)",  // Ajusta para dejar espacio para el pie de página
                    overflow: "hidden"  // Evita que la capa de opacidad sobresalga
                }}
            >
                <div
                    className="d-flex flex-column"
                    style={{
                        width: "700%",
                        maxWidth: "700px",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)", // Centrado absoluto
                        minHeight: "95%",
                        width: '1000px'
                    }}
                >
                    <h1
                        style={{
                            color: '#205375',
                            textAlign: 'center',
                        }}
                    >
                        Modificar Perfil
                    </h1>
    
                    {/* Formulario */}
                    <div className="container-fluid" style={{
                        backgroundColor: 'white',
                        border: '4px solid #ccc',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        maxWidth: '100%',
                        margin: 'auto'
                    }}>
                        {/* Imagen de perfil */}
                        <div className="container-fluid d-flex justify-content-center">
                            <img
                                className="card"
                                src="https://cdn-icons-png.flaticon.com/512/1511/1511041.png"
                                style={{ width: 90, height: 90 }}
                                alt="Icono de perfil"
                            />
                        </div>
                        <br />
    
                        {/* Formulario de modificación */}
                        <form className="user" onSubmit={handleSubmit(sendData)}>
    
                            {/* Nombres y apellidos */}
                            <div className="row mb-4">
                                <div className="col">
                                    <input
                                        {...register('nombres')}
                                        name="nombres"
                                        id="nombres"
                                        className={`form-control ${errors.nombres ? 'is-invalid' : ''}`}
                                        placeholder="Ingrese los nombres"
                                    />
                                    <div className="alert alert-danger invalid-feedback">{errors.nombres?.message}</div>
                                </div>
                                <div className="col">
                                    <input
                                        {...register('apellidos')}
                                        name="apellidos"
                                        id="apellidos"
                                        className={`form-control ${errors.apellidos ? 'is-invalid' : ''}`}
                                        placeholder="Ingrese los apellidos"
                                    />
                                    <div className="alert alert-danger invalid-feedback">{errors.apellidos?.message}</div>
                                </div>
                            </div>
    
                            {/* Dirección y teléfono */}
                            <div className="row mb-4">
                                <div className="col">
                                    <input
                                        {...register('direccion')}
                                        name="direccion"
                                        id="direccion"
                                        className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
                                        placeholder="Ingrese su dirección"
                                    />
                                    <div className="alert alert-danger invalid-feedback">{errors.direccion?.message}</div>
                                </div>
                                <div className="col">
                                    <input
                                        {...register('telefono')}
                                        name="telefono"
                                        id="telefono"
                                        className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                                        placeholder="Ingrese nro teléfono"
                                    />
                                    <div className="alert alert-danger invalid-feedback">{errors.telefono?.message}</div>
                                </div>
                            </div>
    
                            {/* Clave y usuario */}
                            <div className="row mb-4">
                                <div className="col">
                                    <input
                                        {...register('clave')}
                                        name="clave"
                                        id="clave"
                                        className="form-control"
                                        placeholder="Ingrese una clave"
                                    />
                                </div>
                                <div className="col">
                                    <input
                                        {...register('usuario')}
                                        name="usuario"
                                        id="usuario"
                                        className="form-control"
                                        placeholder="Ingrese un usuario"
                                    />
                                </div>
                            </div>
    
                            {/* Correo */}
                            <div className="row mb-4">
                                <div className="col">
                                    <input
                                        {...register('correo')}
                                        name="correo"
                                        id="correo"
                                        className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
                                        placeholder="Ingrese correo electrónico"
                                    />
                                    <div className="alert alert-danger invalid-feedback">{errors.correo?.message}</div>
                                </div>
                            </div>
    
                            <hr />
    
                            {/* Botones de cancelar y guardar */}
                            <div className="d-flex justify-content-between">
                                <Link href="/modificarPerfil" className="btn btn-danger" style={{ width: '48%' }}>
                                    Cancelar
                                </Link>
                                <button type="submit" className="btn btn-success" style={{ width: '48%' }}>
                                    Guardar
                                </button>
                            </div>
    
                        </form>
                    </div>
                </div>
            </div>
            <br />
            <br />
    
            {/* Pie de página */}
            <Footer />
        </div>
    );
}