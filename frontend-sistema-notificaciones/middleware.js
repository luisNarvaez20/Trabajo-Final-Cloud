import { NextResponse } from 'next/server'


export function middleware(request) {
    let tokenValue = false;
    const tokenObject = request.cookies.get('token');

    if (tokenObject) {
        tokenValue = JSON.parse(tokenObject.value);
    }

    if (!tokenValue && request.nextUrl.pathname.startsWith('/principal')) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!tokenValue && request.nextUrl.pathname.startsWith('/destinatario')) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!tokenValue && request.nextUrl.pathname.startsWith('/grupo')) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!tokenValue && request.nextUrl.pathname.startsWith('/mensaje')) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!tokenValue && request.nextUrl.pathname.startsWith('/perfilUsuario')) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (tokenValue && request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/principal', request.url))
    }
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/destinatario(.*)', '/mensaje(.*)', '/grupo(.*)',
        '/login', '/principal', '/perfilUsuario'],
}
