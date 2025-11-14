import React, { useEffect, useState, useCallback } from "react";
import "./just_view_page.css";
import { useNavigate } from 'react-router-dom';
import ProjectSection from "./projects_section/ProjectSection";
import LightBox from "./light_box/LightBox";
// Fallback data to use if fetching fails
const FALLBACK_PROJECTS = [
    {
        id: "demo",
        name: "Sample Project",
        photos: [
            {
                id: "ph1",
                url: "images/panoramnie-kartinki-4.jpg",
                caption: "This is a demo image. Data failed to load.",
            },
            {
                id: "ph2",
                url: "images/example.jpeg",
                caption: "Check your network or API endpoint.",
            },
        ],
    },
    {
        id: "demo",
        name: "Sample Project",
        photos: [
            {
                id: "ph1",
                url: "images/panoramnie-kartinki-4.jpg",
                caption: "This is a demo image. Data failed to load.",
            },
            {
                id: "ph2",
                url: "images/example.jpeg",
                caption: "Check your network or API endpoint.",
            },
        ],
    },
];

export default function JustViewPage({ apiUrl = "/api/projects/photos" }) {
    const [projects, setProjects] = useState([]); // normalized: [{ id, name, photos: [...] }]
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lightbox, setLightbox] = useState({ open: false, projectIndex: 0, photoIndex: 0 });
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const controller = new AbortController();
        try {
            const res = await fetch(apiUrl, { signal: controller.signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            const data = await res.json();

            let normalized = [];

            if (Array.isArray(data) && data.length > 0) {
                if (data[0].photos) {
                    // grouped by project
                    normalized = data.map((p) => ({
                        id: p.id,
                        name: p.name,
                        photos: Array.isArray(p.photos)
                            ? p.photos.map((ph) => ({
                                id: ph.id,
                                url: ph.url,
                                caption: ph.caption,
                            }))
                            : [],
                    }));
                } else {
                    // flat array
                    const map = new Map();
                    data.forEach((ph) => {
                        const pid = ph.id;
                        const pname = ph.name;
                        map.get(pid).photos.push({
                            id: ph.id,
                            url: ph.url,
                            caption: ph.caption,
                        });
                    });
                    normalized = Array.from(map.values());
                }
            }

            setProjects(normalized);
        } catch (err) {
            if (err.name !== "AbortError") {
                setError(err.message || "Failed to fetch project photos");
                // ✅ fallback on error
                setProjects(FALLBACK_PROJECTS);
            }
        } finally {
            setLoading(false);
        }
        return () => controller.abort();
    }, [apiUrl]);

    useEffect(() => {
        const cleanup = fetchData();
        return () => {
            if (typeof cleanup === "function") cleanup();
        };
    }, [fetchData]);

   

    
    

    const handleClick = () => {
        navigate('/');
    }

    return (
        <div className="just-view-page">
            <div className="header">
                <span className="brand"
                    onClick={handleClick}>
                    <span style={{ color: 'rgba(253, 69, 69, 0.58)' }}>M</span>
                    <span style={{ color: 'rgba(253, 253, 253, 1)' }}>.</span>
                    <span style={{ color: 'rgba(200, 200, 200, 1)' }}>GROUP</span>
                </span>
                <h2>Проекты с фото-списком</h2>
            </div>

            {loading && <div className="just-view-page__loader">Loading photos…</div>}


            {!loading && !error && projects.length === 0 && (
                <div className="just-view-page__loader">No photos found</div>
            )}

            <ProjectSection  projects={projects} 
            set_light_box = {setLightbox}/>

            {lightbox.open && projects[lightbox.projectIndex] && (
                <LightBox projects={projects}
                set_lightbox={setLightbox}
                lightbox={lightbox}/>
            )}
            {error && <div className="just-view-page__error">⚠️ {error}</div>}
        </div>
    );
}