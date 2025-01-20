import { peticionPost } from "./Conexion";
import { save, saveToken } from "./SessionUtil";

export async function inicio_sesion(data) {

    const sesion = await peticionPost('cuenta/sesion', data, "");

    if (sesion.code === 200 && sesion.token) {
        saveToken(sesion.token);
        save('user', sesion.user);
        save('external', sesion.external_id)
    }

    return sesion;
}
