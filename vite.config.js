export default {
  base: '/file-uploader/',
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://your-default-api-url.com')
  }
} 