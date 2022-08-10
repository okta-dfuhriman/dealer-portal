import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

const defaultConfig = {
	plugins: [react(), svgr(), tsconfigPaths()],
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	if (mode === 'preview') {
		return {
			...defaultConfig,
			build: {
				minify: false,
				target: 'esnext',
			},
		};
	}

	if (mode !== 'production') {
		return {
			...defaultConfig,
			server: {
				port: parseInt(process.env.PORT) || 3000,
			},
		};
	}

	return defaultConfig;
});
