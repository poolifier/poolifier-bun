module.exports = {
  '**/*.{ts,tsx,js,jsx,cjs,mjs}': [
    'biome format --write',
    'eslint --cache --fix'
  ],
  '**/!(package.json)*.json': ['biome format --write'],
  '**/*.{md,yml,yaml}': ['prettier --cache --write']
}
