// src/components/just_view_page/projects_section/ProjectSection.js
import React from "react";
import styles from "./project_section.module.css";

export default function ProjectSection({ projects, set_light_box }) {
  const openLightbox = (projectIndex, photoIndex) => {
    set_light_box({ open: true, projectIndex, photoIndex });
  };

  return (
    <div className={styles.container}>
      {projects.map((project, pIdx) => (
        <section key={project.id} className={styles.project}>
          <div className={styles.projectHeader}>
            <div>
              <div className={styles.title}>{project.name}</div>
              <div className={styles.meta}>
                {project.photos.length} photo{project.photos.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div className={styles.grid}>
            {project.photos.map((ph, phIdx) => (
              <div
                key={ph.id}
                className={styles.thumbWrap}
                onClick={() => openLightbox(pIdx, phIdx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openLightbox(pIdx, phIdx);
                }}
              >
                <img
                  src={ph.url}
                  alt={ph.caption || `${project.name} photo`}
                  className={styles.thumb}
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {project.photos.map((ph) =>
            ph.caption ? (
              <div key={`${project.id}-cap-${ph.id}`} className={styles.caption}>
                {ph.caption}
              </div>
            ) : null
          )}
        </section>
      ))}
    </div>
  );
}