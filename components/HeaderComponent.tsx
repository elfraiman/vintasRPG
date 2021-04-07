// Header.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/client';
import { Button, Layout, Menu } from 'antd';

const { Header } = Layout;
const HeaderComponent: React.FC = () => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname
  const [session, loading] = useSession();

  let right = null;

  if (!session) {
    right = (
      <div className="right">
        <Button>
          <Link href="/api/auth/signin">
            <a data-active={isActive('/signup')}>Log in</a>
          </Link>
        </Button>
        <style jsx>{`
          p {
            display: inline-block;
            font-size: 13px;
            padding-right: 1rem;
          }

          .right {
            margin-left: auto;
          }
        `}</style>
      </div>
    );
  }

  if (session) {
    right = (
      <div className="right">
        <p>{session.user.name}</p>
        <Button onClick={() => signOut()}>
          <a>Log out</a>
        </Button>

        <style jsx>{`
          p {
            display: inline-block;
            font-size: 13px;
            padding-right: 1rem;
          }

          .right {
            margin-left: auto;
          }
        `}</style>
      </div>
    );
  }

  return (
    <Header
      className="ant-layout-header"
      style={{
        padding: '1rem',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        height: '80px',
      }}
    >
      {right}
    </Header>
  );
};

export default HeaderComponent;
