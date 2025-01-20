"use client";
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form';
import { inicio_sesion } from '../../hooks/Autenticacion';
import mensajes from '../../componentes/Mensajes';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { estaSesion } from '../../hooks/SessionUtil';

export default function Login() {

    //router
    const router = useRouter();

    //validaciones
    const validationShema = Yup.object().shape({
        correo: Yup.string().required('Ingrese el usuario registrado'),
        clave: Yup.string().required('ingrese su contraseña')
    });

    const formOptions = { resolver: yupResolver(validationShema) };
    const { register, handleSubmit, formState } = useForm(formOptions);
    const { errors } = formState;

    const sendData = (data) => {
        var data = { "user": data.correo, "clave": data.clave };

        inicio_sesion(data).then((info) => {
            if (!estaSesion()) {
                mensajes("Error en inicio de sesion", info.tag, "error")
            } else {
                //console.log(info);
                mensajes("Has Ingresado al Sistema", "Bienvenido Usuario", "success");
                Cookies.set("token", true);
                router.push("/principal");
            }
        })
    };

    return (
        <div className="container-fluid">
            <br />
            <div style={{ border: '4px solid #ccc', padding: '20px', borderRadius: '10px', maxWidth: '1000px', margin: 'auto' }}>
                <section className="vh-60">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6 text-black">
                                <div className="px-5 ms-xl-4">
                                    <i className="fas fa-crow fa-2x me-3 pt-5 mt-xl-4" style={{ color: '#709085' }}></i>
                                    <img src="https://siaaf.unl.edu.ec/static/img/logo.png" width={280} alt="logo" />
                                </div>

                                <div className="d-flex align-items-center h-custom-2 px-5 ms-xl-4 mt-5 pt-5 pt-xl-0 mt-xl-n5">
                                    <form onSubmit={handleSubmit(sendData)} style={{ width: '23rem' }}>
                                        <h3 className="fw-normal mb-3 pb-3" style={{ letterSpacing: '1px' }}>Iniciar Sesión</h3>

                                        <div className="form-outline mb-4">
                                            <input type='text' {...register('correo')} name="correo" id="correo" className={`form-control form-control-lg ${errors.correo ? 'is-invalid' : ''}`} />
                                            <label className="form-label" htmlFor="form2Example18">Usuario</label>
                                            <div className='alert alert-danger invalid-feedback'>{errors.correo?.message}</div>
                                        </div>

                                        <div className="form-outline mb-4">
                                            <input type="password" {...register('clave')} name="clave" id="clave" className={`form-control form-control-lg ${errors.clave ? 'is-invalid' : ''}`} />
                                            <label className="form-label" htmlFor="form2Example28">Contraseña</label>
                                            <div className='alert alert-danger invalid-feedback'>{errors.clave?.message}</div>
                                        </div>

                                        <div className="pt-1 mb-4" style={{ borderRadius: '8px', marginLeft: '75px' }}>
                                            <button type='submit' className="btn btn-info btn-lg btn-block" style={{ background: 'linear-gradient(145deg,rgb(105, 236, 206), #0077cc)' }}>
                                                Iniciar Sesion
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                <div className="pt-1 mb-4" style={{ marginLeft: '75px' }}>
                                    <a href="/usuario" style={{ textDecoration: 'none', color: 'hsl(210, 100.00%, 17.10%)', fontSize: '14px' }}>
                                        ¿No tienes cuenta?, registrate
                                    </a>
                                </div>

                            </div>

                            <div className="col-sm-6 px-0 d-none d-sm-block">
                                <h1 className="my-5 display-5 fw-bold ls-tight" style={{ color: 'hsl(210, 2.20%, 18.00%)' }}>
                                    Mensajeria <br />
                                    <span style={{ color: 'hsl(0, 0.00%, 41.60%)' }}>Automatizada</span>
                                </h1>
                                <img
                                    src="https://www.gatortec.com/wp-content/uploads/2022/12/Email-filing-searching-photo-1080x675-1.jpg"
                                    alt="Login image"
                                    className="img-fluid"
                                    style={{ objectFit: 'cover', objectPosition: 'left', maxHeight: '100%' }}
                                />
                            </div>

                        </div>
                    </div>
                </section>
            </div>

        </div>
    );
}
