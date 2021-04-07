import { GetStaticProps } from 'next';
import React from 'react';
import Header from '../components/Header';
import prisma from '../lib/prisma';


function HomePage(props) {
  console.log(props, 'props');
  return (
    <React.Fragment>
      <Header/>
      <div>{props?.feed.author?.name ?? "test"}</div>
    </React.Fragment>
  )
}


// index.tsx
export const getStaticProps: GetStaticProps = async () => {
  const feed = await prisma.post.findFirst({
    where: { published: true },
    include: {
      author: {
        select: { name: true },
      },
    },
  })
  return { props: { feed } }
}

export default HomePage;



