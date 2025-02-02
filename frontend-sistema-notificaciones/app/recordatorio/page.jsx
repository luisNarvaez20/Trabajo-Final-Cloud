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
    const [recordatorios, setRecordatorios] = useState([]);

    useEffect(() => {
        if (!obt) {
            peticionGet('recordatorio/listar/' + external, token).then((info) => {
                if (info.code === 200) {
                    console.log(info);
                    setRecordatorios(info.info);
                    setObt(true);
                } else if (["token expirado o no valido", "token no valido", "no existe token"].includes(info.tag)) {
                    mensajes(info.tag, "Error", "error");
                    Cookies.remove("token");
                    borrarSesion();
                    router.push("/login");
                } else {
                    mensajes("No se pudo obtener los recordatorios", "Error", info.tag);
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
                    <h1 style={{ color: '#205375', marginTop: '20px' }}>Recordatorios Programados</h1>
                    <div className="col-12 mb-4 text-center">
                        <Link href="/recordatorio/nuevo" className="btn btn-success font-weight-bold" style={{ fontSize: '25px' }}>Registrar</Link>
                    </div>
                    <div className="col-10" style={{ marginLeft: '20px', marginRight: '20px' }}>
                        <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            <table className="table table-bordered" style={{ fontSize: '15px', borderColor: "ActiveBorder", width: '100%' }}>
                                <thead className="table-active" style={{ backgroundColor: '#205375', color: 'white', fontSize: '20px' }}>
                                    <tr>
                                        <th style={{ width: '10%' }}>id</th>
                                        <th style={{ width: '20%' }}>Nombre</th>
                                        <th style={{ width: '20%' }}>Grupo</th>
                                        <th style={{ width: '20%' }}>Fecha Programada</th>
                                        <th style={{ width: '20%' }}>Hora Programada</th>
                                        <th style={{ width: '15%' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recordatorios.length > 0 ? (
                                        recordatorios.map((dato, index) => (
                                            <tr key={index}>
                                                <th scope="row">{index + 1}</th>
                                                <td style={{ fontSize: '15px' }}>{dato.nombre}</td>
                                                <td style={{ fontSize: '15px' }}>{dato.grupo.nombre}</td>
                                                <td style={{ fontSize: '15px' }}>
                                                    {new Date(dato.fecha).toLocaleDateString()}
                                                </td>
                                                <td style={{ fontSize: '15px' }}>
                                                    {/* Verifica si la hora es válida antes de mostrarla */}
                                                    {dato.hora}
                                                </td>
                                                <td style={{ fontSize: '15px' }}>
                                                    {dato.estado.toString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted">No existen Recordatorios aún</td>
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
