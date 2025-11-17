import React from 'react';
import Header from './Header';
import Footer from './Footer';

type LayoutProps = React.PropsWithChildren<object>;

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div>
            <Header onLoginClick={function(): void {
                throw new Error("Function not implemented.");
            } } />
            <main>{children}</main>
            <Footer />
        </div>
    );
};

export default Layout;