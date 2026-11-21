// Configuración de ESLint: revisa la calidad del código en la etapa "build" del pipeline.
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'coverage/', 'reportes/', '_site/'] },
  js.configs.recommended,
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
    },
  },
  {
    files: ['tests/**/*.js', '*.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
  {
    rules: {
      // Permite quitar un campo con { campo, ...resto } (así se elimina el hash de la contraseña).
      'no-unused-vars': ['error', { ignoreRestSiblings: true }],
      // Prohíbe eval y similares (riesgo de inyección de código).
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
    },
  },
];
