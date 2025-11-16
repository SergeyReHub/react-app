import React, { useState, useEffect, useRef, useCallback } from 'react';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import '@photo-sphere-viewer/gallery-plugin/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


import './project_page.css';

const FALLBACK_PROJECTS = {
    title: "Office Tour",
    description: "asdfgdsafghejkfnvsnadkjfsknjekv dnljssssssssssssssssssssssssfvvvvvvvvvv vvvvvvvvvvnjnjjjjjjjjjjjjjjjjjnjjjjjjjjjjjjjjjjjjjjjjjjvffffffffffffffffffffffnjjjjjjjjjjjjjjjjjjjjjjjjjjjfvnjfvjfvjnfvjvjfvjfvjnfvfvvfnjfvjnjnfvfvnjffvjsnjlvfnvsljnvsvnsfjlvnsj fvnsfjlvnsfjlvnsvjsnfvsjflvnsfjvnsfvjnsvjsfn vsjvnsfjvnsvljsnfvjlsnvjsflvnsljvnsfjlvsnvjlsfnjasdfhj",
    nodes: [
        {
            id: 1,
            panorama: "/images/panoramnie-kartinki-4.jpg",
            thumbnail: "/images/panoramnie-kartinki-4.jpg",
            name: "Lobby",
            caption: "[1] Main entrance",
            links: [{ nodeId: 2 }],
            gps: [55.7815, 37.6759, 1],
            sphereCorrection: { pan: "33deg" }
        },
        {
            id: 2,
            panorama: "/images/panoramnie-kartinki-4.jpg",
            thumbnail: "/images/panoramnie-kartinki-4.jpg",
            name: "Hallway",
            caption: "[2] Corridor to offices",
            links: [{ nodeId: 1 }, { nodeId: 3 }],
            gps: [55.7816, 37.6760, 1],
            sphereCorrection: { pan: "66deg" }
        },
        {
            id: 3,
            panorama: "/images/panoramnie-kartinki-4.jpg",
            thumbnail: "/images/panoramnie-kartinki-4.jpg",
            name: "Office",
            caption: "[3] Open workspace",
            links: [{ nodeId: 2 }],
            gps: [55.7817, 37.6761, 1],
            sphereCorrection: { pan: "99deg" }
        }
    ]
};

export default function ProjectPage() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const viewerRef = useRef(null);
    const viewerInstance = useRef(null);

    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/'); // программный переход на корень
    };

    // ✅ Only init viewer AFTER project is available
    useEffect(() => {
        if (!project?.nodes || !viewerRef.current) return;

        // Destroy previous instance if exists
        if (viewerInstance.current) {
            viewerInstance.current.destroy();
        }

        const viewer = new Viewer({
            container: viewerRef.current,
            loadingImg: '/assets/loader.gif',
            touchmoveTwoFingers: true,
            mousewheelCtrlKey: true,
            defaultYaw: '130deg',
            navbar: 'zoom move gallery caption fullscreen',
            plugins: [
                MarkersPlugin,
                GalleryPlugin.withConfig({
                    thumbnailSize: { width: 100, height: 100 },
                }),
                VirtualTourPlugin.withConfig({
                    positionMode: 'gps',
                    renderMode: '3d',
                    nodes: project.nodes,
                    startNodeId: project.nodes[0]?.id || 1,
                }),
            ],
        });

        viewerInstance.current = viewer;

        return () => {
            if (viewerInstance.current) {
                viewerInstance.current.destroy();
                viewerInstance.current = null;
            }
        };
    }, [project]); // ← only reinit when project changes

    // ✅ Fetch data
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const controller = new AbortController();
        try {
            const res = await fetch(`/api/page/${id}`, { signal: controller.signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            // ✅ Normalize to expected FALLBACK_PROJECTS shape
            // Assuming your API returns { title, description, nodes[] }
            setProject(data);
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error("Fetch failed:", err);
                setError(err.message);
                setProject(FALLBACK_PROJECTS); // ✅ Use fallback on error
            }
        } finally {
            setLoading(false);
        }

        return () => controller.abort();
    }, [id]);

    // ✅ Trigger fetch on mount / id change
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ✅ UI states
    if (loading) return <div className="project-page">Loading...</div>;
    if (!project) return <div className="project-page">No project data.</div>;

    return (
        <div className="project-page">
            <div className='global-header'>
                <span className="brand"
                    onClick={handleClick}>
                    <span style={{ color: 'rgba(253, 69, 69, 0.58)' }}>M</span>
                    <span style={{ color: 'rgba(253, 253, 253, 1)' }}>.</span>
                    <span style={{ color: 'rgba(200, 200, 200, 1)' }}>GROUP</span>
                </span>
            </div>
            <div className="project-section">
                <h1>{project.title || "Untitled Project"}</h1>
                <div className='nadpisi'>
                    <p>{project.description || ""}</p>
                </div>
                <div
                    className='viewer-component'
                    ref={viewerRef}
                />
            </div>
        </div>
    );
}