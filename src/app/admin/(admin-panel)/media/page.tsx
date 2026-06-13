"use client";

import { useState, useEffect } from "react";
import { UploadCloud, Trash2, Image as ImageIcon, FileText, Loader2, Calendar, HardDrive, ExternalLink } from "lucide-react";
import Image from "next/image";

interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch media files
  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/media");
      if (!res.ok) throw new Error("Failed to load media items");
      const data = await res.json();
      if (Array.isArray(data)) {
        setMediaList(data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Handle File Upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? "Failed to upload file");
      }

      await fetchMedia();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle File Deletion
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this file?")) return;

    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? "Failed to delete file");
      }

      setSelectedItem(null);
      await fetchMedia();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Media Library</h1>
        <p className="text-slate-500 text-sm mt-0.5">Upload and manage visual assets for your posts and pages.</p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-lg py-10 px-4 cursor-pointer transition-colors group">
          {uploading ? (
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
          ) : (
            <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-indigo-500 transition-colors mb-3" />
          )}
          <span className="font-semibold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors">
            {uploading ? "Uploading file..." : "Click to upload an asset"}
          </span>
          <span className="text-slate-400 text-xs mt-1">Images, PDFs, documents up to 10MB</span>
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
            accept="image/*,application/pdf"
          />
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
          <span>⚠</span> {error}
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gallery */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : mediaList.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl py-20 text-center">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No media uploaded yet</p>
              <p className="text-slate-400 text-sm mt-1">Use the upload box above to add your first asset.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {mediaList.map((item) => {
                const isImage = item.mimeType.startsWith("image/");
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`
                      group relative aspect-square rounded-xl border overflow-hidden bg-slate-50 text-left transition-all
                      ${selectedItem?.id === item.id ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-200 hover:border-slate-300"}
                    `}
                  >
                    {isImage ? (
                      <Image
                        src={item.path}
                        alt={item.originalName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <FileText className="w-10 h-10 text-slate-400 mb-2" />
                        <span className="text-xs text-slate-600 font-medium text-center line-clamp-2 w-full px-1">
                          {item.originalName}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs text-white bg-black/60 px-2 py-1 rounded">View Details</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Details Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 self-start space-y-5">
          {selectedItem ? (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-2">Asset Details</h3>

              {/* Preview */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-50 border border-slate-200">
                {selectedItem.mimeType.startsWith("image/") ? (
                  <Image
                    src={selectedItem.path}
                    alt={selectedItem.originalName}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">File Name:</span>
                  <span className="font-medium text-slate-800 break-all select-all text-right ml-4">
                    {selectedItem.originalName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">File Size:</span>
                  <span className="font-medium text-slate-800">{formatSize(selectedItem.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mime Type:</span>
                  <span className="font-mono text-xs text-slate-800">{selectedItem.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Uploaded:</span>
                  <span className="font-medium text-slate-800">
                    {new Date(selectedItem.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="pt-2">
                  <label className="text-xs text-slate-400 font-medium block mb-1">Direct URL</label>
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}${selectedItem.path}`}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1 select-all focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <a
                  href={selectedItem.path}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost btn-sm flex-1 flex items-center justify-center gap-1.5 border border-slate-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Original
                </a>
                <button
                  onClick={() => handleDelete(selectedItem.id)}
                  className="btn-danger btn-sm flex-1 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Select an asset to view its properties and management options.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
