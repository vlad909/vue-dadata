export interface BasePayload {
  token: string;
  baseUrl?: string;
  apiUrl?: string;
}

export interface GeolocatePayload {
  lat: string;
  lon: string;
  count?: number;
  radius_meters?: number;
  language?: string;
}

export interface KLADROrFIASPayload {
  query: string;
  count?: number;
  language?: string;
}

export interface GeolocatePayloadReference
  extends GeolocatePayload,
    BasePayload {}

export interface KLADROrFIASPayloadReference
  extends BasePayload,
    KLADROrFIASPayload {}
