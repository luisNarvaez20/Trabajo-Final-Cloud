'use client'

import Menu from '../../componentes/menu';
import Footer from '../../componentes/footer';
import { borrarSesion, getExternal, getToken } from '../../hooks/SessionUtilClient';
import { useState, useEffect } from 'react';
import mensajes from '../../componentes/Mensajes';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { peticionGet } from '../../hooks/Conexion';

export default function Principal() {
    const key = getToken();
    const router = useRouter();
    const [grupos, setGrupos] = useState([]);
    const external = getExternal();

    useEffect(() => {
        peticionGet(`grupo/listar/${external}`, key).then((info) => {
            if (info.code === 200) {
                setGrupos(info.info);
            } else if (["token expirado o no valido", "token no valido", "no existe token"].includes(info.tag)) {
                mensajes(info.tag, "Error", "error");
                Cookies.remove("token");
                borrarSesion();
                router.push("/login");
            } else {
                mensajes("No se pudo Listar los Grupos", "Error", "error");
            }
        });
    }, [external, key, router]);

    return (
        <div className="d-flex flex-column min-vh-100 position-relative">
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

            {/* Contenido */}
            <div className="container-fluid p-1 position-relative" style={{ zIndex: "1" }}>
                <Menu />
                <br />
                <div className="d-flex flex-column align-items-center flex-grow-1">
                    <div className="container">
                        <div className="row">
                            {grupos.length > 0 ? (
                                grupos.map((card, index) => (
                                    <div key={index} className="col-md-4 mb-3">
                                        <div className="card h-100" style={{ backgroundColor: "rgba(255,255,255,0.8)", color: "black" }}>
                                            <div className="card-body">
                                                <h5 className="card-title">Grupo: {card.nombre}</h5>
                                                <p className="card-text">Tipo: {card.tipo}</p>
                                                <button className="btn btn-light mt-2" onClick={() => alert(`Grupo seleccionado: ${card.nombre}`)} style={{ backgroundColor: 'turquoise' }}>
                                                    Ver Detalles
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-12 text-center mt-5">
                                    <h3 className="text-muted">No existen grupos aún</h3>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Botón flotante que se queda fijo en la pantalla */}
            <a
                className="btn btn-primary position-fixed bottom-0 end-0 m-4"
                style={{
                    width: '110px',   // Tamaño del botón
                    height: '60px',  // Tamaño del botón
                    background: 'linear-gradient(140deg,rgb(105, 236, 206), #0077cc)',
                    zIndex: 10,      // Asegura que el botón esté encima de otros elementos
    
                }}
                href='/grupo'
            >
                Crear Grupo
            </a>

            {/* Footer siempre abajo */}
            <Footer className="mt-auto position-relative" style={{ zIndex: "1" }} />
        </div>
    );
}
