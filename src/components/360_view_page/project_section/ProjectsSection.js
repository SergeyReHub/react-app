import React from 'react';
import './project_section.css';

// Хелпер для обрезки текста
const truncateText = (text, maxLength = 120) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
};

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
            <p>{truncateText(project.description, 120)}</p>
            <img src={project.nodes[0]?.panorama} alt={project.title} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectsSection;