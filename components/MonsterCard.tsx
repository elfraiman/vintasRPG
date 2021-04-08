import { Monster, Player, Weapon } from "@prisma/client";
import { Button, Card, Progress } from "antd";
import { useSession } from "next-auth/client";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
interface IMonsterCardProps {
  monster: Monster;
  showAttack?: boolean;
  hideHpBar?: boolean;
}

const MonsterCard = ({
  monster,
  showAttack,
  hideHpBar,
}: IMonsterCardProps) => {
  const router = useRouter();
  const [session, loading] = useSession();

  if (!monster) return null;
  if (!loading && !session) return null;

  const calculatePercentHealth = (cur: number, max: number) => {
    const p = cur / max;
    const result = p * 100;
    return result;
  };

  const handleAttack = () => {
    router.push({ pathname: "/fight", query: { monsterId: monster.id } });
  };

  return (
    <React.Fragment>
      <Card
        title={monster.name}
        style={{
          width: 300,
          height: 350,
          display: "flex",
          flexDirection: "column",
        }}
        loading={loading}
      >
        <span
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Image
            src={`/assets/icons/monster-${monster.id}.svg`}
            width={120}
            height={120}
          />
        </span>
        <p> Level: {monster.level}</p>

        <React.Fragment>
          {monster.health > 0 ? (
            <p style={{ marginBottom: 0 }}>
              Health: {monster.health} / {monster.maxHealth}
            </p>
          ) : (
            <h4>Dead</h4>
          )}
        </React.Fragment>
        {monster.health > 0 && !hideHpBar ? (
          <div>
            <Progress
              percent={calculatePercentHealth(
                monster.health,
                monster.maxHealth
              )}
              type="line"
              showInfo={false}
              status={
                calculatePercentHealth(monster.health, monster.maxHealth) <= 30
                  ? "exception"
                  : "success"
              }
            />
          </div>
        ) : (
          <></>
        )}
        {showAttack ? (
          <Button style={{ marginTop: 16 }} onClick={handleAttack}>
            Attack
          </Button>
        ) : (
          <></>
        )}
      </Card>
    </React.Fragment>
  );
};

export default MonsterCard;
