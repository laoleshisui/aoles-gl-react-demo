import { useTrackStore } from '@aoles-gl/react';

/**
 * ExportButton — 导出视频按钮
 *
 * 调用新 WASM 导出功能：
 *   1. startExport() → WASM 离线渲染所有帧并写入 Emscripten 虚拟 FS
 *   2. OnExportComplete 回调自动从虚拟 FS 读取文件并触发浏览器下载
 */
export default function ExportButton() {
  const store = useTrackStore();

  const isExporting  = store((s: any) => s.isExporting  as boolean);
  const exportProgress = store((s: any) => s.exportProgress as number);
  const startExport  = store.getState().startExport;
  const stopExport   = store.getState().stopExport;

  function handleExport() {
    // 使用 ConfigController 已配置的分辨率/fps 作为默认值。
    // 如需自定义可传参：
    // startExport('/tmp/export_out.webm',
    //   { width: 1920, height: 1080, fps: 30, bps: 8_000_000, codec_name: 'libx264' },
    //   { sample_rate: 48000, codec_name: 'aac', bps: 192000 }
    // )
    startExport('/tmp/export_out.webm');
  }

  if (isExporting) {
    return (
      <div className="export-progress-wrap">
        {/* 文字进度 */}
        <span className="export-label">导出中 {exportProgress}%</span>

        {/* 进度条 */}
        <div className="export-bar-track">
          <div
            className="export-bar-fill"
            style={{ width: `${exportProgress}%` }}
          />
        </div>

        {/* 取消按钮 */}
        <button
          className="export-cancel-btn"
          onClick={() => stopExport()}
          title="取消导出"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      className="export-btn"
      onClick={handleExport}
      title="导出为 MP4"
    >
      <svg
        className="export-btn-icon"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
      导出视频
    </button>
  );
}
