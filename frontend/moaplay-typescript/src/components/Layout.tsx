import React from 'react';
import Header from './Header';
import Footer from './Footer';

type LayoutProps = React.PropsWithChildren<object>;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;