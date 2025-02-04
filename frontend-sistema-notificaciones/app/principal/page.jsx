'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { FaUsers, FaUser, FaHistory } from 'react-icons/fa';
import Menu from '../../componentes/menu';
import Footer from '../../componentes/footer';
import mensajes from '../../componentes/Mensajes';
import { borrarSesion, getExternal, getToken } from '../../hooks/SessionUtilClient';
import { peticionGet } from '../../hooks/Conexion';
import { Modal, Button } from 'react-bootstrap';

export default function Principal() {
    const key = getToken();
    const router = useRouter();
    const [grupos, setGrupos] = useState([]);
    const external = getExternal();
    const [showModal, setShowModal] = useState(false);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
    const [grupoSeleccionado2, setGrupoSeleccionado2] = useState(null);
    const [obt, setObt] = useState(false);

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

    const abrirModal = async (grupo) => {
        try {
            const info = await peticionGet(`destinatario/listar_grupo/${grupo.external_id}`, key);

            if (info.code !== 200) {
                manejarError(info.msg);
                return;
            }

            setGrupoSeleccionado(info.datos);

            const info2 = await peticionGet(`mensaje/listar/${grupo.external_id}`, key);

            if (info2.code !== 200) {
                mensajes("No se pudo obtener los mensajes", "Error", "error");
                return;
            }

            setGrupoSeleccionado2(info2.info);
            setShowModal(true);
            setObt(true);
        } catch (error) {
            console.error("Error al abrir el modal:", error);
            mensajes("Ocurrió un error inesperado", "Error", error);
        }
    };

    const manejarError = (tag) => {
        const erroresToken = ["token expirado o no valido", "token no valido", "no existe token"];

        if (erroresToken.includes(tag)) {
            mensajes(tag, "Error", "error");
            Cookies.remove("token");
            borrarSesion();
            router.push("/login");
        } else {
            mensajes(tag, "Error", 'error');
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100 position-relative">
            <div className="container-fluid p-1 position-relative">
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
                                                <button className="btn btn-light mt-2" onClick={() => abrirModal(card)} style={{ backgroundColor: 'turquoise' }}>
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

             {/* Modal de detalles */}
             <Modal show={showModal} onHide={() => setShowModal(false)} >
                <Modal.Header closeButton>
                    <Modal.Title>Detalles del Grupo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                            <strong>Destinatarios:</strong>
                        </p>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '10px', textAlign: 'left' }}>
                            {grupoSeleccionado?.length > 0 ? (
                                grupoSeleccionado.map((grupo, index) => (
                                    <p key={index} className="mb-4">
                                        <strong>Nombres:</strong> {grupo.nombres} {grupo.apellidos} {' '}
                                        <strong>Correo:</strong> {grupo.correo}
                                    </p>
                                ))
                            ) : (
                                <p>No hay destinatarios disponibles.</p>
                            )}
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                            <strong>Historial   Mensajes:</strong>
                        </p>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '10px', textAlign: 'left' }}>
                            {grupoSeleccionado2?.length > 0 ? (
                                grupoSeleccionado2.map((mej, index) => (
                                    <p key={index} className="mb-4">
                                        <strong>Asunto:</strong> {mej.asunto} {' '}
                                        <strong>Contenido:</strong> {mej.contenido} {' '}
                                        <strong>Fecha:</strong> {mej.fecha}
                                    </p>
                                ))
                            ) : (
                                <p>No hay mensajes disponibles.</p>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
                </Modal.Footer>
            </Modal>




            {/* Botón flotante */}
            <a className="btn btn-primary position-fixed bottom-0 end-0 m-4"
                style={{ width: '110px', height: '60px', background: 'linear-gradient(140deg,rgb(105, 236, 206), #0077cc)', zIndex: 10 }}
                href='/grupo'
            >
                Crear Grupo
            </a>

            <Footer className="mt-auto position-relative" />
        </div>
    );
}
