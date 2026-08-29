import { 
  Home,
  MapPin, 
  HeartHandshake, 
  UserRoundSearch, 
  Map, 
  LayoutDashboard, 
  ShieldAlert, 
  Settings, 
  Hospital 
} from "lucide-react";

export const WARKARI_NAV_ITEMS = [
  {
    name: "मुख्यपृष्ठ",
    label: "Home",
    path: "/app",
    icon: Home,
  },
  {
    name: "पालखी ट्रॅकिंग",
    label: "Palkhi Track",
    path: "/app/palkhi",
    icon: MapPin,
  },
  {
    name: "आरोग्य सेवा",
    label: "Medical",
    path: "/app/medical",
    icon: HeartHandshake,
  },
  {
    name: "हरवलेले व्यक्ती",
    label: "Missing",
    path: "/app/missing-person",
    icon: UserRoundSearch,
  },
];

export const AUTHORITY_NAV_ITEMS = [
  {
    name: "Control Board",
    path: "/authority",
    icon: LayoutDashboard,
  },
  {
    name: "Telemetry Map",
    path: "/authority/map",
    icon: MapPin,
  },
  {
    name: "Missing Registry",
    path: "/authority/missing-persons",
    icon: ShieldAlert,
  },
];

export const STORAGE_KEYS = {
  AUTH_ROLE: "warivaani_auth_role",
  AUTH_USER: "warivaani_auth_user",
};
