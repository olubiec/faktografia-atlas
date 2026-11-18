import { useEffect, useRef } from "react";
import {
  createCameraDriver,
  type CameraDriver,
  type DriverMap,
} from "../../../core/map/camera-driver";
import type { ViewState } from "../../../core/map/view";

type Options = {
  map: DriverMap | null;
  onFrame?: (view: ViewState) => void;
  onEnd?: () => void;
};

/** Zwraca sterownik kamery (jeden rAF, bez stanu Reacta) albo null przed mapą. */
export function useCameraDriver({ map, onFrame, onEnd }: Options) {
  const driverRef = useRef<CameraDriver | null>(null);
  const cbRef = useRef({ onFrame, onEnd });

  useEffect(() => {
    cbRef.current = { onFrame, onEnd };
  });

  useEffect(() => {
    if (!map) return;
    const driver = createCameraDriver({
      map,
      clock: {
        now: () => performance.now(),
        schedule: (cb) => {
          const id = requestAnimationFrame(cb);
          return () => cancelAnimationFrame(id);
        },
      },
      onFrame: (v) => cbRef.current.onFrame?.(v),
      onEnd: () => cbRef.current.onEnd?.(),
    });
    driverRef.current = driver;
    return () => {
      driver.cancel();
      driverRef.current = null;
    };
  }, [map]);

  return driverRef;
}
