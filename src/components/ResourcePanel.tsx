import React, { useState } from 'react';
import {
  useEngine,
  createTrackPipeline,
  useTrackStore,
  usePreviewState
} from '@aoles-gl/react';

function ResourcePanel() {
  const engine = useEngine();
  const trackStore = useTrackStore();
  const previewStore = usePreviewState();
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    try {
      const pipeline = createTrackPipeline(engine, () => ({
        trackStore,
        previewStore,
      }));

      for (const file of Array.from(files)) {
        const url = URL.createObjectURL(file);
        const resFile = {
          file,
          url,
          material: { id: Date.now().toString() },
          iurl: { id: Date.now().toString() },
          options: {},
        };

        if (file.type.startsWith('video/') || file.type.startsWith('image/')) {
          await pipeline.addVideoClipWithFile(resFile);
        } else if (file.type.startsWith('audio/')) {
          await pipeline.addAudioClipWithFile(resFile);
        } else if (file.name.endsWith('.srt')) {
          await pipeline.addTextClipWithFile(file);
        }
      }
    } catch (error) {
      console.error('Failed to add resource:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4">
      <h3 className="text-lg font-semibold mb-4">Resources</h3>
      <div className="flex-1 overflow-auto">
        <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors text-center">
          <input
            type="file"
            multiple
            accept="video/*,audio/*,image/*,.srt"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isLoading}
          />
          <div className="text-gray-600">
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <>
                <div className="text-2xl mb-2">📁</div>
                <div className="text-sm">Click to upload</div>
                <div className="text-xs mt-1">Video, Audio, Image, or SRT</div>
              </>
            )}
          </div>
        </label>
      </div>
    </div>
  );
}

export default ResourcePanel;
