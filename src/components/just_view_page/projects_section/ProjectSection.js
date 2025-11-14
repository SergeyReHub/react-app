

import React, { useEffect, useState, useCallback } from "react";
import "./project_section.css";



export default function ProjectSection({projects, set_light_box}) {


    const openLightbox = (projectIndex, photoIndex) => {
        set_light_box({ open: true, projectIndex, photoIndex });
    };


    return (
        <div className="projects-container">
            {projects.map((project, pIdx) => (
                <section key={project.id} className="just-view-page__project">
                    <div className="just-view-page__project-header">
                        <div>
                            <div className="just-view-page__title">{project.name}</div>
                            <div className="just-view-page__meta">
                                {project.photos.length} photo{project.photos.length !== 1 ? "s" : ""}
                            </div>
                        </div>
                    </div>

                    <div className="just-view-page__grid">
                        {project.photos.map((ph, phIdx) => (
                            <div
                                key={ph.id}
                                className="just-view-page__thumb-wrap"
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
                                    className="just-view-page__thumb"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>

                    {project.photos.map((ph) =>
                        ph.caption ? (
                            <div key={`${project.id}-cap-${ph.id}`} className="just-view-page__caption">
                                {ph.caption}
                            </div>
                        ) : null
                    )}
                </section>
            ))}

        </div>
    );
}