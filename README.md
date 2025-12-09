An effectful turnkey prompt optimizer

## Configuration

### Environment Variables

#### Frontend (`packages/frontend`)

Create a `.env` file or set environment variables:

- `VITE_API_URL` - The backend API URL (default: `http://localhost:3000`)

**Examples:**
- Development: `VITE_API_URL=http://localhost:3000`
- Production: `VITE_API_URL=https://your-backend.onrender.com`

#### Backend (`packages/web`)

Create a `.env` file in the project root:

- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (optional)
  - Default: `http://localhost:5173,https://effectful-prompt-optimizer.onrender.com`
  - Example: `ALLOWED_ORIGINS=http://localhost:5173,https://effectful-prompt-optimizer.onrender.com,https://example.com`

### Deployment

When deploying:

1. **Frontend**: Set `VITE_API_URL` to your deployed backend URL (must be HTTPS if frontend is HTTPS)
2. **Backend**: Ensure `ALLOWED_ORIGINS` includes your frontend URL
3. Both frontend and backend should use HTTPS in production to avoid mixed content errors

### CORS Configuration

The backend is configured to handle CORS requests from allowed origins. If you're getting CORS errors:

1. Ensure your frontend URL is in the `ALLOWED_ORIGINS` list on the backend
2. Ensure the `VITE_API_URL` in your frontend points to the correct backend URL
3. In production, both frontend and backend should use HTTPS