// Header.tsx
import { Player } from "@prisma/client";
import { Button, Layout, Spin } from "antd";
import { signOut, useSession } from "next-auth/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

const { Header } = Layout;

interface IHeaderComponentProps {
  player: Player;
}

const HeaderComponent = ({ player }: IHeaderComponentProps) => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;
  const [session, loading] = useSession();

  let right = null;
  let left = null;

  if (!session) {
    right = (
      <div className="right">
        <Button>
          <Link href="/api/auth/signin">
            <a data-active={isActive("/signup")}>Log in</a>
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

  if (player && session) {
    left = (
      <div className="left">
        <span className="currency">
          <Image src="/assets/icons/gold-coins.svg" width={25} height={20} />
          {new Intl.NumberFormat("en-IN").format(player?.gold)}
        </span>

        <span style={{ marginLeft: 26 }}>LEVEL: {player?.level}</span>

        <span style={{ marginLeft: 26 }}>STR: {player?.strength}</span>

        <span style={{ marginLeft: 26 }}>DEX: {player?.dexterity}</span>

        <span style={{ marginLeft: 26 }}>INT: {player?.intelligence}</span>

        <span style={{ marginLeft: 26 }}>CON: {player?.constitution}</span>

        <style jsx>{`
          .currency {
            font-weight: 600;
            color: #ffd700;
            margin-left: 26px;
          }
          .name {
            font-weight: 600;
          }
          .left {
            margin-right: auto;
            color: white;
          }
        `}</style>
      </div>
    );
  }

  return (
    <Header
      className="ant-layout-header"
      style={{
        padding: "1rem",
        color: "white",
        display: "flex",
        alignItems: "center",
        height: "80px",
      }}
    >
      {loading ? (
        <Spin />
      ) : (
        <React.Fragment>
          {left}
          {right}
        </React.Fragment>
      )}
    </Header>
  );
};

export default HeaderComponent;
