import path from 'path';
import { parseSitemap } from './sitemap.mjs';

const site = process.env.SITE.split(',')[0].trim();
export const urls = await parseSitemap(site);

const buildDirectory = 'compare';
export const baseDirectory = path.join(process.cwd(), buildDirectory);
