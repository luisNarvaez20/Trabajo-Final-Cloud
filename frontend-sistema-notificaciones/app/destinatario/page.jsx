'use client';
import Link from "next/link";
import Menu from "../../componentes/menu";
import mensajes from "../../componentes/Mensajes";
import { useRouter } from 'next/navigation';
import { peticionPost, peticionGet } from "../../hooks/Conexion";
import { useState, useEffect } from "react";
import { borrarSesion, getExternal, getToken } from "../../hooks/SessionUtilClient";

export default function Page() {
    const token = getToken();
    const router = useRouter();

    const [obt, setObt] = useState(false);
    const [destinatario, setDestinatario] = useState([]);

    useEffect(() => {
        if (!obt) {
            peticionGet('destinatario/listar', token).then((info) => {
                if (info.code === 200) {
                    // Filtrar las personas cuya cuenta esté activa (estado = true)
                    console.log(info.datos)
                    setDestinatario(info.datos);
                    setObt(true);
                } else {
                    mensajes("Error al listar sensores", "Error", "error");
                }
            });
        }
    }, [obt]);

    return (
        <div className="row">
            <Menu></Menu>
         <div className="container">
            <div className="d-flex flex-column align-items-center">
                <h1 style={{ color: '#205375', marginTop: '20px' }}>Destinatarios Registrados</h1>
                <div className="col-12 mb-4 text-center">
                    <Link href="/destinatario/guardar" className="btn btn-success font-weight-bold" style={{ fontSize: '25px' }}>Registrar</Link>
                </div>
                <div className="col-12">
                    <table className="table table-bordered" style={{ borderColor: "ActiveBorder", fontSize: '25px', width: '100%' }}>
                        <thead className="table-active">
                            <tr>
                                <th>id</th>
                                <th>Nombres</th>
                                <th>Apellidos</th>
                                <th>Correo</th>
                                <th>Administrar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {destinatario.map((dato, index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{dato.nombres}</td>
                                    <td>{dato.apellidos}</td>
                                    <td>{dato.correo}</td>
                                    <td>
                                        <Link href={`/destinatario/editar/${dato.id}`} className="btn btn-warning font-weight-bold" style={{ marginRight: '15px', fontSize: '20px' }}>Editar</Link>
                                        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                            <div className="modal-dialog">
                                                <div className="modal-content">
                                                    <div className="modal-header">
                                                        <h5 className="modal-title" id="exampleModalLabel">Confirmacion</h5>
                                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                    </div>
                                                    <div className="modal-body">
                                                        Estas seguro que quieres bajar esta mota?
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </div>
    );
}
