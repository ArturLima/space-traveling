import Prismic from '@prismicio/client';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';
import { formatDate } from '../utils/formatDate';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async function getMorePosts() {
    await fetch(postsPagination.next_page)
      .then(data => data.json())
      .then(response => {
        const postsResponse = response.results.map(post => {
          return {
            uid: post.uid,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
            first_publication_date: formatDate(post.first_publication_date),
          };
        });
        setPosts([...postsResponse, ...posts]);
      });
  }
  return (
    <>
      <Head>
        <title> Home | space traveling</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          <div className={styles.img}>
            <img src="/images/Logo.svg/" alt="space traveling" />
          </div>
          {posts.map(post => (
            <Link href={`/posts/${post.uid}`} key={post.uid}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div className={styles.infoContainer}>
                  {' '}
                  <FiCalendar className={styles.icons} />
                  <time>{post.first_publication_date}</time>
                  <FiUser className={styles.icons} />
                  <p>{post.data.author}</p>
                </div>
              </a>
            </Link>
          ))}
        </div>
        <div>
          {postsPagination.next_page && (
            <button
              onClick={getMorePosts}
              type="button"
              className={styles.button}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['post.title', 'post.content'],
      pageSize: 20,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: formatDate(post.first_publication_date),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
