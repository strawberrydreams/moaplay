declare global {
  interface Window {
    naver: {
      maps: {
        Map: any;
        Marker: any;
        LatLng: any;
        Size: any;
        Point: any;
        InfoWindow: any;
        Event: {
          addListener: (target: any, type: string, listener: () => void) => void;
        };
        Service: {
          geocode: (options: any, callback: (status: ServiceStatus, response: GeocodeResponse) => void) => void;
          Status: {
            OK: string;
          };
        };
        MapTypeControlStyle: {
          BUTTON: string;
        };
        Position: {
          TOP_RIGHT: string;
          RIGHT_CENTER: string;
        };
        ZoomControlStyle: {
          SMALL: string;
        };
      };
    };
  }

  type ServiceStatus = string;
  
  interface GeocodeResponse {
    result: {
      items: Array<{
        point: {
          x: number;
          y: number;
        };
      }>;
    };
  }

  type LatLng = any;
}

export interface MapInitError {
  type: 'API_NOT_LOADED' | 'CONTAINER_NOT_FOUND' | 'UNKNOWN';
  message: string;
  originalError?: Error;
}

export {};
