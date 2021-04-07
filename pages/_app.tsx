import '../styles/globals.css';
import { Provider } from 'next-auth/client';
import { AppProps } from 'next/app';
import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import HeaderComponent from '../components/HeaderComponent';

const { Header, Footer, Sider, Content } = Layout;

const App = ({ Component, pageProps }: AppProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  return (
    <Provider session={pageProps.session}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1" icon={<UserOutlined />}>
              nav 1
            </Menu.Item>
            <Menu.Item key="2" icon={<VideoCameraOutlined />}>
              nav 2
            </Menu.Item>
            <Menu.Item key="3" icon={<UploadOutlined />}>
              nav 3
            </Menu.Item>
          </Menu>
        </Sider>

        <Layout>
          <HeaderComponent />
          <Content
            style={{
              margin: '24px 16px',
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
