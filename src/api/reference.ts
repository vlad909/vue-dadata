/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios';
import {
  GeolocatePayloadReference,
  GeolocatePayload,
  KLADROrFIASPayloadReference,
  KLADROrFIASPayload,
} from '@/types/Reference';

const BASE_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs';

const getHeaders = (token: string) => ({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Token ${token}`,
  },
});

const getConfig = (token: string, baseUrl: string) => ({
  baseURL: baseUrl,
  ...getHeaders(token),
});

export const getAddressByGeolocate = async ({
  token,
  lat,
  lon,
  baseUrl,
  apiUrl,
  count,
  radius_meters,
  language,
}: GeolocatePayloadReference) => {
  const API_URL = '/geolocate/address';

  baseUrl = baseUrl ?? BASE_URL;
  apiUrl = baseUrl ?? API_URL;
  count = count ?? 10;
  radius_meters = radius_meters ?? 100;
  language = language ?? 'ru';

  const payload: GeolocatePayload = {
    lat,
    lon,
    count,
    radius_meters,
    language,
  };

  try {
    const { data } = await axios.post(
      apiUrl,
      payload,
      getConfig(token, baseUrl),
    );

    return data;
  } catch (error) {
    throw error;
  }
};

export const getAddressByKLADROrFIAS = async ({
  token,
  query,
  baseUrl,
  apiUrl,
  count,
  language,
}: KLADROrFIASPayloadReference) => {
  const API_URL = '/findById/address';

  baseUrl = baseUrl ?? BASE_URL;
  apiUrl = baseUrl ?? API_URL;
  count = count ?? 10;
  language = language ?? 'ru';

  const payload: KLADROrFIASPayload = {
    query,
    count,
    language,
  };

  try {
    const { data } = await axios.post(
      apiUrl,
      payload,
      getConfig(token, baseUrl),
    );

    return data;
  } catch (error) {
    throw error;
  }
};
