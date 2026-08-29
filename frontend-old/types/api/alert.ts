export interface AlertItem {
  id: number;
  title: string;
  message: string;
  severity: "warning" | "critical" | "info";
  location?: string;
  updated_at: string;
  active: boolean;
}
