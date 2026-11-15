import { FilesetResolver, PoseLandmarker, type PoseLandmarkerResult } from "@mediapipe/tasks-vision";

export const VERSI_MEDIAPIPE = "0.10.14";
export const URL_WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSI_MEDIAPIPE}/wasm`;

export type VarianModel = "lite" | "full" | "heavy";
export type Delegasi = "GPU" | "CPU";

export const URL_MODEL: Record<VarianModel, string> = {
  lite: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
  full: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
  heavy: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task",
};

export type MesinPose = {
  readonly model: VarianModel;
  readonly delegasi: Delegasi;
  deteksi(video: HTMLVideoElement, t: number): PoseLandmarkerResult;
  tutup(): void;
};

let fileset: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>> | null = null;

export async function buatMesinPose(opsi: { model?: VarianModel; delegasi?: Delegasi; jumlahOrang?: number } = {}): Promise<MesinPose> {
  const model = opsi.model ?? "full";
  const delegasiAwal = opsi.delegasi ?? "GPU";
  fileset ??= await FilesetResolver.forVisionTasks(URL_WASM);

  const buat = (delegate: Delegasi) =>
    PoseLandmarker.createFromOptions(fileset!, {
      baseOptions: { modelAssetPath: URL_MODEL[model], delegate },
      runningMode: "VIDEO",
      numPoses: opsi.jumlahOrang ?? 2,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

  let delegasi: Delegasi = delegasiAwal;
  let landmarker: PoseLandmarker;
  try {
    landmarker = await buat(delegasiAwal);
  } catch (e) {
    if (delegasiAwal !== "GPU") throw e;
    delegasi = "CPU";
    landmarker = await buat("CPU");
  }

  return {
    model,
    delegasi,
    deteksi: (video, t) => landmarker.detectForVideo(video, t),
    tutup: () => landmarker.close(),
  };
}

/** urutan penurunan model jika FPS terlalu rendah. */
export const MODEL_LEBIH_RINGAN: Record<VarianModel, VarianModel | null> = { heavy: "full", full: "lite", lite: null };
