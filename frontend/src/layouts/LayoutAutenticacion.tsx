import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="login-page" style={{ minHeight: '100vh' }}>
      <div className="login-box">
        <div className="login-logo">
          <a href="#">
            <b>SICOPROT</b>
          </a>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;