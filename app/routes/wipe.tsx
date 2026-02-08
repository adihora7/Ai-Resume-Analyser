import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const WipeApp = () => {
    const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [deletedCount, setDeletedCount] = useState(0);

    const loadFiles = async () => {
        try {
            setLoadingFiles(true);
            const files = (await fs.readDir("./")) as FSItem[];
            setFiles(files);
        } catch (err) {
            console.error("Error loading files:", err);
        } finally {
            setLoadingFiles(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, []);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [isLoading]);

    const handleDelete = async () => {
        if (!showConfirm) {
            setShowConfirm(true);
            return;
        }

        setDeleting(true);
        setShowConfirm(false);

        try {
            let count = 0;
            for (const file of files) {
                await fs.delete(file.path);
                count++;
                setDeletedCount(count);
            }

            await kv.flush();
            await loadFiles();
            setDeleted(true);

            setTimeout(() => {
                setDeleted(false);
            }, 3000);
        } catch (err) {
            console.error("Error deleting files:", err);
        } finally {
            setDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center">
                <div className="bg-white border border-red-300 rounded-lg p-6 max-w-md shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="text-red-500 text-xl">⚠</div>
                        <h2 className="text-lg font-semibold text-gray-900">Error</h2>
                    </div>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button
                        onClick={clearError}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">Data Management</h1>
                    <div className="text-gray-300">
                        <p>Authenticated as: <span className="font-semibold text-white">{auth.user?.username}</span></p>
                    </div>
                </div>

                {/* Files List - White card for readability */}
                <div className="mb-8 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-xl font-semibold text-gray-900 mb-1">Existing Files</h2>
                        <p className="text-gray-600 text-sm">All files and folders in your application storage</p>
                    </div>

                    {loadingFiles ? (
                        <div className="py-12 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-3"></div>
                            <p className="text-gray-600">Loading files...</p>
                        </div>
                    ) : files.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="text-4xl text-gray-300 mb-4">📁</div>
                            <p className="text-gray-700 text-lg">No files found</p>
                            <p className="text-gray-500 text-sm mt-2">Your storage is empty</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-gray-500">
                                            {file.name.includes('.') ? '📄' : '📁'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{file.name}</p>
                                            {file.size && (
                                                <p className="text-sm text-gray-600">
                                                    {file.size > 1024 * 1024
                                                        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                                                        : file.size > 1024
                                                            ? `${(file.size / 1024).toFixed(2)} KB`
                                                            : `${file.size} bytes`
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {(file as any).type || 'File'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Danger Zone - White card with red accents */}
                <div className="bg-white rounded-lg border border-red-200 shadow-lg p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-red-50 rounded-lg">
                            <div className="text-red-600 text-xl">🗑️</div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Wipe App Data</h2>
                            <p className="text-gray-700">
                                This will permanently delete all files and clear all application data. This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    {deleted && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="text-green-600">✓</div>
                                <span className="text-green-800 font-medium">Successfully deleted all data!</span>
                            </div>
                        </div>
                    )}

                    {showConfirm ? (
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="text-red-600">⚠</div>
                                    <h3 className="font-bold text-gray-900">Confirm Deletion</h3>
                                </div>
                                <p className="text-gray-700">
                                    You are about to delete {files.length} file{files.length !== 1 ? 's' : ''}. This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium flex-1"
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Deleting... ({deletedCount}/{files.length})
                                        </>
                                    ) : (
                                        'Yes, Delete Everything'
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleDelete}
                            disabled={deleting || files.length === 0}
                            className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>🗑️</span>
                            Wipe App Data
                        </button>
                    )}

                    {/* Status info */}
                    {deleting && (
                        <div className="mt-4 text-center text-sm text-gray-600">
                            <p>Deleting files... Please don't close this window.</p>
                        </div>
                    )}

                    {files.length === 0 && !deleting && (
                        <div className="mt-4 text-center text-sm text-gray-600">
                            <p>No files to delete</p>
                        </div>
                    )}
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center text-sm text-gray-300">
                    <p>This action only affects your application data. Account credentials will remain intact.</p>
                </div>
            </div>
        </div>
    );
};

export default WipeApp;