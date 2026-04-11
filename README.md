# Neosearch

Mecanismo de descoberta de gêneros musicais com visualização de grafos force-directed e exploração de áudio interativa.

## Início Rápido

```bash
npm install
npm run dev        # Frontend: http://localhost:3000
cd backend && python -m uvicorn main:app --port 8000
```

## Stack

- **Frontend:** React 19, TypeScript, Vite, D3.js, Tailwind
- **Backend:** FastAPI, Deezer API, Cache Manager
- **Deploy:** Vercel (frontend), Railway (backend)

## Licença

MIT
