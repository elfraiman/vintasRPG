import { Layout } from "antd";
import { Provider } from "next-auth/client";
import { AppProps } from "next/app";
import React from "react";
import "../styles/globals.css";


const dApp = ({ Component, pageProps }: AppProps) => {

  return (
    <Provider session={pageProps.session}>
        <Component {...pageProps} />
    </Provider>
  );
};

export default dApp;
