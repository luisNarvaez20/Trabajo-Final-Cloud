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
            <div className="container-fluid p-1">
                <Menu />
                <div
                    className="d-flex justify-content-center align-items-center vh-100"
                    style={{
                        position: "relative",
                        overflow: "hidden" // Evita que la capa de opacidad sobresalga
                    }}
                >
                    <div
                        className="d-flex flex-column"
                        style={{
                            width: "700px",
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)", // Centrado absoluto
                            minHeight: "95%",
                            width: '1000px' // Asegura que no se reduzca la altura del formulario
                        }}
                    >
                        <h1 className="text-center" style={{ fontSize: "3em", color: '#205375' }}>Crear Grupo</h1>

                        <div className='container-fluid' style={{ backgroundColor: 'white', border: '4px solid #ccc', padding: '20px', borderRadius: '10px', maxWidth: '1000px' }}>
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
                                        <input {...register('nombre')} type="text" name="nombre" id="nombre" className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} placeholder='Ingrese el nombre del grupo' autoComplete="off" style={{ fontSize: '25px' }}/>
                                        <label className="form-label" style={{ color: '#1b4f72' }}>Nombre</label>
                                        <div className='alert alert-danger invalid-feedback'>{errors.nombre?.message}</div>
                                    </div>
                                    <div className="col">
                                        <input {...register('tipo')} type="text" name="tipo" id="tipo" className={`form-control ${errors.tipo ? 'is-invalid' : ''}`} placeholder='Ingrese el tipo de grupo' autoComplete="off" style={{ fontSize: '25px' }}/>
                                        <label className="form-label" style={{ color: '#1b4f72' }}>Tipo</label>
                                        <div className='alert alert-danger invalid-feedback'>{errors.tipo?.message}</div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <a href="/principal" className="btn btn-danger" style={{ marginLeft: '300px' , fontSize:'22px' }}>
                                        Cancelar
                                    </a>
                                    <button type='submit' className="btn btn-success" style={{ marginRight: '300px', fontSize:'22px' }}>
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
