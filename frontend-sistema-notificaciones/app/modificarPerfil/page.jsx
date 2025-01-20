'use client';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { borrarSesion, getToken, getExternal } from '../../hooks/SessionUtilClient';
import Menu from '../../componentes/menu';
import Footer from '../../componentes/footer';
import Cookies from "js-cookie";
import { peticionGet } from "../../hooks/Conexion";
import mensajes from '../../componentes/Mensajes.js';
import { useState, useEffect } from "react";

export default function Page() {

    const key = getToken();
    const external = getExternal();

    const [persona, setPersona] = useState([]);
    const router = useRouter();

    useEffect(() => {
        if (!external) return; // Evitar ejecutar la petición si `external` no está definido

        const obtenerDatos = async () => {
            try {
                const info = await peticionGet(`persona/obtener/${external}`, key);

                if (info.code === 200) {
                    setPersona(info.info);
                } else if (["token expirado o no valido", "token no valido", "no existe token"].includes(info.tag)) {
                    mensajes(info.tag, "Error", "error");
                    Cookies.remove("token");
                    borrarSesion();
                    router.push("/login");
                } else {
                    mensajes("No se pudo obtener los datos del perfil", "Error", "error");
                }
            } catch (error) {
                console.error("Error al obtener datos:", error);
            }
        };

        obtenerDatos();
    }, [external]); // Solo se ejecuta cuando `external` cambia



    return (
        <div className="row" >
            <Menu />
            <center>
                <div className="container py-5 h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col col-lg-9 mb-5 mb-lg-0">
                            <div className="card mb-3" style={{ borderRadius: ".5rem" }}>
                                <div className="row g-0">
                                    <div className="col-md-4 gradient-custom text-center text-white"
                                        style={{ border: '0.5rem', borderBottomLeftRadius: '0.5rem', background: `linear-gradient(to right bottom, rgba(174, 214, 241 ), rgba(253, 160, 133, 1))` }}>
                                        <img src="https://th.bing.com/th/id/R.013f4a5d17ae938ce0107809b348c9f9?rik=nyHZlcm9FRIydA&pid=ImgRaw&r=0"
                                            alt="Avatar" className="img-fluid my-5" style={{ width: "80px" }} />
                                        <h5>{persona.nombres + " " + persona.apellidos}</h5>
                                        <i className="far fa-edit mb-5"></i>
                                        <Link href={`/usuario/modificar/${external}`}>
                                            <img src="https://th.bing.com/th/id/OIP.tE1VUA_9MtGQUsxawr-HxQHaHa?rs=1&pid=ImgDetMain" style={{ width: "40px" }} />
                                        </Link>
                                    </div>
                                    <div className="col-md-8 " style={{ background: `linear-gradient(to right bottom, rgba(253, 254, 254 ), rgba(235, 245, 251))` }}>
                                        <div className="card-body p-4">
                                            <h6>Informacion Completa</h6>
                                            <hr className="mt-0 mb-4" />
                                            <div className="row pt-1">
                                                <div className="col-6 mb-3">
                                                    <h6>Nombres</h6>
                                                    <p className="text-muted">{persona.nombres}</p>
                                                </div>
                                                <div className="col-6 mb-3">
                                                    <h6>Apellidos</h6>
                                                    <p className="text-muted">{persona.apellidos}</p>
                                                </div>
                                            </div>
                                            <div className="row pt-1">
                                                <div className="col-6 mb-3">
                                                    <h6>Telefono</h6>
                                                    <p className="text-muted">{persona.telefono}</p>
                                                </div>
                                                <div className="col-6 mb-3">
                                                    <h6>Direccion</h6>
                                                    <p className="text-muted">{persona.direccion}</p>
                                                </div>
                                                <div className="row pt-1">
                                                    <div className="col-6 mb-3">
                                                        <h6>Email</h6>
                                                        <p className="text-muted">{persona.correo}</p>
                                                    </div>
                                                    <div className="col-6 mb-3">
                                                        <h6>Estado Cuenta</h6>
                                                        <p className="text-muted">{persona.cuenta?.estado === true ? 'Activo' : 'Inactivo'} </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </center>
            <br />
            <Footer />
        </div>

    );

}

