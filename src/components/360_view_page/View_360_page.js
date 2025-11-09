import React, { useState, useEffect } from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';

// Optional: simple modal styling
const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.9)',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export default function View_360_Page() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');

        // 🔍 DEBUG: inspect raw response
        const text = await res.text();
        console.log('Raw response:', text);
        console.log('Response status:', res.status);
        console.log('Content-Type:', res.headers.get('content-type'));

        // if (res.ok) {
        //   // Now try to parse as JSON
        //   let data;
        //   try {
        //     data = JSON.parse(text); // ← safer: we already have text
        //   } catch (parseErr) {
        //     throw new Error(`Invalid JSON response: ${parseErr.message}. Raw: ${text.substring(0, 200)}`);
        //   }
        //   setProjects(data);
        // } else {
          // fallback
          setProjects([
            { id: 1, title: "Office", description: "Mock", panoramaUrl: "/images/panoramnie-kartinki-4.jpg" }
          ]);
        // }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const openProject = (project) => {
    setSelectedProject(project);
  };

  const closeProject = () => {
    setSelectedProject(null);
  };

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div className="ProjectsPage" style={{ padding: '20px' }}>
      <h1>Our Projects</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => openProject(project)}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <h3>{project.title}</h3>
            <p>{project.description}</p>
          </div>
        ))}
      </div>

      {/* Modal / Dialog */}
      {selectedProject && (
        <div style={modalStyle} onClick={closeProject}>
          <div
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            style={{
              width: '90vw',
              height: '90vh',
              maxWidth: '1200px',
              position: 'relative',
            }}
          >
            <button
              onClick={closeProject}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '20px',
                cursor: 'pointer',
                zIndex: 1001,
              }}
            >
              &times;
            </button>
            <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '10px' }}>
              {selectedProject.title}
            </h2>
            <ReactPhotoSphereViewer
              src={selectedProject.panoramaUrl}
              width="100%"
              height="calc(90vh - 60px)" // account for title & close button
            />
          </div>
        </div>
      )}
    </div>
  );
}