// src/utils/uploadFile.js
export const UploadFile = async (file, authToken) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('http://localhost:8080/api/admin/upload/360-view', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}` },
    body: formData
  });

  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.url; // например: "/uploads/abc123.jpg"
};