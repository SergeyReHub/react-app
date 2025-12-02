// src/components/single_project_page/SingleProjectSection.js
import React from "react";
import styles from "./single_project_section.module.css";

export default function SingleProjectSection({ project, setLightbox }) {
  return (
    <div className={styles.container}>
      <div className={styles.photosGrid}>
        {project.photos.map((ph, idx) => (
          <div
            key={ph.id}
            className={styles.thumbWrap}
            onClick={() => setLightbox(idx)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setLightbox(idx);
            }}
          >
            <img
              src={ph.url}
              alt={ph.caption || `${project.name} — фото ${idx + 1}`}
              className={styles.thumb}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      
    </div>
  );
}