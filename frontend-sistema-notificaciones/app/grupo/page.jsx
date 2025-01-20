'use client';
import mensajes from "../../componentes/Mensajes";
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { peticionPost } from "../../hooks/Conexion";
import { borrarSesion, getExternal, getToken } from "../../hooks/SessionUtilClient";
import Footer from "../../componentes/footer";
import Menu from "../../componentes/menu";


export default function Page() {

    const router = useRouter();
    const key = getToken();
    const external = getExternal();



    const validationShema = Yup.object().shape({
        nombre: Yup.string().required('Ingrese un nombre'),
        tipo: Yup.string().required('ingrese el tipo'),
    });

    const formOptions = { resolver: yupResolver(validationShema) };
    const { register, handleSubmit, formState } = useForm(formOptions);
    const { errors } = formState;


    //Metodo para guardar grupo
    const sendData = (data) => {

        var datos = {
            'nombre': data.nombre,
            'tipo': data.tipo,
            'external': external
        };

        peticionPost('grupo/guardar', datos, key).then((info) => {
            if (info.code === 200) {
                mensajes("Grupo creado correctamente", "Informacion", "success")
                router.push("/principal");
            } else if (info.code !== 200 && (info.tag === "token expirado o no valido" || info.tag === "token no valido" || info.tag === "no existe token")) {
                mensajes(info.tag, "Error", "error");
                Cookies.remove("token");
                borrarSesion();
                router.push("/login")
            } else if (info.code !== 200 && info.tag === "Acceso no autorizado") {
                router.push("/login")
                mensajes(info.tag, "Informacion", "error");
            } else {
                mensajes(info.msg, "Error", "error")
            }
        });
    };


    return (
        <div className="row" >
            <div className="container-fluid p-1" >
                <Menu />
                <div className="row d-flex justify-content-center align-items-center vh-100 position-relative"
                    style={{
                        position: "relative",
                        overflow: "hidden" // Evita que la capa de opacidad sobresalga
                    }}>

                    <div style={{
                        position: "absolute",
                        top: 0, left: 0, width: "100%", height: "100%",
                        backgroundImage: "url('https://th.bing.com/th/id/OIP.tGRghsct0RxTiJdW8vKZxgHaEo?rs=1&pid=ImgDetMain')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "brightness(50%)", // Reduce el brillo para dar opacidad
                        zIndex: -1 // Lo coloca detrás de todo
                    }}></div>

                    <div className="d-flex flex-column" style={{ width: 700 }}>
                        <h1 className="text-center" style={{ fontSize: "3em", color: 'white' }}>Crear Grupo</h1>

                        <div className='container-fluid' style={{ border: '4px solid #ccc', padding: '20px', borderRadius: '10px', maxWidth: '1000px' }}>
                            <div className="container-fluid d-flex justify-content-center align-items-center">
                                <img className="card"
                                    src="https://th.bing.com/th/id/R.7ba16062579981d6c084fe578f5538b5?rik=W%2bWfQ4LK4WoHFg&pid=ImgRaw&r=0"
                                    style={{ width: 100, height: 100 }}
                                />
                            </div>
                            <br />
                            <form className="user" onSubmit={handleSubmit(sendData)}>
                                <div className="row mb-4">
                                    <div className="col">
                                        <input {...register('nombre')} type="text" name="nombre" id="nombre" className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} placeholder='Ingrese el nombre' />
                                        <div className='alert alert-danger invalid-feedback'>{errors.nombre?.message}</div>
                                    </div>
                                    <div className="col">
                                        <input {...register('tipo')} type="text" name="tipo" id="tipo" className={`form-control ${errors.tipo ? 'is-invalid' : ''}`} placeholder='Ingrese el tipo de grupo' />
                                        <div className='alert alert-danger invalid-feedback'>{errors.tipo?.message}</div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <a href="/principal" className="btn btn-danger" style={{ marginLeft: '200px' }}>
                                        Cancelar
                                    </a>
                                    <button type='submit' className="btn btn-success" style={{ marginRight: '200px' }}>
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>

    );
}
