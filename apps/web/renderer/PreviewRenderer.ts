import * as MP4Box from 'mp4box';

export class PreviewRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private video: HTMLVideoElement | null = null;
  private animationFrameId: number | null = null;
  private videoUrl: string | null = null;
  private decoder: VideoDecoder | null = null;
  private trackInfo: MP4Box.Track | null = null;
  private startTime: number = 0;
  private frameQueue: VideoFrame[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.setupVideo();
  }

  private samples: MP4Box.Sample[] = [];

  private async enqueueSamples(samples: MP4Box.Sample[]) {
    this.samples.push(...samples.sort((a, b) => a.number - b.number));
    // Start decoding if decoder is ready
    if (this.decoder && this.decoder.state === 'configured') {
      this.decodeNextSample();
    }
  }

  private description(track: MP4Box.Track) {
    for (const entry of trak.mdia.minf.stbl.stsd.entries) {
      const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
      if (box) {
        const stream = new MP4Box.DataStream(
          undefined,
          0,
          MP4Box.DataStream.ENDIANNESS
        );
        box.write(stream);
        return new Uint8Array(stream.buffer, 8); // Remove the box header.
      }
    }
    throw new Error('avcC, hvcC, vpcC, or av1C box not found');
  }

  private getDescription(mp4File: MP4Box.ISOFile, track: MP4Box.Track) {
    const trak = mp4File.getTrackById(track.id);

    if (!trak) {
      throw new Error('Track not found');
    }

    for (const entry of trak.mdia.minf.stbl.stsd.entries) {
      const box: MP4Box.Box | undefined =
        entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;

      if (box) {
        const stream = new MP4Box.DataStream(
          undefined,
          0,
          MP4Box.Endianness.BIG_ENDIAN
        );
        box.write(stream);
        return new Uint8Array(stream.buffer, 8); // Remove the box header.
      }
    }

    throw new Error('avcC, hvcC, vpcC, or av1C box not found');
  }

  private initializeDecoder(mp4File: MP4Box.ISOFile, track: MP4Box.Track) {
    if (!track.codec || !('VideoDecoder' in window)) {
      console.error('VideoDecoder not supported or no codec info');
      return;
    }

    // Get codec configuration from track
    // Note: description (SPS/PPS for H.264) may need to be extracted from the track's
    // codec configuration separately if required by the decoder
    console.log('track', track);
    const codecConfig: VideoDecoderConfig = {
      description: this.getDescription(mp4File, track),
      codec: track.codec,
      codedWidth: track.track_width || 0,
      codedHeight: track.track_height || 0,
      // description is optional - some codecs may require it, but MP4Box Track
      // doesn't expose it directly. It may need to be extracted from the file separately.
    };

    // Set canvas size to match video dimensions
    if (track.track_width && track.track_height) {
      this.canvas.width = track.track_width;
      this.canvas.height = track.track_height;
    }

    this.decoder = new VideoDecoder({
      output: (frame: VideoFrame) => {
        // Queue the decoded frame
        this.frameQueue.push(frame);
        // Continue decoding next sample
        this.decodeNextSample();
        // Start rendering if not already started
        if (!this.animationFrameId) {
          this.startTime = performance.now();
          this.render();
        }
      },
      error: (error: Error) => {
        console.error('VideoDecoder error:', error);
      },
    });

    this.decoder.configure(codecConfig);
  }

  private decodeNextSample() {
    if (!this.decoder || this.decoder.state !== 'configured') {
      return;
    }

    if (this.samples.length === 0) {
      return;
    }

    const sample = this.samples.shift();
    if (!sample || !sample.data) {
      return;
    }

    // Create EncodedVideoChunk from sample
    const chunk = new EncodedVideoChunk({
      type: sample.is_sync ? 'key' : 'delta',
      timestamp: sample.dts,
      duration: sample.duration,
      data: sample.data,
    });

    try {
      this.decoder.decode(chunk);
    } catch (error) {
      console.error('Error decoding chunk:', error);
    }
  }

  private async setupVideo() {
    const video = await fetch('/test-video.mp4');
    const videoBlob = await video.blob();

    // this.playVideo(videoBlob);

    const mp4File = MP4Box.createFile();
    const buffer = await videoBlob.arrayBuffer();
    console.log('buffer', buffer);
    mp4File.onSamples = (id, user, samples) => {
      console.log('samples', { id, user, samples });
      this.enqueueSamples(samples);
      this.render();
    };

    mp4File.onReady = (info) => {
      console.log('info', info);
      let found = false;
      for (const track of info.tracks) {
        if (track?.id == 1) {
          this.trackInfo = track;
          mp4File.setExtractionOptions(track.id);
          this.initializeDecoder(mp4File, track);
          found = true;
        }
      }

      if (found === false) {
        console.log('Track id 1 not found in file');
      }

      console.log('starting mp4File');
      mp4File.start();
    };

    mp4File.onError = (error) => {
      console.error('mp4File error', error);
    };

    mp4File.onSegment = (segment) => {
      console.log('segment', segment);
    };

    // Cast buffer to MP4BoxBuffer type
    const mp4Buffer = buffer as MP4Box.MP4BoxBuffer;
    mp4Buffer.fileStart = 0;
    mp4File.appendBuffer(mp4Buffer);
    mp4File.flush();
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
    // Draw the next frame from the queue if available
    if (this.frameQueue.length > 0) {
      const frame = this.frameQueue.shift();
      if (frame) {
        // Draw the VideoFrame to canvas
        this.ctx.drawImage(frame, 0, 0, this.canvas.width, this.canvas.height);
        // Close the frame to free resources
        frame.close();
      }
    }

    // Continue decoding samples
    this.decodeNextSample();

    // Continue rendering loop
    this.animationFrameId = requestAnimationFrame(this.render);

    // If we're out of samples and frames, check again after a delay
    if (this.samples.length === 0 && this.frameQueue.length === 0) {
      setTimeout(() => {
        if (this.samples.length > 0 || this.frameQueue.length > 0) {
          this.render();
        }
      }, 16); // ~60fps check interval
    }
  };

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Close all queued frames
    while (this.frameQueue.length > 0) {
      const frame = this.frameQueue.shift();
      frame?.close();
    }

    // Close decoder
    if (this.decoder) {
      if (this.decoder.state === 'configured') {
        this.decoder.flush();
      }
      this.decoder.close();
      this.decoder = null;
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
