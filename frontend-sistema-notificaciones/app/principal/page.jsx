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

    const getRandomColor = () => {
        const colors = ["#FF5733", "#33FF57", "rgba(255, 252, 71, 0.7)", "rgba(71, 255, 209, 0.7)", "rgba(86, 255, 71, 0.7)", "rgba(255, 99, 71, 0.7)",
            "rgba(55, 161, 73, 0.7)", "rgba(145, 255, 163, 0.7)", "rgba(231, 236, 92, 0.7)", "rgba(228, 158, 88, 0.7)", "rgba(254, 104, 104, 0.7)",
            "rgba(55, 138, 161, 0.7)", "rgba(250, 148, 247, 0.7)", "rgba(215, 153, 153, 0.7)"
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    return (
        <div className="row">
            <div className="container-fluid p-1">
                <Menu />
                <br />
                <div className="d-flex flex-column align-items-center">
                    <div className="container">
                        <div className="row">
                            {grupos.length > 0 ? (
                                grupos.map((card, index) => (
                                    <div key={index} className="col-md-4 mb-3">
                                        <div
                                            className="card h-100"
                                            style={{ backgroundColor: getRandomColor(), color: "black" }} // Color aleatorio
                                        >
                                            <div className="card-body">
                                                <h5 className="card-title">{card.nombre}</h5>
                                                <p className="card-text">{card.tipo}</p>
                                                {/* Botón dentro de cada card */}
                                                <button
                                                    className="btn btn-light mt-2"
                                                    onClick={() => alert(`Grupo seleccionado: ${card.nombre}`)}
                                                >
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

                {/* Botón flotante que se queda fijo en la pantalla */}
                <a
                    className="btn btn-primary position-fixed bottom-0 end-0 m-3"
                    style={{
                        width: '80px',   // Tamaño del botón
                        height: '60px',  // Tamaño del botón
                        background: 'linear-gradient(145deg,rgb(105, 236, 206), #0077cc)',
                        zIndex: 10,      // Asegura que el botón esté encima de otros elementos
                    }}
                    href='/grupo'
                >
                    Crear Grupo
                </a>

                <Footer />
            </div>
        </div>
    );
}
