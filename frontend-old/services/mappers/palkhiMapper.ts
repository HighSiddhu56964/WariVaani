import { PalkhiResponse } from "../../types/api/palkhi";
import { PalkhiLocation } from "../../types";

export function mapPalkhiResponseToLocation(response: PalkhiResponse): PalkhiLocation {
  const isDnyaneshwar = response.name.includes("Dnyaneshwar") || response.saint.includes("Dnyaneshwar");
  
  return {
    id: String(response.id),
    name: response.name,
    saint: response.saint,
    currentPlace: response.current_checkpoint,
    lat: response.lat,
    lng: response.lng,
    lastUpdated: response.last_updated,
    warkariCount: isDnyaneshwar ? 450000 : 380000,
    contactNo: isDnyaneshwar ? "+91 98765 43210" : "+91 98765 43211",
    routeName: isDnyaneshwar ? "आळंदी ते पंढरपूर (Alandi to Pandharpur)" : "देहू ते पंढरपूर (Dehu to Pandharpur)",
    speed: response.speed || "Walking (4 km/h)",
    nextHalt: response.next_checkpoint,
  };
}
export function mapPalkhisList(list: PalkhiResponse[]): PalkhiLocation[] {
  return list.map(mapPalkhiResponseToLocation);
}
