import * as MP4Box from 'mp4box';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private pendingFrame: VideoFrame | null = null;

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

    const decoder = new VideoDecoder({
      output: (frame) => {
        this.renderFrame(frame);
      },
      error: (error) => {
        console.error('VideoDecoder error', error);
      },
    });

    const dataUri = URL.createObjectURL(videoBlob);
    const demuxer = new MP4Demuxer(dataUri, {
      onConfig: (config) => {
        decoder.configure(config);
      },
      onChunk: (chunk) => {
        decoder.decode(chunk);
      },
      onEndOfStream: () => {
        decoder.flush();
      },
    });
  }

  private renderFrame(frame: VideoFrame) {
    if (!this.pendingFrame) {
      requestAnimationFrame(() => this.renderAnimationFrame());
    } else {
      this.pendingFrame.close();
    }

    this.pendingFrame = frame;
  }

  private renderAnimationFrame() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.pendingFrame) {
      return;
    }
    this.ctx.drawImage(
      this.pendingFrame,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    this.pendingFrame.close();
    this.pendingFrame = null;
  }
}

type DemuxerCallbacks = {
  onConfig: (config: VideoDecoderConfig) => void;
  onChunk: (chunk: EncodedVideoChunk) => void;
  onEndOfStream: () => void;
};

class MP4Demuxer {
  private file: MP4Box.ISOFile;
  private callbacks: DemuxerCallbacks;

  constructor(dataUri: string, callbacks: DemuxerCallbacks) {
    this.callbacks = callbacks;
    this.file = MP4Box.createFile();

    this.file.onError = (error) => {
      console.error('MP4Demuxer error', error);
    };
    this.file.onReady = (info) => {
      this.onReady(info);
    };

    this.file.onSamples = (id, user, samples) => {
      this.onSamples(id, user, samples);
    };

    const fileSink = new MP4FileSink(this.file, this.callbacks.onEndOfStream);
    fetch(dataUri).then((response) => {
      response.body?.pipeTo(new WritableStream(fileSink, { highWaterMark: 2 }));
    });
  }

  private onReady(info: MP4Box.Movie) {
    const track = info.videoTracks[0];

    if (!track) {
      throw new Error('No video track found');
    }

    this.callbacks.onConfig({
      codec: track.codec.startsWith('vp08') ? 'vp8' : track.codec,
      codedHeight: track.video?.height,
      codedWidth: track.video?.width,
      description: this.getDescription(track) as AllowSharedBufferSource,
    });
  }

  private onSamples(_id: number, _user: unknown, samples: MP4Box.Sample[]) {
    for (const sample of samples) {
      if (!sample.data) {
        continue;
      }

      this.callbacks.onChunk(
        new EncodedVideoChunk({
          type: sample.is_sync ? 'key' : 'delta',
          timestamp: (1e6 * sample.cts) / sample.timescale,
          duration: (1e6 * sample.duration) / sample.timescale,
          data: sample.data,
        })
      );
    }
  }

  private getDescription(track: MP4Box.Track) {
    const trak = this.file.getTrackById(track.id);

    if (!trak) {
      throw new Error('Track not found');
    }

    for (const entry of trak.mdia.minf.stbl.stsd.entries) {
      console.log(entry);
      const box: MP4Box.Box | undefined = entry.boxes?.[0];

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
}

class MP4FileSink {
  private offset = 0;

  constructor(
    private file: MP4Box.ISOFile,
    private onEndOfStream: () => void
  ) {}

  public write(chunk: Uint8Array) {
    const buffer = new MP4Box.MP4BoxBuffer(chunk.byteLength);
    new Uint8Array(buffer).set(chunk);
    buffer.fileStart = this.offset;
    this.offset += chunk.byteLength;

    this.file.appendBuffer(buffer);
  }

  close() {
    this.file.flush();
    this.onEndOfStream();
  }
}
