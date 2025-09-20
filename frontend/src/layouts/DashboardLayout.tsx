import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="wrapper">
      {/* Aquí irían los componentes de Cabecera y BarraLateral */}
      {/* <Header /> */}
      {/* <Sidebar /> */}

      <div className="content-wrapper">
        <section className="content">
          <div className="container-fluid pt-3">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardLayout;