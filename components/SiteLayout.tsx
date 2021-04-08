import { Layout, Menu } from "antd";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";
import HeaderComponent from "../components/HeaderComponent";


const { Sider, Content } = Layout;

const SiteLayout = ({children}) => {
    const router = useRouter();
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [selectedKey, setSelectedKey] = useState({current: router.pathname});
    return (
    <Layout style={{ minHeight: "100vh" }}>
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <div className="logo" />
      <Menu theme="dark" mode="inline" selectedKeys={[selectedKey.current]} onClick={e => setSelectedKey({current: e.key.toString()})}>
        <Menu.Item
          key="/home"
          style={{ display: "flex" }}
          onClick={() => router.push("/home")}
        >
          <Image src="/assets/icons/home.svg" height={25} width={25} />
          <span style={{ marginLeft: 16 }}>Home</span>
        </Menu.Item>
        <Menu.Item
          key="/fight-catalogue"
          style={{ display: "flex" }}
          onClick={() => router.push("/fight-catalogue")}
        >
          <Image src="/assets/icons/swords.svg" height={25} width={25} />
          <span style={{ marginLeft: 16 }}>Combat</span>
        </Menu.Item>
        <Menu.Item
          key="/forest"
          style={{ display: "flex" }}
        >
          <Image src="/assets/icons/forest.svg" height={25} width={25} />
          <span style={{ marginLeft: 16 }}>Wilderness</span>
        </Menu.Item>
        <Menu.Item
          key="/market"
          style={{ display: "flex" }}
        >
          <Image src="/assets/icons/market.svg" height={25} width={25} />
          <span style={{ marginLeft: 16 }}>Market</span>
        </Menu.Item>
        <Menu.Item
          key="/church"
          style={{ display: "flex" }}
          onClick={() => router.push("/church")}
        >
          <Image src="/assets/icons/church.svg" height={25} width={25} />
          <span style={{ marginLeft: 16 }}>Church</span>
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
        {children}
      </Content>
    </Layout>
  </Layout>
    )
}

export default SiteLayout;