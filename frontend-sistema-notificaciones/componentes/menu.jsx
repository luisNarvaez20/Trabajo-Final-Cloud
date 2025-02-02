'use client'

import { borrarSesion } from "../hooks/SessionUtilClient";
import Cookies from "js-cookie";
import Link from "next/link";

export default function Menu() {

    const salir = () => {
        Cookies.remove("token");
        borrarSesion();
    }

    return (
        <nav className="navbar navbar-expand" style={{ background: 'linear-gradient(135deg, #5f8d99, #003366)' }}>
            <div className="container-fluid">
                <img src="https://siaaf.unl.edu.ec/static/img/logo.png" width={180} alt="logo" />

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auhref mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link active text-white " aria-current="page" href="/principal">Inicio</Link>
                        </li>

                        <>
                            <li className="nav-item">
                                <Link className="nav-link active text-white" aria-current="page" href="/grupo">Grupo</Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link active text-white" aria-current="page" href="/destinatario">Destinatarios</Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link active text-white" aria-current="page" href="/mensaje">Enviar Mensaje</Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link active text-white" aria-current="page" href="/recibir_mensaje">Recibidos</Link>
                            </li>
                        </>

                        <li className="nav-item">
                            <Link className="nav-link active text-white" aria-current="page" href="/login" onClick={salir}>Salir</Link>
                        </li>
                    </ul>
                </div>
                <label className="text-white" style={{ marginRight: 10 }}>Perfil</label>
                <div className="dropdown">
                    <Link href="/modificarPerfil" style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center' }}>
                        <img src="https://th.bing.com/th/id/OIP.6wpt5K1QyNEKWirI8eyQywHaHa?rs=1&pid=ImgDetMain" className="rounded-circle" height="70" />
                    </Link>
                </div>
            </div>
            <br />
            <br />
        </nav>
    );
}
