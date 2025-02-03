'use client';
import Link from "next/link";
import Menu from "../../componentes/menu";
import Footer from "../../componentes/footer";
import mensajes from "../../componentes/Mensajes";
import { useRouter } from 'next/navigation';
import { peticionPost, peticionGet } from "../../hooks/Conexion";
import Cookies from 'js-cookie';
import { useState, useEffect } from "react";
import { borrarSesion, getExternal, getToken } from "../../hooks/SessionUtilClient";

export default function Page() {
    const token = getToken();
    const router = useRouter();
    const external = getExternal();

    const [obt, setObt] = useState(false);
    const [destinatario, setDestinatario] = useState([]);

    useEffect(() => {
        if (!obt) {
            peticionGet('destinatario/listar_user/'+external, token).then((info) => {
                if (info.code === 200) {
                    console.log(info);
                    setDestinatario(info.info);
                    setObt(true);
                } else if (["token expirado o no valido", "token no valido", "no existe token"].includes(info.tag)) {
                    mensajes(info.tag, "Error", "error");
                    Cookies.remove("token");
                    borrarSesion();
                    router.push("/login");
                } else {
                    mensajes("No se pudo obtener los destinatarios", "Error", "error");
                }
            });
        }
    }, [obt]);

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
            <Menu />
            <div className="container mt-1">
                <div className="d-flex flex-column align-items-center">
                    <h1 style={{ color: '#205375', marginTop: '20px' }}>Destinatarios Registrados</h1>
                    <div className="col-12 mb-4 text-center">
                        <Link href="/destinatario/guardar" className="btn btn-success font-weight-bold" style={{ fontSize: '25px' }}>Registrar</Link>
                    </div>
                    <div className="col-10" style={{ marginLeft: '20px', marginRight: '20px' }}>
                        <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            <table className="table table-bordered" style={{ fontSize: '15px', borderColor: "ActiveBorder", width: '100%' }}>
                                <thead className="table-active" style={{ backgroundColor: '#205375', color: 'white', fontSize: '20px' }}>
                                    <tr>
                                        <th>id</th>
                                        <th>Nombres</th>
                                        <th>Apellidos</th>
                                        <th>Correo</th>
                                        <th>Grupo</th>
                                        <th>Administrar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {destinatario.length > 0 ? (
                                        destinatario.map((dato, index) => (
                                            <tr key={index}>
                                                <th scope="row">{index + 1}</th>
                                                <td>{dato.nombres}</td>
                                                <td>{dato.apellidos}</td>
                                                <td>{dato.correo}</td>
                                                <td>{dato.grupo.nombre}</td>
                                                <td>
                                                    <Link href={`/destinatario/editar/${dato.id}`} className="btn btn-warning font-weight-bold" style={{ marginRight: '15px', fontSize: '20px' }}>Editar</Link>
                                                    <button
                                                        className="btn btn-danger font-weight-bold"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#exampleModal"
                                                        style={{ fontSize: '20px' }}
                                                    >
                                                        Eliminar
                                                    </button>
                                                    {/* Modal de confirmación */}
                                                    <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                                        <div className="modal-dialog">
                                                            <div className="modal-content">
                                                                <div className="modal-header">
                                                                    <h5 className="modal-title" id="exampleModalLabel">Confirmación</h5>
                                                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                                </div>
                                                                <div className="modal-body">
                                                                    ¿Estás seguro de que quieres eliminar este destinatario?
                                                                </div>
                                                                <div className="modal-footer">
                                                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                                                    <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => handleBaja(dato.id)}>Confirmar</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted">No existen destinatarios aún</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Footer className="mt-auto position-relative" style={{ zIndex: "1" }} />
        </div>
    );
}
