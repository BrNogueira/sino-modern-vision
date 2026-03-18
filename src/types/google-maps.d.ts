/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace google.maps {
  class Map {
    constructor(element: HTMLElement, options: any);
  }
  class Marker {
    constructor(options: any);
    addListener(event: string, handler: () => void): void;
    setAnimation(animation: any): void;
  }
  class InfoWindow {
    constructor(options: any);
    open(map: Map, marker: Marker): void;
  }
  const Animation: {
    BOUNCE: any;
    DROP: any;
  };
}

interface Window {
  google: typeof google;
}
