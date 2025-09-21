import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ProveedorAutenticacion } from './contextos/ContextoAutenticacion';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'tom-select/dist/css/tom-select.bootstrap5.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProveedorAutenticacion>
      <RouterProvider router={router} />
    </ProveedorAutenticacion>
  </StrictMode>,
);