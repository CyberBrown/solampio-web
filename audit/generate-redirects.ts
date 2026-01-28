#!/usr/bin/env bun
import data from './url-mapping.json';

interface Redirect {
  old_url: string;
  new_url: string;
  source_type: string;
}

const redirects = data as Redirect[];

// Generate redirect rules for URLs that changed
const rules = redirects
  .filter(r => r.old_url !== r.new_url)
  .map(r => `${r.old_url} ${r.new_url} 301`)
  .join('\n');

console.log(rules);
