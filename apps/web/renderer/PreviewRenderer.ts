export class PreviewRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private video: HTMLVideoElement | null = null;
  private animationFrameId: number | null = null;
  private videoUrl: string | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.setupVideo();
  }

  private async setupVideo() {
    const video = await fetch('/test-video.mp4');
    const videoBlob = await video.blob();

    this.playVideo(videoBlob);
  }

  private async playVideo(blob: Blob) {
    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl);
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.video = document.createElement('video');
    this.videoUrl = URL.createObjectURL(blob);
    this.video.src = this.videoUrl;
    this.video.loop = true;
    this.video.muted = true;

    this.video.addEventListener('loadedmetadata', () => {
      console.log('loadedmetadata');
      this.video!.play();
      this.render();
    });

    this.video.addEventListener('error', (e) => {
      console.error('Video playback error:', e);
    });
  }

  private render = () => {
    if (!this.video || this.video.readyState < 2) {
      setTimeout(() => {
        this.render();
      }, 500);
      return;
    }

    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    this.animationFrameId = requestAnimationFrame(this.render);
  };

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.video) {
      this.video.pause();
      this.video.src = '';
      this.video = null;
    }

    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl);
      this.videoUrl = null;
    }
  }
}
