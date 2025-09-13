declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string,
      config?: {
        page_path?: string;
        page_title?: string;
        page_location?: string;
        event_category?: string;
        event_label?: string;
        value?: number;
        non_interaction?: boolean;
        custom_map?: Record<string, string>;
      }
    ) => void;
  }
}

export {};






