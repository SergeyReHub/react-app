// src/utils/uploadFile.js
export const UploadFile = async (file, authToken, url) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}` },
    body: formData
  });

  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.url; // например: "/uploads/abc123.jpg"
};