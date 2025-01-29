'use client';
import mensajes from "../../componentes/Mensajes";
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { peticionPost } from "../../hooks/Conexion";
import { borrarSesion, getToken } from "../../hooks/SessionUtilClient";


export default function Page() {

    const router = useRouter();
    const key = getToken();



    const validationShema = Yup.object().shape({
        nombres: Yup.string().required('Ingrese sus nombres'),
        apellidos: Yup.string().required('ingrese sus apellidos'),
        direccion: Yup.string().required('ingrese su direccion'),
        telefono: Yup.string().required('ingrese un telefono').matches(/^[0-9]+$/, 'Ingrese solo números'),
        correo: Yup.string().required('Ingrese un correo electronico').email('Se requiere correo valido').test("error", 'Debe ingresar un correo valido', (value) => {
            if (value) {
                const dominio = value.split('@')[1];
                return dominio === 'unl.edu.ec' || dominio === 'gmail.com';
            }
            return false;
        }),
        user: Yup.string().required('ingrese su usuario'),
        clave: Yup.string().required('ingrese su clave')
    });

    const formOptions = { resolver: yupResolver(validationShema) };
    const { register, handleSubmit, formState } = useForm(formOptions);
    const { errors } = formState;


    //Metodo para guard
    const sendData = (data) => {

        var datos = {
            'nombres': data.nombres,
            'apellidos': data.apellidos,
            'telefono': data.telefono,
            'correo': data.correo,
            'direccion': data.direccion,
            'user': data.user,
            'clave': data.clave,
        };

        peticionPost('persona/registrar', datos, "").then((info) => {
            if (info.code === 200) {
                mensajes("usuario guardado correctamente", "Informacion", "success")
                router.push("/login");
            } else if (info.code !== 200 && (info.tag === "token expirado o no valido" || info.tag === "token no valido" || info.tag === "no existe token")) {
                mensajes(info.tag, "Error", "error");
                Cookies.remove("token");
                borrarSesion();
                router.push("/login")
            } else {
                mensajes("Usuario no se pudo guardar", "Error", info.msg )
            }
        });
    };


    return (

        <div className="row d-flex justify-content-center align-items-center vh-100 position-relative"
            style={{
                position: "relative",
                overflow: "hidden" // Evita que la capa de opacidad sobresalga
            }}>

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

            <div className="d-flex flex-column" style={{ width: 700 }}>
                <h1 className="text-center" style={{ fontSize: "3em", color: 'white' }}>Registrar Usuario</h1>

                <div className='container-fluid' style={{ border: '4px solid #ccc', padding: '20px', borderRadius: '10px', maxWidth: '1000px' }}>
                    <div className="container-fluid d-flex justify-content-center align-items-center">
                        <img className="card"
                            src="https://th.bing.com/th/id/R.df3dbd67f8dcf1445d1c96a1cde6d018?rik=n3nZYmTtZjAiyQ&pid=ImgRaw&r=0"
                            style={{ width: 100, height: 100 }}
                        />
                    </div>
                    <br />
                    <form className="user" onSubmit={handleSubmit(sendData)}>
                        <div className="row mb-4">
                            <div className="col">
                                <input {...register('nombres')} type="text" name="nombres" id="nombres" className={`form-control ${errors.nombres ? 'is-invalid' : ''}`} placeholder='Ingrese los nombres' />
                                <div className='alert alert-danger invalid-feedback'>{errors.nombres?.message}</div>
                            </div>
                            <div className="col">
                                <input {...register('apellidos')} type="text" name="apellidos" id="apellidos" className={`form-control ${errors.apellidos ? 'is-invalid' : ''}`} placeholder='Ingrese los apellidos' />
                                <div className='alert alert-danger invalid-feedback'>{errors.apellidos?.message}</div>
                            </div>
                        </div>

                        <div className="row mb-4">
                            <div className="col">
                                <input {...register('direccion')} name="direccion" type="text" id="direccion" className={`form-control ${errors.direccion ? 'is-invalid' : ''}`} placeholder='Ingrese direccion' />
                                <div className='alert alert-danger invalid-feedback'>{errors.direccion?.message}</div>
                            </div>
                            <div className="col">
                                <input {...register('telefono')} name="telefono" type="number" id="telefono" className={`form-control ${errors.telefono ? 'is-invalid' : ''}`} placeholder='Ingrese nro telefono' />
                                <div className='alert alert-danger invalid-feedback'>{errors.telefono?.message}</div>
                            </div>
                        </div>

                        <div className="row mb-4">
                            <div className="col">
                                <input {...register('correo')} name="correo" id="correo" className={`form-control ${errors.correo ? 'is-invalid' : ''}`} placeholder='Ingrese correo electronico' />
                                <div className='alert alert-danger invalid-feedback'>{errors.correo?.message}</div>
                            </div>
                        </div>

                        <div className="row mb-4">
                            <div className="col">
                                <input {...register('user')} name="user" id="user" className={`form-control ${errors.user ? 'is-invalid' : ''}`} placeholder='Ingrese un usuario' />
                                <div className='alert alert-danger invalid-feedback'>{errors.user?.message}</div>
                            </div>
                            <div className="col">
                                <input {...register('clave')}  type="password" name="clave" id="clave" className={`form-control ${errors.clave ? 'is-invalid' : ''}`} placeholder='Ingrese una clave' />
                                <div className='alert alert-danger invalid-feedback'>{errors.clave?.message}</div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between">
                            <a href="/login" className="btn btn-danger" style={{ marginLeft: '200px' }}>
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

    );
}
