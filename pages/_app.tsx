import Icon, { UploadOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { Provider } from "next-auth/client";
import { AppProps } from "next/app";
import Image from "next/image";
import React, { useState } from "react";
import HeaderComponent from "../components/HeaderComponent";
import "../styles/globals.css";
import { useRouter } from 'next/router'

const { Sider, Content } = Layout;

const App = ({ Component, pageProps }: AppProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const router = useRouter();
  return (
    <Provider session={pageProps.session}>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
            <Menu.Item key="1" style={{ display: "flex" }} onClick={() => router.push('/')}>
              <Image src="/assets/icons/home.svg" height={25} width={25} />
              <span style={{ marginLeft: 16 }}>Home</span>
            </Menu.Item>
            <Menu.Item key="2" style={{ display: "flex" }} onClick={() => router.push('/fight')}>
              <Image src="/assets/icons/swords.svg" height={25} width={25} />
              <span style={{ marginLeft: 16 }}>Combat</span>
            </Menu.Item>
            <Menu.Item key="3" style={{ display: "flex" }}>
              <Image src="/assets/icons/forest.svg" height={25} width={25} />
              <span style={{ marginLeft: 16 }}>Wilderness</span>
            </Menu.Item>
            <Menu.Item key="4" style={{ display: "flex" }}>
              <Image src="/assets/icons/market.svg" height={25} width={25} />
              <span style={{ marginLeft: 16 }}>Market</span>
            </Menu.Item>
          </Menu>
        </Sider>

        <Layout>
          <HeaderComponent />
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
            }}
          >
            <Component {...pageProps} />
          </Content>
        </Layout>
      </Layout>
    </Provider>
  );
};

export default App;
