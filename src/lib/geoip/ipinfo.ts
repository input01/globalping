import got from 'got';
import config from 'config';
import {getContinentByCountry} from '../location/location.js';
import {LocationInfo, normalizeCityName} from './client.js';

type IpinfoResponse = {
	country: string;
	city: string;
	region: string;
	org: string;
	loc: string;
};

export const ipinfoLookup = async (addr: string): Promise<LocationInfo> => {
	const result = await got(`https://ipinfo.io/${addr}`, {
		username: config.get<string>('ipinfo.apiKey'),
		timeout: {request: 5000},
	}).json<IpinfoResponse>();

	const [lat, lon] = result.loc.split(',');
	const match = /^AS(\d+)/.exec(result.org);
	const parsedAsn = match?.[1] ? Number(match[1]) : null;

	return {
		continent: getContinentByCountry(result.country),
		state: undefined,
		country: result.country,
		city: normalizeCityName(result.city),
		asn: parsedAsn!,
		latitude: Number(lat),
		longitude: Number(lon),
	};
};