import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ScrapFeed.module.css';

const ScrapFeed = ({ scraps }) => {
  if (!scraps || scraps.length === 0) {
    return <p>Ainda não há recados. Seja o primeiro a postar!</p>;
  }

  return (
    <div className={styles.feed}>
      {scraps.map((scrap) => (
        <div key={scrap._id} className={styles.scrap}>
          <div className={styles.header}>
            <Link to={`/perfil/${scrap.author._id}`}>
              <img 
                src={scrap.author.profilePicture || '/default-avatar.svg'} 
                alt={scrap.author.name} 
                className={styles.avatar} 
              />
            </Link>
            <div className={styles.author}>
              <Link to={`/perfil/${scrap.author._id}`}>{scrap.author.name}</Link>
            </div>
          </div>
          <div className={styles.body}>
            <p className={styles.content}>{scrap.content}</p>
            <div className={styles.timestamp}>
              {new Date(scrap.createdAt).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScrapFeed; 