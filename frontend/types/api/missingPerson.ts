export interface MissingPersonCreate {
  name: string;
  age: number;
  gender: string;
  description?: string;
  clothing?: string;
  last_seen: string;
  last_seen_time?: string;
  phone_number: string;
  contact_person: string;
}

export interface MissingPersonUpdate {
  name?: string;
  age?: number;
  gender?: string;
  description?: string;
  clothing?: string;
  last_seen?: string;
  last_seen_time?: string;
  phone_number?: string;
  contact_person?: string;
  status?: "Missing" | "Found" | "In Progress";
}

export interface MissingPersonResponse {
  id: string;
  ticket_id: string;
  name: string;
  age: number;
  gender: string;
  description?: string;
  clothing?: string;
  last_seen: string;
  last_seen_time?: string;
  phone_number: string;
  contact_person: string;
  status: string;
  created_at: string;
}
