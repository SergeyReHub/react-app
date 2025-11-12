import React from 'react';
import './project_section.css';

const ProjectsSection = ({ isActive, projects, openProject }) => {
    return (
    <section className={`projects-section ${isActive ? 'active' : 'hidden'}`}>
        <div className='project-list'>
        {projects.map((project) => (
          <div
            className='project'
            key={project.id}
            onClick={() => openProject(project)}
          >
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <img src={project.nodes[0].panorama}></img>
          </div>
        ))}
        </div>
    </section>
  );
};

export default ProjectsSection;