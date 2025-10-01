import { auth } from '@/auth'
 
export default auth((req) => {
  // Middleware personalizado aquí si es necesario
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
}
