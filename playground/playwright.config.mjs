export default {
  testDir: './tests',
  webServer: { command: 'npm run preview -- --port 4322 --ignore-lock', port: 4322, reuseExistingServer: true },
  use: { baseURL: 'http://localhost:4322' },
}
