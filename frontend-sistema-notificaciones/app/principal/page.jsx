'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Menu from '../../componentes/menu';
import Footer from '../../componentes/footer';
import { borrarSesion, getExternal, getToken } from '../../hooks/SessionUtilClient';
import { peticionGet, peticionPost } from '../../hooks/Conexion';
import '@react-pdf-viewer/core/lib/styles/index.css';
import mensajes from '../../componentes/Mensajes';

export default function Principal() {
    const key = getToken();
    const router = useRouter();
    const [mensaj, setMensaj] = useState([]);
    const external = getExternal();
    const [filtro, setFiltro] = useState('');




    useEffect(() => {
        peticionGet("mensaje/listar/", key).then((info) => {
            console.log(info)
            if (info.code === 200) {
                setMensaj(info.datos);
            } else if (["token expirado o no valido", "token no valido", "no existe token"].includes(info.tag)) {
                mensajes(info.msg, "Error", "error");
                Cookies.remove("token");
                borrarSesion();
                router.push("/login");
            } else {
                mensajes("No se pudo Listar los mensajes", "Error", "error");
            }
        });
    }, [external, key, router]);

    const manejarCambio = (event) => {
        const valorSeleccionado = event.target.value;
        setFiltro(valorSeleccionado);  // Actualiza el estado con el valor seleccionado
        ejecutarMetodo(valorSeleccionado);  // Ejecuta el método con el valor seleccionado
    };

    const ejecutarMetodo = (valor) => {
        console.log("Método ejecutado con valor: ", valor);

        peticionGet("mensaje/listar/" + valor, key).then((info) => {

            if (info.code === 200) {
                setMensaj(info.datos);
            } else if (["token expirado o no valido", "token no valido", "no existe token"].includes(info.tag)) {
                mensajes(info.msg, "Error", "error");
                Cookies.remove("token");
                borrarSesion();
                router.push("/login");
            } else {
                mensajes("No se pudo Listar los mensajes", "Error", "error");
            }
        });
    };

    const handleClickRechazar = (data) => {


        const datos = {
            'remitente': data,
        };

        peticionPost("mensaje/rechazar/", datos, key).then((info) => {
            if (info.code === 200) {
                mensajes(info.msg, "Success", "mensaje enviado");
            } else if (["token expirado o no valido", "token no valido", "no existe token"].includes(info.tag)) {
                mensajes(info.msg, "Error", "error");
                Cookies.remove("token");
                borrarSesion();
                router.push("/login");
            } else {
                mensajes("No se pudo enviar el mensaje", "Error", "error");
            }
        });
    };

    return (
        <div className="d-flex flex-column min-vh-100 position-relative">
            <div className="container-fluid p-1 position-relative">
                <Menu />
                <br />
                <div style={{ textAlign: 'center' }}>
                    <h1>Mensajes Recibidos</h1>

                </div>
                <br />
                <div className="input-group">
                    <label htmlFor="" style={{ width: '150px', marginLeft: '200px' }}>Filtrar mensajes Recibidos: </label>
                    <select
                        className="form-control"
                        id="filtroBusqueda"
                        onChange={manejarCambio}
                        style={{
                            backgroundColor: '#F2F6F5',
                            color: '#333',
                            borderRadius: '8px',  // Bordes redondeados
                            border: "1px solid #000000",  // Borde delgado
                            marginRight: '200px',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',  // Sombra para relieve
                            transition: 'box-shadow 0.3s ease, border 0.3s ease',  // Transición suave
                        }}
                        aria-describedby="button-addon2"
                    >
                        <option value="">TODOS</option>
                        <option value="informe">INFORMES</option>
                        <option value="curriculums">CURRICULUMS</option>
                        <option value="solicitud">SOLICITUDES</option>
                        <option value="otro">OTROS</option>
                    </select>
                </div>
                <br />
                <div className="d-flex flex-column align-items-center flex-grow-1">
                    <table
                        className="table table-bordered table-hover"
                        style={{
                            fontSize: '15px',
                            borderColor: 'ActiveBorder',
                            width: '100%',
                            borderRadius: '10px',
                            overflow: 'hidden', // Para que las esquinas redondeadas se vean bien
                        }}
                    >
                        <thead
                            className="table-active"
                            style={{
                                backgroundColor: '#205375',
                                color: 'white',
                                fontSize: '20px',
                                textAlign: 'center',
                                borderRadius: '10px 10px 0 0', // Bordes redondeados en el encabezado
                            }}
                        >
                            <tr>
                                <th>Remitente</th>
                                <th>Categoria</th>
                                <th>Asunto</th>
                                <th>Resumen</th>
                                <th>Archivo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mensaj.length > 0 ? (
                                mensaj.map((dato, index) => (
                                    <tr
                                        key={index}
                                        style={{
                                            backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                            transition: 'background-color 0.3s',
                                        }}
                                    >

                                        <td>{dato.remitente}</td>
                                        <td>{dato.tipo}</td>
                                        <td>{dato.asunto}</td>
                                        <td>{dato.resumen}</td>

                                        <td>{ }</td>




                                        <td style={{ textAlign: 'center' }}>

                                            <a
                                                href={`/mensaje/nuevo/${dato.remitente}`} // La ruta a la que quieres redirigir
                                                className="btn btn-success font-weight-bold"
                                                style={{
                                                    fontSize: '16px',
                                                    borderRadius: '5px',
                                                    padding: '8px 15px',
                                                    display: 'inline-block', // Para que el enlace se vea como un botón
                                                    textDecoration: 'none', // Eliminar subrayado
                            
                                                }}
                                            >
                                                Responder
                                            </a>
                                            <br />
                                            <button
                                                className="btn btn-danger font-weight-bold"
                                                onClick={() => handleClickRechazar(dato.remitente)}
                                                style={{
                                                    fontSize: '16px',
                                                    borderRadius: '5px',
                                                    padding: '8px 15px',
                                                }}
                                            >
                                                Rechazar
                                            </button>

                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted">
                                        Sin mensajes aún
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                </div>
            </div>
            <Footer className="mt-auto position-relative" />
        </div>
    );
}
