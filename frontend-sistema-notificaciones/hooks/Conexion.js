let URL = 'http://localhost:8000/api/';


//METODO GENERAL PARA PETICIONES POST
export async function peticionPost(recurso, data, key = "") {
    let headers = {};

    if (key !== "") {
        headers = {
            'Accept': 'application/json',
            "Content-Type": "application/json",
            "token-api": key,
        };
    } else {
        headers = {
            'Accept': 'application/json',
            "Content-Type": "application/json",
        };
    }

    const response = await (fetch(URL + recurso, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data)
    }));

    return  response.json();
}


//METODO GENERAL PARA PETICIONES GET
export async function peticionGet(recurso,  key = "") {
    let headers = {};

    if (key !== "") {
        headers = {
            'Accept': 'application/json',
            "Content-Type": "application/json",
            "token-api": key,
        };
    } else {
        headers = {
            'Accept': 'application/json',
            "Content-Type": "application/json",
        };
    }

    const response = await (fetch(URL + recurso, {
        method: "GET",
        headers: headers,
    }));

    return await response.json();
}
